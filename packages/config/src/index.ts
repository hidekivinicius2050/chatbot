import { z } from 'zod';

// Schema de configuração do ambiente
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().default('http://localhost:3000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),
  
  // Auth
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  
  // DB & Cache
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // Web
  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:8080'),
  
  // WebSocket
  WS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  
  // WhatsApp Providers
  WHATS_PROVIDER: z.enum(['whatsapp_cloud', 'whatsapp_baileys']).default('whatsapp_cloud'),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  META_WABA_ID: z.string().optional(),
  META_PHONE_ID: z.string().optional(),
  META_VERIFY_TOKEN: z.string().optional(),
  META_WEBHOOK_SECRET: z.string().optional(),
  BAILEYS_SESSION_STORE: z.enum(['file', 'redis']).default('file'),
  BAILEYS_SESSION_BUCKET: z.string().default('./sessions'),
  
  // Campaigns
  CAMPAIGN_MAX_CPS_PER_CHANNEL: z.string().transform(Number).default('10'),
  CAMPAIGN_CONCURRENCY: z.string().transform(Number).default('5'),
  CAMPAIGN_RETRY_ATTEMPTS: z.string().transform(Number).default('5'),
  CAMPAIGN_RETRY_BACKOFF_MS: z.string().transform(Number).default('2000'),
  CAMPAIGN_BATCH_SIZE: z.string().transform(Number).default('200'),
  
  // Scheduler
  SCHEDULER_CRON_AGGREGATES: z.string().default('*/5 * * * *'),
  SCHEDULER_CRON_RECOVERY: z.string().default('*/2 * * * *'),
  
  // Business Hours / Timezone
  BUSINESS_HOURS_TZ: z.string().default('America/Sao_Paulo'),
  
  // SLA (minutos)
  SLA_FIRST_RESPONSE_MINUTES: z.string().transform(Number).default('15'),
  SLA_RESOLUTION_MINUTES: z.string().transform(Number).default('480'),
  
  // Cron jobs (dev)
  SLA_CRON: z.string().default('*/1 * * * *'),
  AUTOMATIONS_CRON: z.string().default('*/1 * * * *'),
  
  // Atribuição
  ASSIGNMENT_STRATEGY: z.enum(['round_robin', 'least_loaded']).default('round_robin'),
  
  // Logs & Telemetry
  OTEL_ENABLED: z.string().transform(val => val === 'true').default('false'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default('http://localhost:4318'),
  PROMETHEUS_METRICS_ENABLED: z.string().transform(val => val === 'true').default('true'),
  PROMETHEUS_METRICS_PORT: z.string().transform(Number).default('9464'),
  
  // Auditoria / Privacidade
  AUDIT_LOG_ENABLED: z.string().transform(val => val === 'true').default('true'),
  AUDIT_LOG_RETENTION_DAYS: z.string().transform(Number).default('90'),
  REDACT_PII: z.string().transform(val => val === 'true').default('true'),
  
  // Legacy (para compatibilidade)
  PORT: z.string().transform(Number).default('8080'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

// Tipo inferido do schema
export type EnvConfig = z.infer<typeof envSchema>;

// Configuração do banco de dados
export const databaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/atendechat',
  pool: {
    min: 2,
    max: 10,
  },
};

// Configuração do Redis
export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

// Configuração JWT
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'dev-secret',
  expiresIn: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshExpiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
};

// Configuração de upload
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  uploadDir: 'uploads',
};

// Configuração de rate limiting
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
};

// Configuração de logging
export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  pretty: process.env.NODE_ENV === 'development',
};

// Configuração do WhatsApp
export const whatsappConfig = {
  provider: process.env.WHATS_PROVIDER || 'whatsapp_cloud',
  meta: {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
    accessToken: process.env.META_ACCESS_TOKEN,
    wabaId: process.env.META_WABA_ID,
    phoneId: process.env.META_PHONE_ID,
    verifyToken: process.env.META_VERIFY_TOKEN,
    webhookSecret: process.env.META_WEBHOOK_SECRET,
  },
  baileys: {
    sessionStore: process.env.BAILEYS_SESSION_STORE || 'file',
    sessionBucket: process.env.BAILEYS_SESSION_BUCKET || './sessions',
  },
};

// Configuração de Campanhas
export const campaignConfig = {
  maxCpsPerChannel: parseInt(process.env.CAMPAIGN_MAX_CPS_PER_CHANNEL || '10', 10),
  concurrency: parseInt(process.env.CAMPAIGN_CONCURRENCY || '5', 10),
  retryAttempts: parseInt(process.env.CAMPAIGN_RETRY_ATTEMPTS || '5', 10),
  retryBackoffMs: parseInt(process.env.CAMPAIGN_RETRY_BACKOFF_MS || '2000', 10),
  batchSize: parseInt(process.env.CAMPAIGN_BATCH_SIZE || '200', 10),
};

