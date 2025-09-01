import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { ChannelsService } from '../channels/channels.service';
import { createHmac } from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private readonly channelsService: ChannelsService,
  ) {}

  /**
   * Valida webhook do WhatsApp Cloud API usando HMAC SHA256
   * 
   * FRONTEND: Esta validação deve ser feita no backend, mas o frontend deve
   * mostrar indicadores de status de conexão do webhook e logs de validação
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!secret) {
      this.logger.warn('Webhook secret não configurado');
      return false;
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = `sha256=${expectedSignature}` === signature;
    
    if (!isValid) {
      this.logger.warn('Assinatura HMAC inválida', {
        expected: `sha256=${expectedSignature}`,
        received: signature,
      });
    }

    return isValid;
  }

  /**
   * Processa webhook de verificação do WhatsApp Cloud API
   * 
   * FRONTEND: Deve mostrar status de verificação e permitir reconfigurar
   * o webhook se necessário
   */
  async handleVerification(mode: string, token: string, challenge: string): Promise<string> {
    const expectedToken = process.env.META_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === expectedToken) {
      this.logger.log('Webhook verificado com sucesso');
      return challenge;
    }
    
    this.logger.warn('Falha na verificação do webhook', { mode, token });
    throw new UnauthorizedException('Verificação falhou');
  }

  /**
   * Processa mensagens recebidas do WhatsApp
   * 
   * FRONTEND: Deve mostrar:
   * - Lista de mensagens recebidas em tempo real
   * - Status de processamento (sucesso/erro)
   * - Contadores de mensagens por canal
   * - Logs de webhook para debugging
   */
  async handleIncomingMessage(payload: any, signature?: string): Promise<void> {
    try {
      // Validar assinatura se for WhatsApp Cloud
      if (signature && process.env.META_WEBHOOK_SECRET) {
        const isValid = this.validateWebhookSignature(
          JSON.stringify(payload),
          signature,
          process.env.META_WEBHOOK_SECRET
        );
        
        if (!isValid) {
          throw new UnauthorizedException('Assinatura inválida');
        }
      }

      // Extrair mensagens do payload
      const messages = this.extractMessages(payload);
      
      for (const message of messages) {
        await this.processMessage(message);
      }

      this.logger.log(`Processadas ${messages.length} mensagens`);
    } catch (error) {
      this.logger.error('Erro ao processar webhook', error);
      throw error;
    }
  }

  /**
   * Extrai mensagens do payload do webhook
   * 
   * FRONTEND: Deve mostrar estrutura dos dados recebidos para debugging
   */
  private extractMessages(payload: any): any[] {
    const messages: any[] = [];

    // WhatsApp Cloud API
    if (payload.entry) {
      for (const entry of payload.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.value?.messages) {
              messages.push(...change.value.messages);
            }
          }
        }
      }
    }

    // Baileys ou outros providers
    if (payload.messages) {
      messages.push(...payload.messages);
    }

    return messages;
  }

  /**
   * Processa uma mensagem individual
   * 
   * FRONTEND: Deve mostrar:
   * - Status de cada mensagem processada
   * - Detalhes do contato e ticket
   * - Tempo de processamento
   */
  private async processMessage(message: any): Promise<void> {
    try {
      // Buscar canal por número de telefone
      const phoneNumber = this.extractPhoneNumber(message);
      const channel = await this.findChannelByPhone(phoneNumber);

      if (!channel) {
        this.logger.warn(`Canal não encontrado para: ${phoneNumber}`);
        return;
      }

      // Buscar ou criar contato
      const contact = await this.findOrCreateContact(phoneNumber, channel.companyId);

      // Buscar ou criar ticket
      const ticket = await this.findOrCreateTicket(contact.id, channel.companyId);

      // Criar mensagem
      const messageData: any = {
        ticketId: ticket.id,
        body: this.extractMessageContent(message),
        type: this.mapMessageType(message.type),
        direction: 'inbound',
      };

      const mediaUrl = this.extractMediaUrl(message);
      if (mediaUrl) {
        messageData.mediaUrl = mediaUrl;
      }

      await this.messagesService.create(messageData, channel.companyId);

      this.logger.log(`Mensagem processada: ${message.id}`);
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem ${message.id}`, error);
    }
  }

  /**
   * Extrai número de telefone da mensagem
   * 
   * FRONTEND: Deve mostrar números de telefone processados para debugging
   */
  private extractPhoneNumber(message: any): string {
    // WhatsApp Cloud API
    if (message.from) {
      return message.from;
    }

    // Baileys
    if (message.key?.remoteJid) {
      return message.key.remoteJid.replace('@s.whatsapp.net', '');
    }

    throw new BadRequestException('Número de telefone não encontrado');
  }

  /**
   * Busca canal por número de telefone
   * 
   * FRONTEND: Deve mostrar canais disponíveis e status de conexão
   */
  private async findChannelByPhone(phoneNumber: string): Promise<any> {
    // Buscar por externalId (número do telefone)
    const channel = await this.prisma.channel.findFirst({
      where: {
        externalId: phoneNumber,
        status: 'connected',
      },
    });

    if (channel) {
      return channel;
    }

    // Buscar por tipo WhatsApp se não encontrar por número
    const whatsappChannel = await this.prisma.channel.findFirst({
      where: {
        type: { in: ['whatsapp-cloud', 'whatsapp-baileys'] },
        status: 'connected',
      },
    });

    return whatsappChannel;
  }

  /**
   * Busca ou cria contato
   * 
   * FRONTEND: Deve mostrar contatos criados/atualizados
   */
  private async findOrCreateContact(phoneNumber: string, companyId: string): Promise<any> {
    let contact = await this.prisma.contact.findFirst({
      where: {
        phone: phoneNumber,
        companyId,
      },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          phone: phoneNumber,
          name: `Cliente ${phoneNumber}`,
          companyId,
        },
      });
      this.logger.log(`Contato criado: ${contact.id}`);
    }

    return contact;
  }

  /**
   * Busca ou cria ticket
   * 
   * FRONTEND: Deve mostrar tickets criados/atualizados em tempo real
   */
  private async findOrCreateTicket(contactId: string, companyId: string): Promise<any> {
    // Buscar ticket aberto mais recente
    let ticket = await this.prisma.ticket.findFirst({
      where: {
        contactId,
        companyId,
        status: 'open',
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    if (!ticket) {
      ticket = await this.prisma.ticket.create({
        data: {
          contactId,
          companyId,
          status: 'open',
          priority: 'medium',
        },
      });
      this.logger.log(`Ticket criado: ${ticket.id}`);
    }

    return ticket;
  }

  /**
   * Extrai conteúdo da mensagem
   * 
   * FRONTEND: Deve mostrar preview das mensagens recebidas
   */
  private extractMessageContent(message: any): string {
    // WhatsApp Cloud API
    if (message.text?.body) {
      return message.text.body;
    }

    // Baileys
    if (message.message?.conversation) {
      return message.message.conversation;
    }

    if (message.message?.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }

    // Mensagens de mídia
    if (message.message?.imageMessage || message.message?.videoMessage || message.message?.documentMessage) {
      return '[Mídia]';
    }

    return '[Mensagem não suportada]';
  }

  /**
   * Extrai URL da mídia
   * 
   * FRONTEND: Deve mostrar preview de mídia recebida
   */
  private extractMediaUrl(message: any): string | null {
    // WhatsApp Cloud API
    if (message.image?.id) {
      return `https://graph.facebook.com/v18.0/${message.image.id}`;
    }

    if (message.video?.id) {
      return `https://graph.facebook.com/v18.0/${message.video.id}`;
    }

    if (message.document?.id) {
      return `https://graph.facebook.com/v18.0/${message.document.id}`;
    }

    // Baileys - URLs são temporárias
    return null;
  }

  /**
   * Mapeia tipo de mensagem
   * 
   * FRONTEND: Deve mostrar tipos de mensagem com ícones apropriados
   */
  private mapMessageType(messageType: string): string {
    switch (messageType) {
      case 'text':
        return 'text';
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'audio';
      case 'document':
        return 'file';
      default:
        return 'text';
    }
  }
}
