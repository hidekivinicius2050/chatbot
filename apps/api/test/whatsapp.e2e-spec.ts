import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WhatsApp Providers (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Fazer login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@test.com',
        password: '123456',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/channels (GET)', () => {
    it('should return empty channels list for new company', () => {
      return request(app.getHttpServer())
        .get('/api/v1/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });

    it('should create a new WhatsApp Cloud channel', () => {
      return request(app.getHttpServer())
        .post('/api/v1/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'WhatsApp Cloud Test',
          type: 'whatsapp-cloud',
          externalId: 'test-phone-id',
          config: {
            accessToken: 'test-token',
            phoneNumberId: 'test-phone-id',
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('WhatsApp Cloud Test');
          expect(res.body.type).toBe('whatsapp-cloud');
          expect(res.body.status).toBe('disconnected');
        });
    });

    it('should create a new WhatsApp Baileys channel', () => {
      return request(app.getHttpServer())
        .post('/api/v1/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'WhatsApp Baileys Test',
          type: 'whatsapp-baileys',
          config: {
            sessionId: 'test-session',
            dataPath: './sessions',
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('WhatsApp Baileys Test');
          expect(res.body.type).toBe('whatsapp-baileys');
          expect(res.body.status).toBe('disconnected');
        });
    });
  });

  describe('/api/v1/channels/:id (GET)', () => {
    let channelId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Channel',
          type: 'whatsapp-cloud',
        });

      channelId = response.body.id;
    });

    it('should return channel by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/channels/${channelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(channelId);
          expect(res.body.name).toBe('Test Channel');
        });
    });

    it('should return 404 for non-existent channel', () => {
      return request(app.getHttpServer())
        .get('/api/v1/channels/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/api/v1/channels/:id/status (GET)', () => {
    let channelId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/channels')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Status Test Channel',
          type: 'whatsapp-cloud',
        });

      channelId = response.body.id;
    });

    it('should return channel status', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/channels/${channelId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(channelId);
          expect(res.body.status).toBeDefined();
          expect(res.body.actuallyConnected).toBeDefined();
        });
    });
  });

  describe('/api/v1/messaging/send (POST)', () => {
    let ticketId: string;

    beforeAll(async () => {
      // Buscar um ticket existente
      const response = await request(app.getHttpServer())
        .get('/api/v1/tickets')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.body.items && response.body.items.length > 0) {
        ticketId = response.body.items[0].id;
      } else {
        // Criar um ticket se não existir
        const ticketResponse = await request(app.getHttpServer())
          .post('/api/v1/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            contactId: 'contact-1', // Usar contato do seed
            priority: 'medium',
          });

        ticketId = ticketResponse.body.id;
      }
    });

    it('should fail to send message without connected channel', () => {
      return request(app.getHttpServer())
        .post('/api/v1/messaging/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketId,
          body: 'Test message',
          type: 'text',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Nenhum canal WhatsApp configurado');
        });
    });
  });

  describe('/api/v1/webhooks/whatsapp/status (GET)', () => {
    it('should return webhook status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/webhooks/whatsapp/status')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.configured).toBeDefined();
          expect(res.body.messageCount).toBeDefined();
          expect(res.body.errorCount).toBeDefined();
        });
    });
  });

  describe('/api/v1/webhooks/whatsapp (GET)', () => {
    it('should handle webhook verification', () => {
      return request(app.getHttpServer())
        .get('/api/v1/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'invalid-token',
          'hub.challenge': 'test-challenge',
        })
        .expect(401);
    });
  });

  describe('/api/v1/webhooks/whatsapp (POST)', () => {
    it('should handle incoming webhook without signature', () => {
      return request(app.getHttpServer())
        .post('/api/v1/webhooks/whatsapp')
        .send({
          entry: [
            {
              changes: [
                {
                  value: {
                    messages: [
                      {
                        id: 'test-message-id',
                        from: '5511999999999',
                        type: 'text',
                        text: { body: 'Test message' },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
        });
    });
  });
});
