import { Controller, Post, Body, Param, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('messaging')
@Controller('api/v1/messaging')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MessagingController {
  private readonly logger = new Logger(MessagingController.name);

  constructor(private readonly messagingService: MessagingService) {}

  /**
   * Envia mensagem via provider configurado
   * 
   * FRONTEND: Deve mostrar:
   * - Formulário de envio com campos: ticketId, body, type, mediaUrl (opcional)
   * - Validação em tempo real dos campos
   * - Status de envio (enviando, enviado, erro)
   * - Indicador de progresso
   * - Histórico de mensagens enviadas
   * - Botão para reenviar em caso de falha
   * - Preview da mensagem antes do envio
   */
  @Post('send')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ 
    summary: 'Enviar mensagem',
    description: 'Envia mensagem via provider WhatsApp configurado'
  })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou canal não conectado' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: any,
  ) {
    this.logger.log(`Tentativa de envio de mensagem para ticket: ${sendMessageDto.ticketId}`);
    
    try {
      const result = await this.messagingService.sendMessage(sendMessageDto, req.user.companyId);
      this.logger.log(`Mensagem enviada com sucesso: ${result.messageId}`);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha no envio: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Gera QR code para conexão Baileys
   * 
   * FRONTEND: Deve mostrar:
   * - QR code gerado em tempo real
   * - Status de conexão (gerando, conectando, conectado)
   * - Contador de tempo para expiração
   * - Botão para regenerar QR code
   * - Indicador de status do canal
   * - Logs de eventos de conexão
   * - Instruções para escanear o QR code
   */
  @Get('channels/:channelId/qrcode')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ 
    summary: 'Gerar QR code para Baileys',
    description: 'Gera QR code para conexão do WhatsApp via Baileys'
  })
  @ApiResponse({ status: 200, description: 'QR code gerado' })
  @ApiResponse({ status: 400, description: 'Canal não suporta QR code' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  async generateQRCode(
    @Param('channelId') channelId: string,
    @Request() req: any,
  ) {
    this.logger.log(`Solicitação de QR code para canal: ${channelId}`);
    
    try {
      const qrCode = await this.messagingService.generateQRCode(channelId, req.user.companyId);
      this.logger.log(`QR code gerado com sucesso para canal: ${channelId}`);
      return { qrCode, channelId };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao gerar QR code: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Conecta canal WhatsApp Cloud
   * 
   * FRONTEND: Deve mostrar:
   * - Formulário de configuração com campos: accessToken, phoneNumberId, appId, appSecret
   * - Validação das configurações
   * - Status de conexão (conectando, conectado, erro)
   * - Teste de conectividade
   * - Logs de eventos de conexão
   * - Botão para desconectar/reconectar
   * - Configurações salvas do canal
   */
  @Post('channels/:channelId/connect/cloud')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ 
    summary: 'Conectar WhatsApp Cloud',
    description: 'Conecta canal WhatsApp Cloud com as configurações fornecidas'
  })
  @ApiResponse({ status: 200, description: 'Canal conectado com sucesso' })
  @ApiResponse({ status: 400, description: 'Configurações inválidas' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  async connectWhatsAppCloud(
    @Param('channelId') channelId: string,
    @Body() config: any,
    @Request() req: any,
  ) {
    this.logger.log(`Tentativa de conexão WhatsApp Cloud para canal: ${channelId}`);
    
    try {
      const result = await this.messagingService.connectWhatsAppCloud(channelId, req.user.companyId, config);
      this.logger.log(`Canal WhatsApp Cloud conectado: ${channelId}`);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na conexão WhatsApp Cloud: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Obtém status de conectividade do canal
   * 
   * FRONTEND: Deve mostrar:
   * - Status atual do canal (conectado, desconectado, conectando)
   * - Última verificação de conectividade
   * - Estatísticas de uso
   * - Botões de ação (conectar, desconectar, testar)
   * - Indicador visual de status
   * - Configurações atuais do canal
   */
  @Get('channels/:channelId/status')
  @ApiOperation({ 
    summary: 'Status do canal',
    description: 'Obtém status de conectividade e configurações do canal'
  })
  @ApiResponse({ status: 200, description: 'Status do canal' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  async getChannelStatus(
    @Param('channelId') channelId: string,
    @Request() req: any,
  ) {
    this.logger.log(`Verificação de status para canal: ${channelId}`);
    
    try {
      const status = await this.messagingService.getChannelStatus(channelId, req.user.companyId);
      this.logger.log(`Status obtido para canal: ${channelId} - ${status.status}`);
      return status;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao obter status: ${errorMessage}`);
      throw error;
    }
  }
}
