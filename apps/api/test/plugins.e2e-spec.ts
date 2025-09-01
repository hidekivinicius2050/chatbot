import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Plugins E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // Fazer login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@test.com',
        password: '123456',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/plugins (GET)', () => {
    it('deve listar plugins do marketplace', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/plugins')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('deve buscar plugins por query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/plugins?q=slack')
        .expect(200);

      expect(response.body.items).toBeDefined();
    });
  });

  describe('/api/v1/apps (GET)', () => {
    it('deve listar instalações do tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/apps')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/api/v1/apps/install (POST)', () => {
    it('deve instalar um plugin', async () => {
      // Primeiro, buscar um plugin disponível
      const pluginsResponse = await request(app.getHttpServer())
        .get('/api/v1/plugins')
        .expect(200);

      if (pluginsResponse.body.items.length === 0) {
        // Skip se não há plugins no seed
        return;
      }

      const plugin = pluginsResponse.body.items[0];

      const response = await request(app.getHttpServer())
        .post('/api/v1/apps/install')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          pluginId: plugin.id,
          settings: { test: true },
          events: ['message.created', 'ticket.updated'],
          url: 'https://hooks.example.com/webhook',
          secret: 'test-secret',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.pluginId).toBe(plugin.id);
    });
  });

  describe('/api/v1/apps/:id/test-event (POST)', () => {
    it('deve enviar evento de teste', async () => {
      // Buscar uma instalação existente
      const appsResponse = await request(app.getHttpServer())
        .get('/api/v1/apps')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      if (appsResponse.body.length === 0) {
        // Skip se não há instalações
        return;
      }

      const installation = appsResponse.body[0];

      const response = await request(app.getHttpServer())
        .post(`/api/v1/apps/${installation.id}/test-event`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'test.webhook',
          sample: { message: 'Hello World' },
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.type).toBe('test.webhook');
    });
  });
});
