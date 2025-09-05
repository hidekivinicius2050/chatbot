import { Controller, Get, Post, Body, Query, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * Endpoint de verificação do webhook do WhatsApp Cloud API
   * 
   * FRONTEND: Deve mostrar:
   * - Status de verificação do webhook
   * - Botão para reconfigurar webhook se necessário
   * - Logs de tentativas de verificação
   * - Configurações atuais do webhook
   */
  @Get('whatsapp')
  @ApiOperation({ 
    summary: 'Verificar webhook do WhatsApp',
    description: 'Endpoint para verificação do webhook do WhatsApp Cloud API'
  })
  @ApiQuery({ name: 'hub.mode', description: 'Modo de verificação' })
  @ApiQuery({ name: 'hub.verify_token', description: 'Token de verificação' })
  @ApiQuery({ name: 'hub.challenge', description: 'Desafio para verificação' })
  @ApiResponse({ status: 200, description: 'Webhook verificado com sucesso' })
  @ApiResponse({ status: 401, description: 'Verificação falhou' })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string> {
    this.logger.log(`Tentativa de verificação: mode=${mode}, token=${token ? '***' : 'não fornecido'}`);
    
    try {
      const result = await this.webhooksService.handleVerification(mode, token, challenge);
      this.logger.log('Webhook verificado com sucesso');
      return result;
    } catch (error) {
      this.logger.error('Falha na verificação do webhook', error);
      throw error;
    }
  }

  /**
   * Endpoint para receber mensagens do WhatsApp
   * 
   * FRONTEND: Deve mostrar:
   * - Lista de mensagens recebidas em tempo real
   * - Status de processamento (sucesso/erro)
   * - Contadores de mensagens por canal
   * - Logs de webhook para debugging
   * - Dashboard de atividade do webhook
   * - Configurações de segurança (HMAC)
   */
  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Receber mensagens do WhatsApp',
    description: 'Endpoint para receber mensagens do WhatsApp Cloud API e Baileys'
  })
  @ApiResponse({ status: 200, description: 'Mensagens processadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Assinatura HMAC inválida' })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  async receiveWebhook(
    @Body() payload: any,
    @Headers('x-hub-signature-256') signature?: string,
  ): Promise<{ status: string; message: string }> {
    this.logger.log(`Webhook recebido: ${signature ? 'com assinatura' : 'sem assinatura'}`);
    
    try {
      await this.webhooksService.handleIncomingMessage(payload, signature);
      
      this.logger.log('Webhook processado com sucesso');
      return {
        status: 'success',
        message: 'Mensagens processadas com sucesso',
      };
    } catch (error) {
      this.logger.error('Erro ao processar webhook', error);
      throw error;
    }
  }

  /**
   * Endpoint de status do webhook
   * 
   * FRONTEND: Deve mostrar:
   * - Status de conectividade do webhook
   * - Última verificação realizada
   * - Configurações atuais
   * - Estatísticas de uso
   * - Logs de erro recentes
   */
  @Get('whatsapp/status')
  @ApiOperation({ 
    summary: 'Status do webhook do WhatsApp',
    description: 'Verificar status e configurações do webhook'
  })
  @ApiResponse({ status: 200, description: 'Status do webhook' })
  async getWebhookStatus(): Promise<{
    status: string;
    configured: boolean;
    lastVerification?: string;
    messageCount: number;
    errorCount: number;
  }> {
    const isConfigured = !!(process.env.META_VERIFY_TOKEN && process.env.META_WEBHOOK_SECRET);
    
    return {
      status: isConfigured ? 'configured' : 'not_configured',
      configured: isConfigured,
      lastVerification: new Date().toISOString(),
      messageCount: 0, // TODO: Implementar contadores
      errorCount: 0,   // TODO: Implementar contadores
    };
  }
}
