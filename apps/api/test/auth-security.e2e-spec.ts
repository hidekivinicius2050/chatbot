import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.passwordReset.deleteMany();
    await prisma.invite.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
  });

  describe('Rate Limiting', () => {
    it('should block login after too many attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Tentar login várias vezes
      for (let i = 0; i < 12; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(loginData);

        if (i < 10) {
          expect(response.status).toBe(401); // Credenciais inválidas
        } else {
          expect(response.status).toBe(429); // Rate limit atingido
          expect(response.body.error).toContain('Muitas tentativas de login');
        }
      }
    });
  });

  describe('Password Reset', () => {
    it('should send reset email for existing user', async () => {
      // Criar usuário de teste
      const company = await prisma.company.create({
        data: { name: 'Test Company' },
      });

      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hash',
          companyId: company.id,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);

      // Verificar se o reset foi criado no banco
      const reset = await prisma.passwordReset.findFirst({
        where: { email: 'test@example.com' },
      });
      expect(reset).toBeDefined();
      expect(reset?.used).toBe(false);
    });

    it('should not reveal if email exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200); // Sempre 200, não revela se existe
    });

    it('should reset password with valid token', async () => {
      // Criar usuário e reset
      const company = await prisma.company.create({
        data: { name: 'Test Company' },
      });

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'oldhash',
          companyId: company.id,
        },
      });

      const reset = await prisma.passwordReset.create({
        data: {
          email: 'test@example.com',
          tokenHash: 'hashedtoken',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .send({
          token: 'validtoken',
          newPassword: 'NewPass123',
        });

      expect(response.status).toBe(200);

      // Verificar se a senha foi atualizada
      const updatedUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });
      expect(updatedUser?.passwordHash).not.toBe('oldhash');
    });
  });

  describe('Invites', () => {
    it('should create and accept invite', async () => {
      // Criar empresa e usuário admin
      const company = await prisma.company.create({
        data: { name: 'Test Company' },
      });

      const admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          passwordHash: 'hash',
          role: 'ADMIN',
          companyId: company.id,
        },
      });

      // Criar convite
      const invite = await prisma.invite.create({
        data: {
          email: 'newuser@example.com',
          role: 'AGENT',
          tokenHash: 'hashedtoken',
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
          companyId: company.id,
          invitedBy: admin.id,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/accept-invite')
        .send({
          token: 'validtoken',
          name: 'New User',
          password: 'NewPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.companyId).toBe(company.id);

      // Verificar se o convite foi marcado como aceito
      const updatedInvite = await prisma.invite.findUnique({
        where: { id: invite.id },
      });
      expect(updatedInvite?.accepted).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile');

      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email inválido');
    });

    it('should reject weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset')
        .send({
          token: 'validtoken',
          newPassword: '123', // Senha muito fraca
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Senha deve ter pelo menos 6 caracteres');
    });
  });
});
