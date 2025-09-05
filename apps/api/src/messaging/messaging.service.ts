import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { ChannelsService } from '../channels/channels.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageType } from '../messages/dto/create-message.dto';
import { MessagingProvider, MessagingProviderFactory } from '@atendechat/providers';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private readonly channelsService: ChannelsService,
  ) {}

  /**
   * Envia mensagem via provider configurado
   * 
   * FRONTEND: Deve mostrar:
   * - Status de envio em tempo real (enviando, enviado, erro)
   * - Indicador de progresso
   * - Detalhes da mensagem enviada
   * - Histórico de mensagens enviadas
   * - Status de conectividade do canal
   * - Botão para reenviar em caso de falha
   */
  async sendMessage(sendMessageDto: SendMessageDto, companyId: string): Promise<any> {
    try {
      // Buscar ticket e validar
      const ticket = await this.prisma.ticket.findFirst({
        where: { id: sendMessageDto.ticketId, companyId },
        include: {
          contact: true,
          assignedTo: true,
        },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket não encontrado');
      }

      // Buscar canal ativo
      const channel = await this.channelsService.findByType('whatsapp-cloud', companyId) ||
                     await this.channelsService.findByType('whatsapp-baileys', companyId);

      if (!channel) {
        throw new BadRequestException('Nenhum canal WhatsApp configurado');
      }

      if (channel.status !== 'connected') {
        throw new BadRequestException('Canal não está conectado');
      }

      // Criar a mensagem no banco primeiro
      const message = await this.messagesService.create({
        ...sendMessageDto,
        direction: 'outbound',
      }, companyId);

      this.logger.log(`Mensagem criada no banco: ${message.id}`);

      try {
        // Enviar via provider
        const provider = this.createProvider(channel);
        
        const result = await provider.sendMessage({
          to: ticket.contact.phone,
          content: sendMessageDto.body || '',
          type: this.mapMessageType(sendMessageDto.type),
          ...(sendMessageDto.mediaUrl && { mediaUrl: sendMessageDto.mediaUrl }),
          ...(sendMessageDto.mediaType && { mediaType: sendMessageDto.mediaType }),
          dedupKey: message.id,
        });

        this.logger.log(`Mensagem enviada via provider: ${result.messageId}`);

        // Atualizar a mensagem com o ID do provider
        if (result.messageId) {
          await this.prisma.message.update({
            where: { id: message.id },
            data: { providerMessageId: result.messageId },
          });
        }

        // Atualizar status do canal se necessário
        if (result.success) {
          await this.channelsService.updateStatus(channel.id, 'connected', companyId);
        }

        return {
          success: true,
          messageId: message.id,
          providerMessageId: result.messageId,
          status: result.status,
        };

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Erro ao enviar mensagem via provider: ${errorMessage}`);

        // Marcar mensagem como falha
        await this.prisma.message.update({
          where: { id: message.id },
          data: { 
            body: (message.body || '') + ' [FALHA: ' + errorMessage + ']',
          },
        });

        // Atualizar status do canal se houver erro de conexão
        if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
          await this.channelsService.updateStatus(channel.id, 'disconnected', companyId);
        }

        throw new BadRequestException(`Falha ao enviar mensagem: ${errorMessage}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Erro no serviço de mensageria', errorMessage);
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
   */
  async generateQRCode(channelId: string, companyId: string): Promise<string> {
    try {
      const channel = await this.channelsService.findOne(channelId, companyId);

      if (channel.type !== 'whatsapp-baileys') {
        throw new BadRequestException('QR code só está disponível para canais Baileys');
      }

      if (channel.status === 'connected') {
        throw new BadRequestException('Canal já está conectado');
      }

      const provider = this.createProvider(channel);
      
      // Configura o provider com os dados do canal
      if (provider.connect && channel.config) {
        await provider.connect(channel.config);
      }
      
      if (provider.generateQRCode) {
        const qrCode = await provider.generateQRCode();
        this.logger.log(`QR code gerado para canal: ${channelId}`);
        return qrCode;
      }
      
      throw new Error('Método generateQRCode não disponível para este provider');
          } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Erro ao gerar QR code: ${errorMessage}`);
        throw error;
      }
  }

  /**
   * Conecta canal WhatsApp Cloud
   * 
   * FRONTEND: Deve mostrar:
   * - Status de conexão (conectando, conectado, erro)
   * - Configurações do canal
   * - Teste de conectividade
   * - Logs de eventos de conexão
   * - Botão para desconectar/reconectar
   */
  async connectWhatsAppCloud(channelId: string, companyId: string, config: any): Promise<any> {
    try {
      const channel = await this.channelsService.findOne(channelId, companyId);

      if (channel.type !== 'whatsapp-cloud') {
        throw new BadRequestException('Método só disponível para WhatsApp Cloud');
      }

      // Validar configurações
      if (!config.accessToken || !config.phoneNumberId) {
        throw new BadRequestException('Configurações incompletas');
      }

      // Atualizar configurações do canal
      await this.channelsService.update(channelId, {
        config,
        externalId: config.phoneNumberId,
      }, companyId);

      // Testar conectividade
      const provider = this.createProvider(channel);
      await provider.connect(config);

      // Atualizar status
      await this.channelsService.updateStatus(channelId, 'connected', companyId);

      this.logger.log(`Canal WhatsApp Cloud conectado: ${channelId}`);

      return {
        success: true,
        status: 'connected',
        message: 'Canal conectado com sucesso',
      };

          } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Erro ao conectar WhatsApp Cloud: ${errorMessage}`);
        
        // Marcar canal como desconectado
        await this.channelsService.updateStatus(channelId, 'disconnected', companyId);
        
        throw new BadRequestException(`Falha na conexão: ${errorMessage}`);
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
   */
  async getChannelStatus(channelId: string, companyId: string): Promise<any> {
    try {
      const channel = await this.channelsService.findOne(channelId, companyId);
      
      // Testar conectividade se estiver marcado como conectado
      let isActuallyConnected = false;
      if (channel.status === 'connected') {
        try {
          const provider = this.createProvider(channel);
                  const status = await provider.getStatus();
        isActuallyConnected = status.isConnected;
          
          // Atualizar status se houver discrepância
          if (!isActuallyConnected && channel.status === 'connected') {
            await this.channelsService.updateStatus(channelId, 'disconnected', companyId);
            channel.status = 'disconnected';
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Erro ao verificar status do provider: ${errorMessage}`);
          isActuallyConnected = false;
        }
      }

      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        status: channel.status,
        actuallyConnected: isActuallyConnected,
        lastChecked: new Date().toISOString(),
        config: channel.config,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao obter status do canal: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Cria provider baseado no tipo do canal
   * 
   * FRONTEND: Não exposto diretamente, mas usado internamente
   */
  private createProvider(channel: any): MessagingProvider {
    try {
      const provider = MessagingProviderFactory.create(channel.type, channel.config, this.logger);
      this.logger.log(`Provider criado: ${channel.type}`);
      return provider;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao criar provider: ${errorMessage}`);
      throw new BadRequestException(`Provider não suportado: ${channel.type}`);
    }
  }

  /**
   * Mapeia tipo de mensagem para provider
   * 
   * FRONTEND: Deve mostrar tipos de mensagem com ícones apropriados
   */
  private mapMessageType(type: MessageType): 'text' | 'image' | 'audio' | 'video' | 'document' | 'template' {
    switch (type) {
      case MessageType.TEXT: return 'text';
      case MessageType.IMAGE: return 'image';
      case MessageType.FILE: return 'document';
      default: return 'text';
    }
  }
}
