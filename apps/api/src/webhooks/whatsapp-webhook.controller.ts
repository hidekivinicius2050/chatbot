import { Controller, Post, Body, Headers, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IPTVAutomationService } from '../automations/iptv-automation.service';

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly iptvAutomationService: IPTVAutomationService,
  ) {}

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook do WhatsApp para processar mensagens' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  async handleWhatsAppWebhook(
    @Body() payload: WhatsAppWebhookPayload,
    @Headers() headers: Record<string, string>
  ): Promise<{ status: string; message?: string }> {
    try {
      this.logger.log('Received WhatsApp webhook');

      // Verifica se é um payload válido do WhatsApp
      if (!payload.object || payload.object !== 'whatsapp_business_account') {
        this.logger.warn('Invalid webhook payload');
        return { status: 'error', message: 'Invalid payload' };
      }

      // Processa cada entrada
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await this.processMessages(change.value);
          }
        }
      }

      return { status: 'success' };

    } catch (error) {
      this.logger.error(`Error processing WhatsApp webhook: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Processa mensagens recebidas
   */
  private async processMessages(value: any): Promise<void> {
    try {
      // Processa contatos
      if (value.contacts) {
        for (const contact of value.contacts) {
          this.logger.log(`Contact: ${contact.profile.name} (${contact.wa_id})`);
        }
      }

      // Processa mensagens
      if (value.messages) {
        for (const message of value.messages) {
          if (message.type === 'text' && message.text) {
            await this.processTextMessage(message);
          }
        }
      }

      // Processa status de mensagens
      if (value.statuses) {
        for (const status of value.statuses) {
          this.logger.log(`Message ${status.id} status: ${status.status}`);
        }
      }

    } catch (error) {
      this.logger.error(`Error processing messages: ${error.message}`);
    }
  }

  /**
   * Processa mensagem de texto
   */
  private async processTextMessage(message: any): Promise<void> {
    try {
      const whatsappMessage = {
        from: message.from,
        to: message.to || 'system',
        body: message.text.body,
        timestamp: message.timestamp,
        messageId: message.id,
      };

      this.logger.log(`Processing message from ${whatsappMessage.from}: ${whatsappMessage.body}`);

      // Processa a mensagem com o serviço de automação IPTV
      const wasProcessed = await this.iptvAutomationService.processWhatsAppMessage(whatsappMessage);

      if (wasProcessed) {
        this.logger.log(`Message processed by IPTV automation service`);
      } else {
        this.logger.log(`Message not processed by IPTV automation service`);
      }

    } catch (error) {
      this.logger.error(`Error processing text message: ${error.message}`);
    }
  }

  /**
   * Endpoint para verificação do webhook (GET)
   */
  @Post('whatsapp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificação do webhook do WhatsApp' })
  async verifyWebhook(
    @Body() body: any,
    @Headers() headers: Record<string, string>
  ): Promise<any> {
    try {
      // Aqui você implementaria a verificação do webhook
      // Por exemplo, verificar o token de verificação
      
      this.logger.log('Webhook verification requested');
      
      return {
        status: 'verified',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Error verifying webhook: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }
}
