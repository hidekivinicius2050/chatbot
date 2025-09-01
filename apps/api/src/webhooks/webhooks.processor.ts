import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../auth/crypto.service';
import { EventsService } from './events.service';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';

interface FanoutJobData {
  eventId: string;
  companyId: string;
  eventKey: string;
}

interface DeliveryJobData {
  eventId: string;
  endpointId: string;
  attempt: number;
}

@Processor('webhooks')
@Injectable()
export class WebhooksProcessor {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private eventsService: EventsService,
    private configService: ConfigService,
    @InjectQueue('webhooks') private webhooksQueue: Queue,
  ) {}

  @Process('fanout')
  async processFanout(job: Job<FanoutJobData>): Promise<void> {
    const { eventId, companyId, eventKey } = job.data;
    
    this.logger.debug(`Processando fanout para evento ${eventId}`);

    try {
      // Buscar endpoints ativos que casem com o evento
      const endpoints = await this.prisma.webhookEndpoint.findMany({
        where: {
          companyId,
          enabled: true,
        },
        include: {
          installation: true,
        },
      });

      const matchingEndpoints = endpoints.filter(endpoint =>
        endpoint.events.some(pattern => 
          this.eventsService.matchesPattern(eventKey, pattern)
        )
      );

      this.logger.debug(`Encontrados ${matchingEndpoints.length} endpoints para evento ${eventKey}`);

      // Criar jobs de delivery para cada endpoint
      for (const endpoint of matchingEndpoints) {
        const idempotencyKey = `${eventId}-${endpoint.id}`;
        
        // Verificar se já existe delivery para este evento/endpoint
        const existing = await this.prisma.webhookDelivery.findUnique({
          where: {
            endpointId_eventId: {
              endpointId: endpoint.id,
              eventId,
            },
          },
        });

        if (!existing) {
          // Criar registro de delivery
          await this.prisma.webhookDelivery.create({
            data: {
              companyId,
              endpointId: endpoint.id,
              eventId,
              idempotencyKey,
              status: 'pending',
            },
          });

          // Enfileirar job de delivery
          await this.webhooksQueue.add('deliver', {
            eventId,
            endpointId: endpoint.id,
            attempt: 1,
          }, {
            delay: 0,
            attempts: 1, // Não usar retry do Bull, fazemos manual
          });
        }
      }

      // Marcar evento como processado
      await this.eventsService.markEventProcessed(eventId);

    } catch (error) {
      this.logger.error(`Erro no fanout do evento ${eventId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : '');
      throw error;
    }
  }

  @Process('deliver')
  async processDelivery(job: Job<DeliveryJobData>): Promise<void> {
    const { eventId, endpointId, attempt } = job.data;
    
    this.logger.debug(`Tentativa ${attempt} de delivery: evento ${eventId} → endpoint ${endpointId}`);

    try {
      // Buscar dados do evento e endpoint
      const [event, endpoint] = await Promise.all([
        this.prisma.outboundEvent.findUnique({
          where: { id: eventId },
        }),
        this.prisma.webhookEndpoint.findUnique({
          where: { id: endpointId },
          include: { installation: true },
        }),
      ]);

      if (!event || !endpoint) {
        this.logger.warn(`Evento ou endpoint não encontrado: ${eventId}/${endpointId}`);
        return;
      }

      // Montar payload padronizado
      const payload = {
        id: eventId,
        type: event.key,
        companyId: event.companyId,
        occurredAt: event.createdAt.toISOString(),
        data: event.payload,
      };

      const payloadJson = JSON.stringify(payload);
      const timestamp = Math.floor(Date.now() / 1000).toString();
      
      // Descriptografar secret se existir
      let secret = '';
      if (endpoint.secretEnc) {
        try {
          secret = this.cryptoService.decrypt(endpoint.secretEnc);
        } catch (error) {
          this.logger.warn(`Erro ao descriptografar secret do endpoint ${endpointId}`);
        }
      }

      // Gerar assinatura HMAC
      const signature = this.generateSignature(payloadJson, secret, timestamp);

      const headers = {
        'Content-Type': 'application/json',
        [this.configService.get('WEBHOOK_TIMESTAMP_HEADER', 'X-Atendechat-Timestamp')]: timestamp,
        [this.configService.get('WEBHOOK_IDEMPOTENCY_HEADER', 'X-Atendechat-Idempotency')]: eventId,
        [this.configService.get('WEBHOOK_SIGNING_HEADER', 'X-Atendechat-Signature')]: signature,
      };

      const timeout = this.configService.get('WEBHOOK_TIMEOUT_MS', 8000);
      const allowHttp = this.configService.get('WEBHOOK_ALLOW_HTTP', 'false') === 'true';

      // Validar URL
      if (!allowHttp && !endpoint.url.startsWith('https://')) {
        throw new Error('HTTPS obrigatório em produção');
      }

      // Validar domínio se configurado
      const allowlist = this.configService.get('WEBHOOK_DOMAIN_ALLOWLIST', '');
      if (allowlist) {
        const allowedDomains = allowlist.split(',').map((d: string) => d.trim());
        const url = new URL(endpoint.url);
        if (!allowedDomains.includes(url.hostname)) {
          throw new Error(`Domínio não permitido: ${url.hostname}`);
        }
      }

      const startTime = Date.now();

      // Fazer requisição HTTP
      const response = await axios.post(endpoint.url, payload, {
        headers,
        timeout,
        validateStatus: () => true, // Não lançar erro para status HTTP
      });

      const durationMs = Date.now() - startTime;
      const httpStatus = response.status;

      // Determinar status final
      let status: string;
      let nextAttemptAt: Date | null = null;
      let error: string | null = null;

      if (httpStatus >= 200 && httpStatus < 300) {
        status = 'ok';
      } else if (httpStatus === 410) {
        // Gone - desabilitar endpoint
        status = 'skipped';
        await this.prisma.webhookEndpoint.update({
          where: { id: endpointId },
          data: { enabled: false },
        });
        this.logger.warn(`Endpoint ${endpointId} desabilitado (410 Gone)`);
      } else if (httpStatus === 429 || httpStatus >= 500) {
        // Retry para 429 e 5xx
        const maxRetries = this.configService.get('WEBHOOK_MAX_RETRIES', 8);
        if (attempt < maxRetries) {
          status = 'pending';
          nextAttemptAt = this.calculateNextAttempt(attempt);
          error = `HTTP ${httpStatus}: ${response.statusText}`;
          
          // Agendar próxima tentativa
          await this.webhooksQueue.add('deliver', {
            eventId,
            endpointId,
            attempt: attempt + 1,
          }, {
            delay: nextAttemptAt.getTime() - Date.now(),
            attempts: 1,
          });
        } else {
          status = 'failed';
          error = `Max retries exceeded. Last: HTTP ${httpStatus}`;
        }
      } else {
        // Outros 4xx - falha sem retry
        status = 'failed';
        error = `HTTP ${httpStatus}: ${response.statusText}`;
      }

      // Atualizar registro de delivery
      await this.prisma.webhookDelivery.update({
        where: {
          endpointId_eventId: {
            endpointId,
            eventId,
          },
        },
        data: {
          attempt,
          status,
          httpStatus,
          durationMs,
          error,
          signature,
          nextAttemptAt,
          deliveredAt: status === 'ok' ? new Date() : null,
        },
      });

      this.logger.debug(`Delivery ${status}: ${httpStatus} em ${durationMs}ms`);

    } catch (error) {
      this.logger.error(`Erro no delivery ${eventId}/${endpointId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : '');

      // Atualizar com erro
      await this.prisma.webhookDelivery.update({
        where: {
          endpointId_eventId: {
            endpointId,
            eventId,
          },
        },
        data: {
          attempt,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  private generateSignature(payload: string, secret: string, timestamp: string): string {
    const algo = this.configService.get('WEBHOOK_SIGNING_ALGO', 'hmac-sha256');
    const data = `${timestamp}.${payload}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return `v1=${hmac.digest('hex')}`;
  }

  private calculateNextAttempt(attempt: number): Date {
    const baseMs = this.configService.get('WEBHOOK_BACKOFF_BASE_MS', 2000);
    const jitterMs = this.configService.get('WEBHOOK_JITTER_MS', 400);
    
    // Exponential backoff: base * 2^(attempt-1) + jitter
    const backoffMs = baseMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * jitterMs;
    
    return new Date(Date.now() + backoffMs + jitter);
  }
}
