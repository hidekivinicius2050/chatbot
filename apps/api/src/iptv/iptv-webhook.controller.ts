import { Controller, Post, Body, Headers, Logger, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IPTVWebhookService, IPTVWebhookPayload } from './iptv-webhook.service';

@ApiTags('IPTV Webhooks')
@Controller('iptv/webhooks')
export class IPTVWebhookController {
  private readonly logger = new Logger(IPTVWebhookController.name);

  constructor(
    private readonly iptvWebhookService: IPTVWebhookService,
  ) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook do sistema IPTV para eventos de usuários' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  async handleIPTVWebhook(
    @Body() payload: IPTVWebhookPayload,
    @Headers() headers: Record<string, string>
  ): Promise<{ status: string; message?: string }> {
    try {
      this.logger.log('Received IPTV webhook');

      // Validação básica do payload
      if (!payload.event || !payload.data) {
        this.logger.warn('Invalid webhook payload');
        return { status: 'error', message: 'Invalid payload' };
      }

      // Validação de assinatura (se implementada)
      const signature = headers['x-iptv-signature'] || headers['x-signature'];
      if (signature) {
        const isValid = this.iptvWebhookService.validateWebhookSignature(
          JSON.stringify(payload),
          signature,
          process.env.IPTV_WEBHOOK_SECRET || 'default-secret'
        );
        
        if (!isValid) {
          this.logger.warn('Invalid webhook signature');
          return { status: 'error', message: 'Invalid signature' };
        }
      }

      // Processa o webhook
      await this.iptvWebhookService.processWebhook(payload);

      this.logger.log(`Webhook processed successfully: ${payload.event}`);
      return { status: 'success' };

    } catch (error) {
      this.logger.error(`Error processing IPTV webhook: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @Get('events/supported')
  @ApiOperation({ summary: 'Lista eventos de webhook suportados' })
  @ApiResponse({ status: 200, description: 'Lista de eventos suportados' })
  async getSupportedEvents(): Promise<{ events: string[] }> {
    return {
      events: this.iptvWebhookService.getSupportedEvents()
    };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Teste de webhook IPTV' })
  @ApiResponse({ status: 200, description: 'Teste executado com sucesso' })
  async testWebhook(): Promise<{ status: string; message: string }> {
    try {
      // Simula um webhook de teste
      const testPayload: IPTVWebhookPayload = {
        event: 'user.created',
        data: {
          username: 'test_user_123',
          status: 'active',
          expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          connections: 1
        },
        timestamp: new Date().toISOString()
      };

      await this.iptvWebhookService.processWebhook(testPayload);

      return {
        status: 'success',
        message: 'Test webhook processed successfully'
      };

    } catch (error) {
      this.logger.error(`Error in test webhook: ${error.message}`);
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}
