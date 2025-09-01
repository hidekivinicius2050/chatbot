import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.environment).toBeDefined();
      });
  });

  it('/auth/login (POST) - should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('/auth/login (POST) - should reject invalid email format', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'invalid-email',
        password: 'password123',
      })
      .expect(400);
  });

  it('/auth/login (POST) - should reject short password', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: '123',
      })
      .expect(400);
  });

  it('/dashboard/stats (GET) - should require authentication', () => {
    return request(app.getHttpServer())
      .get('/api/v1/dashboard/stats')
      .expect(401);
  });

  it('/tickets (GET) - should require authentication', () => {
    return request(app.getHttpServer())
      .get('/api/v1/tickets')
      .expect(401);
  });

  it('/channels (GET) - should require authentication', () => {
    return request(app.getHttpServer())
      .get('/api/v1/channels')
      .expect(401);
  });

  it('/upload/file (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/api/v1/upload/file')
      .expect(401);
  });
});
