import { Message, Channel, Contact } from '@atendechat/core';

// Interface base para todos os providers de mensageria
export interface MessagingProvider {
  readonly name: string;
  readonly type: string;
  
  // Conectar ao serviço
  connect(config: any): Promise<void>;
  
  // Desconectar
  disconnect(): Promise<void>;
  
  // Verificar status da conexão
  getStatus(): Promise<ProviderStatus>;
  
  // Enviar mensagem
  sendMessage(message: OutboundMessage): Promise<MessageResult>;
  
  // Receber mensagens (webhook)
  handleWebhook(payload: any): Promise<InboundMessage[]>;
  
  // Gerar QR code (para Baileys)
  generateQRCode?(): Promise<string>;
  
  // Verificar se o número está conectado
  isNumberConnected(phoneNumber: string): Promise<boolean>;
}

// Status do provider
export interface ProviderStatus {
  isConnected: boolean;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastActivity?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

// Mensagem de saída
export interface OutboundMessage {
  to: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'template';
  mediaUrl?: string;
  mediaType?: string;
  templateName?: string;
  templateParams?: Record<string, any>;
  dedupKey?: string;
  metadata?: Record<string, any>;
}

// Mensagem de entrada
export interface InboundMessage {
  from: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
  mediaUrl?: string;
  mediaType?: string;
  mediaSize?: number;
  timestamp: Date;
  messageId: string;
  metadata?: Record<string, any>;
}

// Resultado do envio
export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  metadata?: Record<string, any>;
}

// Configuração do WhatsApp Cloud
export interface WhatsAppCloudConfig {
  accessToken: string;
  phoneNumberId: string;
  appId: string;
  appSecret: string;
  verifyToken: string;
  webhookUrl: string;
}

// Configuração do Baileys
export interface BaileysConfig {
  sessionId: string;
  dataPath: string;
  qrTimeout: number;
  retryCount: number;
  usePairingCode: boolean;
}

// Adapter para WhatsApp Cloud
export class WhatsAppCloudProvider implements MessagingProvider {
  readonly name = 'WhatsApp Cloud';
  readonly type = 'whatsapp_cloud';
  
  private config?: WhatsAppCloudConfig;
  private isConnected = false;
  
  async connect(config: WhatsAppCloudConfig): Promise<void> {
    this.config = config;
    // Validação básica das credenciais
    if (!config.accessToken || !config.phoneNumberId) {
      throw new Error('Credenciais inválidas para WhatsApp Cloud');
    }
    
    // Aqui seria feita a validação real com a API do WhatsApp
    this.isConnected = true;
  }
  
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.config = null as any;
  }
  
  async getStatus(): Promise<ProviderStatus> {
    return {
      isConnected: this.isConnected,
      status: this.isConnected ? 'connected' : 'disconnected',
      lastActivity: new Date(),
    };
  }
  
  async sendMessage(message: OutboundMessage): Promise<MessageResult> {
    if (!this.isConnected || !this.config) {
      throw new Error('Provider não conectado');
    }
    
    // Simulação de envio - em produção seria feita chamada real para API do WhatsApp
    const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      messageId,
      status: 'sent',
      metadata: {
        provider: 'whatsapp_cloud',
        timestamp: new Date(),
      },
    };
  }
  
  async handleWebhook(payload: any): Promise<InboundMessage[]> {
    // Simulação de processamento de webhook
    // Em produção, seria feito parsing real do payload do WhatsApp
    const messages: InboundMessage[] = [];
    
    if (payload.entry && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
              for (const msg of change.value.messages) {
                messages.push({
                  from: msg.from,
                  content: msg.text?.body || '',
                  type: this.mapMessageType(msg.type),
                  mediaUrl: msg.image?.link || msg.video?.link || msg.audio?.link || msg.document?.link,
                  mediaType: msg.image?.mime_type || msg.video?.mime_type || msg.audio?.mime_type || msg.document?.mime_type,
                  mediaSize: msg.image?.file_size || msg.video?.file_size || msg.audio?.file_size || msg.document?.file_size,
                  timestamp: new Date(msg.timestamp * 1000),
                  messageId: msg.id,
                  metadata: {
                    provider: 'whatsapp_cloud',
                    originalPayload: msg,
                  },
                });
              }
            }
          }
        }
      }
    }
    
    return messages;
  }
  
  async isNumberConnected(phoneNumber: string): Promise<boolean> {
    // Simulação - em produção seria feita verificação real
    return true;
  }
  
  private mapMessageType(waType: string): 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact' {
    switch (waType) {
      case 'text': return 'text';
      case 'image': return 'image';
      case 'audio': return 'audio';
      case 'video': return 'video';
      case 'document': return 'document';
      case 'location': return 'location';
      case 'contacts': return 'contact';
      default: return 'text';
    }
  }
}

// Adapter para Baileys
export class BaileysProvider implements MessagingProvider {
  readonly name = 'WhatsApp Baileys';
  readonly type = 'whatsapp_baileys';
  
  private config?: BaileysConfig;
  private isConnected = false;
  private qrCode?: string;
  
  async connect(config: BaileysConfig): Promise<void> {
    this.config = config;
    // Em produção, seria feita inicialização real do Baileys
    this.isConnected = false; // Inicialmente desconectado até parear
  }
  
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.config = null as any;
    this.qrCode = null as any;
  }
  
  async getStatus(): Promise<ProviderStatus> {
    return {
      isConnected: this.isConnected,
      status: this.isConnected ? 'connected' : 'connecting',
      lastActivity: new Date(),
      metadata: {
        qrCode: this.qrCode,
      },
    };
  }
  
  async sendMessage(message: OutboundMessage): Promise<MessageResult> {
    if (!this.isConnected) {
      throw new Error('Baileys não está conectado. Pareie o dispositivo primeiro.');
    }
    
    // Simulação de envio
    const messageId = `baileys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      messageId,
      status: 'sent',
      metadata: {
        provider: 'whatsapp_baileys',
        timestamp: new Date(),
      },
    };
  }
  
  async handleWebhook(payload: any): Promise<InboundMessage[]> {
    // Baileys não usa webhooks tradicionais, mas sim eventos de conexão
    // Esta função seria usada para processar mensagens recebidas via eventos
    return [];
  }
  
  async generateQRCode(): Promise<string> {
    if (!this.config) {
      throw new Error('Configuração não encontrada');
    }
    
    // Simulação de geração de QR code
    this.qrCode = `data:image/png;base64,QR_CODE_SIMULADO_${Date.now()}`;
    
    return this.qrCode;
  }
  
  async isNumberConnected(phoneNumber: string): Promise<boolean> {
    return this.isConnected;
  }
}

// Factory para criar providers
export class MessagingProviderFactory {
  static create(type: string, config: any): MessagingProvider {
    switch (type) {
      case 'whatsapp_cloud':
        return new WhatsAppCloudProvider();
      case 'whatsapp_baileys':
        return new BaileysProvider();
      default:
        throw new Error(`Provider não suportado: ${type}`);
    }
  }
  
  static getSupportedTypes(): string[] {
    return ['whatsapp_cloud', 'whatsapp_baileys'];
  }
}
