const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function bootstrap() {
  console.log('🚀 Iniciando aplicação Atendechat...');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Configurações básicas
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    });
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    console.log(`✅ Aplicação rodando em http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔒 Compliance API: http://localhost:${port}/api/v1/compliance`);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar aplicação:', error);
    process.exit(1);
  }
}

bootstrap();

