import {
  MessagingProviderFactory,
  WhatsAppCloudProvider,
  BaileysProvider,
} from './index';

describe('Providers Package', () => {
  describe('MessagingProviderFactory', () => {
    it('should create WhatsApp Cloud provider', () => {
      const provider = MessagingProviderFactory.create('whatsapp_cloud', {});
      expect(provider).toBeInstanceOf(WhatsAppCloudProvider);
      expect(provider.name).toBe('WhatsApp Cloud');
      expect(provider.type).toBe('whatsapp_cloud');
    });

    it('should create Baileys provider', () => {
      const provider = MessagingProviderFactory.create('whatsapp_baileys', {});
      expect(provider).toBeInstanceOf(BaileysProvider);
      expect(provider.name).toBe('WhatsApp Baileys');
      expect(provider.type).toBe('whatsapp_baileys');
    });

    it('should throw error for unsupported provider type', () => {
      expect(() => {
        MessagingProviderFactory.create('unsupported', {});
      }).toThrow('Provider não suportado: unsupported');
    });

    it('should return supported types', () => {
      const types = MessagingProviderFactory.getSupportedTypes();
      expect(types).toContain('whatsapp_cloud');
      expect(types).toContain('whatsapp_baileys');
      expect(types).toHaveLength(2);
    });
  });

  describe('WhatsAppCloudProvider', () => {
    let provider: WhatsAppCloudProvider;

    beforeEach(() => {
      provider = new WhatsAppCloudProvider();
    });

    it('should have correct name and type', () => {
      expect(provider.name).toBe('WhatsApp Cloud');
      expect(provider.type).toBe('whatsapp_cloud');
    });

    it('should connect with valid config', async () => {
      const config = {
        accessToken: 'valid_token',
        phoneNumberId: 'valid_id',
        appId: 'app_id',
        appSecret: 'app_secret',
        verifyToken: 'verify_token',
        webhookUrl: 'https://example.com/webhook',
      };

      await expect(provider.connect(config)).resolves.not.toThrow();
    });

    it('should throw error with invalid config', async () => {
      const config = {
        accessToken: '',
        phoneNumberId: '',
      };

      await expect(provider.connect(config)).rejects.toThrow(
        'Credenciais inválidas para WhatsApp Cloud',
      );
    });

    it('should disconnect successfully', async () => {
      await expect(provider.disconnect()).resolves.not.toThrow();
    });

    it('should get status', async () => {
      const status = await provider.getStatus();
      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('lastActivity');
    });

    it('should send message when connected', async () => {
      // Primeiro conectar
      await provider.connect({
        accessToken: 'valid_token',
        phoneNumberId: 'valid_id',
        appId: 'app_id',
        appSecret: 'app_secret',
        verifyToken: 'verify_token',
        webhookUrl: 'https://example.com/webhook',
      });

      const message = {
        to: '5511999999999',
        content: 'Test message',
        type: 'text' as const,
      };

      const result = await provider.sendMessage(message);
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.status).toBe('sent');
    });

    it('should throw error when sending message without connection', async () => {
      const message = {
        to: '5511999999999',
        content: 'Test message',
        type: 'text' as const,
      };

      await expect(provider.sendMessage(message)).rejects.toThrow(
        'Provider não conectado',
      );
    });

    it('should handle webhook payload', async () => {
      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      id: 'msg_123',
                      from: '5511999999999',
                      text: { body: 'Hello' },
                      type: 'text',
                      timestamp: Math.floor(Date.now() / 1000),
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const messages = await provider.handleWebhook(payload);
      expect(messages).toHaveLength(1);
      expect(messages[0].from).toBe('5511999999999');
      expect(messages[0].content).toBe('Hello');
      expect(messages[0].type).toBe('text');
    });

    it('should check if number is connected', async () => {
      const isConnected = await provider.isNumberConnected('5511999999999');
      expect(typeof isConnected).toBe('boolean');
    });
  });

  describe('BaileysProvider', () => {
    let provider: BaileysProvider;

    beforeEach(() => {
      provider = new BaileysProvider();
    });

    it('should have correct name and type', () => {
      expect(provider.name).toBe('WhatsApp Baileys');
      expect(provider.type).toBe('whatsapp_baileys');
    });

    it('should connect with config', async () => {
      const config = {
        sessionId: 'session_123',
        dataPath: '/tmp/baileys',
        qrTimeout: 60000,
        retryCount: 3,
        usePairingCode: false,
      };

      await expect(provider.connect(config)).resolves.not.toThrow();
    });

    it('should disconnect successfully', async () => {
      await expect(provider.disconnect()).resolves.not.toThrow();
    });

    it('should get status', async () => {
      const status = await provider.getStatus();
      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('lastActivity');
    });

    it('should generate QR code', async () => {
      // Primeiro conectar
      await provider.connect({
        sessionId: 'session_123',
        dataPath: '/tmp/baileys',
        qrTimeout: 60000,
        retryCount: 3,
        usePairingCode: false,
      });

      const qrCode = await provider.generateQRCode();
      expect(qrCode).toContain('data:image/png;base64');
    });

    it('should throw error when generating QR without config', async () => {
      await expect(provider.generateQRCode()).rejects.toThrow(
        'Configuração não encontrada',
      );
    });

    it('should throw error when sending message without connection', async () => {
      const message = {
        to: '5511999999999',
        content: 'Test message',
        type: 'text' as const,
      };

      await expect(provider.sendMessage(message)).rejects.toThrow(
        'Baileys não está conectado. Pareie o dispositivo primeiro.',
      );
    });

    it('should check if number is connected', async () => {
      const isConnected = await provider.isNumberConnected('5511999999999');
      expect(typeof isConnected).toBe('boolean');
    });
  });
});
