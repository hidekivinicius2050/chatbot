import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

export interface OutboundEventData {
  companyId: string;
  key: string;
  refType: string;
  refId: string;
  payload: any;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('webhooks') private webhooksQueue: Queue,
  ) {}

  async publishEvent(data: OutboundEventData): Promise<void> {
    try {
      // Criar evento outbound
      const event = await this.prisma.outboundEvent.create({
        data: {
          companyId: data.companyId,
          key: data.key,
          refType: data.refType,
          refId: data.refId,
          payload: data.payload,
        },
      });

      this.logger.debug(`Evento criado: ${event.key} para company ${data.companyId}`);

      // Enfileirar job de fanout
      await this.webhooksQueue.add('fanout', {
        eventId: event.id,
        companyId: data.companyId,
        eventKey: data.key,
      });

      this.logger.debug(`Job de fanout enfileirado para evento ${event.id}`);
    } catch (error) {
      this.logger.error(`Erro ao publicar evento: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : '');
      throw error;
    }
  }

  async markEventProcessed(eventId: string): Promise<void> {
    await this.prisma.outboundEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date() },
    });
  }

  // Utilitário para verificar se evento casa com padrão
  matchesPattern(eventKey: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventKey.startsWith(prefix + '.');
    }
    return eventKey === pattern;
  }
}
