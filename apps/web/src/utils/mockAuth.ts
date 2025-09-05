// Utilitário para simular autenticação em desenvolvimento
export const mockAuth = {
  // Token mock para desenvolvimento
  mockToken: 'mock-jwt-token-for-development',
  
  // Simular login
  login: () => {
    localStorage.setItem('authToken', mockAuth.mockToken)
    console.log('Token mock armazenado:', mockAuth.mockToken)
  },
  
  // Verificar se está logado
  isLoggedIn: () => {
    return !!localStorage.getItem('authToken')
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('authToken')
    console.log('Token removido')
  }
}

// Auto-login em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Verificar se já não está logado
  if (!mockAuth.isLoggedIn()) {
    mockAuth.login()
  }
}
