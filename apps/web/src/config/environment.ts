// Configurações de ambiente
export const ENV_CONFIG = {
  // Ambiente de desenvolvimento local
  isLocal: process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost',
  
  // Desabilitar verificações de conectividade em ambiente local
  skipConnectivityCheck: true,
  
  // URLs de API
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
}

// Função para verificar se deve pular verificações de conectividade
export function shouldSkipConnectivityCheck(): boolean {
  return ENV_CONFIG.isLocal && ENV_CONFIG.skipConnectivityCheck
}
