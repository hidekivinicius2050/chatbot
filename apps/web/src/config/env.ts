// Configurações de ambiente para o frontend
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  
  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'AtendeChat 2.0',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  
  // Feature Flags
  enableAI: process.env.NEXT_PUBLIC_ENABLE_AI === 'true',
  enableWhatsApp: process.env.NEXT_PUBLIC_ENABLE_WHATSAPP === 'true',
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  enableRealtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  
  // External Services
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validação de configuração
export function validateConfig() {
  const required = ['apiUrl', 'wsUrl']
  const missing = required.filter(key => !config[key as keyof typeof config])
  
  if (missing.length > 0) {
    console.warn('Configurações ausentes:', missing)
  }
  
  return missing.length === 0
}

// Configurações específicas por ambiente
export const environmentConfig = {
  development: {
    apiTimeout: 10000,
    wsReconnectInterval: 3000,
    maxReconnectAttempts: 5,
    debugMode: true,
  },
  production: {
    apiTimeout: 15000,
    wsReconnectInterval: 5000,
    maxReconnectAttempts: 3,
    debugMode: false,
  },
}

export const currentEnvConfig = environmentConfig[config.isDevelopment ? 'development' : 'production']
