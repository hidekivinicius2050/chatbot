import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecurityMiddleware } from './common/security/security.middleware';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';
import pino from 'pino';

async function bootstrap() {
  // Configuração do logger Pino
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  });

  // Criação da aplicação NestJS
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Configuração global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
                  .setTitle('ChatBot 2.0 API')
                  .setDescription('API para o sistema de atendimento ChatBot 2.0')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuração de CORS
  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Middlewares de segurança
  app.use(SecurityMiddleware.applySecurityHeaders());
  app.use(SecurityMiddleware.validatePayloadSize);
  app.use(SecurityMiddleware.sanitizeInput);

  // Rate limiting para evitar spam
  app.useGlobalInterceptors(new RateLimitInterceptor());

  // Configuração do Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));

  // Prefixo global da API
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8080);

  await app.listen(port);

  logger.info(`🚀 Aplicação rodando na porta ${port}`);
  logger.info(`📚 Swagger disponível em http://localhost:${port}/api`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('Erro ao inicializar a aplicação:', error);
  process.exit(1);
});
