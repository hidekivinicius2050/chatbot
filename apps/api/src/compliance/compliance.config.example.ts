/**
 * Exemplo de configuração para o módulo de Compliance
 * 
 * Este arquivo demonstra como configurar as variáveis de ambiente
 * necessárias para o funcionamento do módulo de compliance.
 */

export const complianceConfigExample = {
  // Políticas de retenção de dados (em dias)
  retention: {
    // Plano FREE - 30 dias de retenção
    freeDays: 30,
    
    // Plano PRO - 90 dias de retenção
    proDays: 90,
    
    // Plano BUSINESS - 365 dias de retenção
    businessDays: 365,
  },

  // Configurações de DSR (Data Subject Rights)
  dsr: {
    // Número máximo de solicitações pendentes por empresa
    maxPendingRequests: 10,
    
    // Habilitar aprovação automática de solicitações simples
    autoApprovalEnabled: false,
    
    // Tempo máximo para processamento (em dias)
    maxProcessingDays: 30,
  },

  // Configurações de consentimento
  consent: {
    // Exigir consentimento explícito para todos os tipos
    requireExplicitConsent: true,
    
    // Habilitar banner de cookies
    cookieBannerEnabled: true,
    
    // Tipos de consentimento padrão
    defaultTypes: [
      'NECESSARY',      // Sempre necessário
      'MARKETING',      // Marketing e publicidade
      'ANALYTICS',      // Analytics e métricas
      'FUNCTIONAL',     // Funcionalidades adicionais
    ],
    
    // Duração do consentimento (em dias)
    consentValidityDays: 365,
  },

  // Configurações de auditoria
  audit: {
    // Habilitar logs de auditoria
    enabled: true,
    
    // Retenção dos logs de auditoria (em dias)
    retentionDays: 90,
    
    // Capturar informações sensíveis
    capturePii: false,
    
    // Campos a serem mascarados
    maskedFields: [
      'email',
      'phone',
      'cpf',
      'cnpj',
    ],
  },

  // Configurações de notificação
  notifications: {
    // Notificar sobre solicitações DSR
    dsrRequests: true,
    
    // Notificar sobre consentimentos revogados
    consentRevoked: true,
    
    // Notificar sobre limpeza de dados
    dataCleanup: true,
    
    // Canal de notificação (email, webhook, etc.)
    channel: 'email',
  },

  // Configurações de exportação
  export: {
    // Formato de exportação padrão
    defaultFormat: 'json',
    
    // Formatos suportados
    supportedFormats: ['json', 'csv', 'xml'],
    
    // Tamanho máximo do arquivo de exportação (MB)
    maxFileSize: 100,
    
    // Compressão automática
    autoCompress: true,
  },

  // Configurações de limpeza automática
  cleanup: {
    // Executar limpeza automaticamente
    autoEnabled: true,
    
    // Frequência de execução (cron expression)
    schedule: '0 2 * * *', // 2 AM diariamente
    
    // Notificar sobre falhas na limpeza
    notifyOnFailure: true,
    
    // Backup antes da limpeza
    backupBeforeCleanup: false,
  },
};

/**
 * Variáveis de ambiente necessárias
 */
export const requiredEnvVars = [
  // Retenção
  'COMPLIANCE_FREE_RETENTION_DAYS',
  'COMPLIANCE_PRO_RETENTION_DAYS', 
  'COMPLIANCE_BUSINESS_RETENTION_DAYS',
  
  // DSR
  'COMPLIANCE_DSR_MAX_PENDING',
  'COMPLIANCE_DSR_AUTO_APPROVAL',
  'COMPLIANCE_DSR_MAX_PROCESSING_DAYS',
  
  // Consentimento
  'COMPLIANCE_REQUIRE_EXPLICIT_CONSENT',
  'COMPLIANCE_COOKIE_BANNER_ENABLED',
  'COMPLIANCE_CONSENT_VALIDITY_DAYS',
  
  // Auditoria
  'COMPLIANCE_AUDIT_ENABLED',
  'COMPLIANCE_AUDIT_RETENTION_DAYS',
  'COMPLIANCE_CAPTURE_PII',
  
  // Notificações
  'COMPLIANCE_NOTIFY_DSR_REQUESTS',
  'COMPLIANCE_NOTIFY_CONSENT_REVOKED',
  'COMPLIANCE_NOTIFY_DATA_CLEANUP',
  
  // Limpeza
  'COMPLIANCE_CLEANUP_AUTO_ENABLED',
  'COMPLIANCE_CLEANUP_SCHEDULE',
  'COMPLIANCE_CLEANUP_NOTIFY_ON_FAILURE',
];

/**
 * Exemplo de arquivo .env
 */
export const envExample = `
# ===== COMPLIANCE CONFIGURATION =====

# Políticas de retenção (em dias)
COMPLIANCE_FREE_RETENTION_DAYS=30
COMPLIANCE_PRO_RETENTION_DAYS=90
COMPLIANCE_BUSINESS_RETENTION_DAYS=365

# Configurações de DSR
COMPLIANCE_DSR_MAX_PENDING=10
COMPLIANCE_DSR_AUTO_APPROVAL=false
COMPLIANCE_DSR_MAX_PROCESSING_DAYS=30

# Configurações de consentimento
COMPLIANCE_REQUIRE_EXPLICIT_CONSENT=true
COMPLIANCE_COOKIE_BANNER_ENABLED=true
COMPLIANCE_CONSENT_VALIDITY_DAYS=365

# Configurações de auditoria
COMPLIANCE_AUDIT_ENABLED=true
COMPLIANCE_AUDIT_RETENTION_DAYS=90
COMPLIANCE_CAPTURE_PII=false

# Configurações de notificação
COMPLIANCE_NOTIFY_DSR_REQUESTS=true
COMPLIANCE_NOTIFY_CONSENT_REVOKED=true
COMPLIANCE_NOTIFY_DATA_CLEANUP=true

# Configurações de limpeza
COMPLIANCE_CLEANUP_AUTO_ENABLED=true
COMPLIANCE_CLEANUP_SCHEDULE=0 2 * * *
COMPLIANCE_CLEANUP_NOTIFY_ON_FAILURE=true
`;

