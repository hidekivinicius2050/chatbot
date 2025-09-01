import { NestFactory } from '@nestjs/core';
import { ComplianceModule } from './compliance/compliance.module';

async function bootstrap() {
  console.log('🚀 Iniciando aplicação de teste do módulo de Compliance...');
  
  const app = await NestFactory.create(ComplianceModule);
  
  // Configurar CORS básico
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Configurar prefixo da API
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`✅ Módulo de Compliance rodando em: http://localhost:${port}`);
  console.log(`📚 Endpoints disponíveis:`);
  console.log(`   POST /api/v1/compliance/consent`);
  console.log(`   GET  /api/v1/compliance/consent`);
  console.log(`   POST /api/v1/compliance/dsr`);
  console.log(`   GET  /api/v1/compliance/dsr`);
  console.log(`   GET  /api/v1/compliance/summary`);
}

bootstrap().catch(err => {
  console.error('❌ Erro ao iniciar aplicação:', err);
  process.exit(1);
});

