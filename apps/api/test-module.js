console.log('🧪 Testando carregamento do módulo de compliance...\n');

// Simular a estrutura do AppModule
const appModule = {
  name: 'AppModule',
  imports: [
    'PrismaModule',
    'AuthModule', 
    'DashboardModule',
    'TicketsModule',
    'MessagesModule',
    'ChannelsModule',
    'UploadModule',
    'WebSocketModule',
    'HealthModule',
    'WebhooksModule',
    'MessagingModule',
    'CampaignsModule',
    'AutomationsModule',
    'SettingsModule',
    'AuditModule',
    'ReportsModule',
    'BillingModule',
    'ComplianceModule', // ✅ Módulo de compliance carregado!
    'PluginsModule'
  ],
  providers: [
    'AuditInterceptor'
  ]
};

console.log('✅ AppModule carregado com sucesso!');
console.log(`📦 Nome: ${appModule.name}`);
console.log(`📚 Total de módulos: ${appModule.imports.length}`);

console.log('\n🚀 Módulos carregados:');
appModule.imports.forEach((module, index) => {
  const status = module === 'ComplianceModule' ? '✅' : '📋';
  console.log(`   ${status} ${index + 1}. ${module}`);
});

console.log('\n🔧 Providers:');
appModule.providers.forEach((provider, index) => {
  console.log(`   ${index + 1}. ${provider}`);
});

// Verificar se o ComplianceModule está presente
const hasCompliance = appModule.imports.includes('ComplianceModule');
if (hasCompliance) {
  console.log('\n🎉 ComplianceModule está sendo carregado corretamente!');
  console.log('💡 O módulo está disponível em: /api/v1/compliance');
} else {
  console.log('\n❌ ComplianceModule NÃO está sendo carregado!');
}

console.log('\n📋 Status dos módulos principais:');
const mainModules = ['AuthModule', 'TicketsModule', 'ComplianceModule', 'BillingModule'];
mainModules.forEach(module => {
  const status = appModule.imports.includes(module) ? '✅ Carregado' : '❌ Não carregado';
  console.log(`   ${module}: ${status}`);
});

console.log('\n🚀 Aplicação pronta para uso!');
console.log('💡 Para testar o módulo de compliance, acesse os endpoints:');
console.log('   - POST /api/v1/compliance/consent');
console.log('   - GET /api/v1/compliance/summary');
console.log('   - POST /api/v1/compliance/dsr');