// Configuração do Scheduler
export const schedulerConfig = {
  aggregates: process.env.SCHEDULER_CRON_AGGREGATES || '*/5 * * * *',
  recovery: process.env.SCHEDULER_CRON_RECOVERY || '*/2 * * * *',
};

// Configuração de Business Hours
export const businessHoursConfig = {
  timezone: process.env.BUSINESS_HOURS_TZ || 'America/Sao_Paulo',
};

// Configuração de SLA
export const slaConfig = {
  firstResponseMinutes: parseInt(process.env.SLA_FIRST_RESPONSE_MINUTES || '15', 10),
  resolutionMinutes: parseInt(process.env.SLA_RESOLUTION_MINUTES || '480', 10),
  cron: process.env.SLA_CRON || '*/1 * * * *',
};

// Configuração de Automações
export const automationConfig = {
  cron: process.env.AUTOMATIONS_CRON || '*/1 * * * *',
  assignmentStrategy: process.env.ASSIGNMENT_STRATEGY || 'round_robin',
};

// Configuração de Observabilidade
export const observabilityConfig = {
  otel: {
    enabled: process.env.OTEL_ENABLED === 'true',
    exporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
  },
  prometheus: {
    enabled: process.env.PROMETHEUS_METRICS_ENABLED !== 'false',
    port: parseInt(process.env.PROMETHEUS_METRICS_PORT || '9464', 10),
  },
};

// Configuração de Auditoria
export const auditConfig = {
  enabled: process.env.AUDIT_LOG_ENABLED !== 'false',
  retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10),
  redactPii: process.env.REDACT_PII !== 'false',
};

// Configuração de Compliance
export const complianceConfig = {
  retention: {
    freeDays: parseInt(process.env.COMPLIANCE_FREE_RETENTION_DAYS || '30', 10),
    proDays: parseInt(process.env.COMPLIANCE_PRO_RETENTION_DAYS || '90', 10),
    businessDays: parseInt(process.env.COMPLIANCE_BUSINESS_RETENTION_DAYS || '365', 10),
  },
  dsr: {
    maxPendingRequests: parseInt(process.env.COMPLIANCE_DSR_MAX_PENDING || '10', 10),
    autoApprovalEnabled: process.env.COMPLIANCE_DSR_AUTO_APPROVAL === 'true',
  },
  consent: {
    requireExplicitConsent: process.env.COMPLIANCE_REQUIRE_EXPLICIT_CONSENT !== 'false',
    cookieBannerEnabled: process.env.COMPLIANCE_COOKIE_BANNER_ENABLED !== 'false',
  },
};

// Configuração de Billing
export const billingConfig = {
  enabled: process.env.BILLING_ENABLED !== 'false',
  provider: process.env.BILLING_PROVIDER || 'mock',
  anchorDay: parseInt(process.env.BILLING_ANCHOR_DAY || '1', 10),
  defaults: {
    freeMaxUsers: parseInt(process.env.DEFAULT_FREE_MAX_USERS || '3', 10),
    freeMaxChannels: parseInt(process.env.DEFAULT_FREE_MAX_CHANNELS || '1', 10),
    freeMaxMessagesMonth: parseInt(process.env.DEFAULT_FREE_MAX_MESSAGES_MONTH || '5000', 10),
    freeMaxCampaignsDay: parseInt(process.env.DEFAULT_FREE_MAX_CAMPAIGNS_DAY || '2', 10),
    freeRetentionDays: parseInt(process.env.DEFAULT_FREE_RETENTION_DAYS || '30', 10),
  },
  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    priceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    priceBusinessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  urls: {
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
};

// Configuração unificada
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: databaseConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  cors: {
    origin: process.env.WS_ALLOWED_ORIGINS || 'http://localhost:3000',
  },
  upload: uploadConfig,
  rateLimit: rateLimitConfig,
  logging: loggingConfig,
  ws: {
    allowedOrigins: process.env.WS_ALLOWED_ORIGINS || 'http://localhost:3000',
  },
  whatsapp: whatsappConfig,
  campaign: campaignConfig,
  scheduler: schedulerConfig,
  businessHours: businessHoursConfig,
  sla: slaConfig,
  automation: automationConfig,
  observability: observabilityConfig,
  audit: auditConfig,
  compliance: complianceConfig,
  billing: billingConfig,
};
