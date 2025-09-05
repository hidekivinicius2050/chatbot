const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🔐 Login iniciado:', credentials.email);
    
    // Validação básica
    if (!credentials.email || !credentials.password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Login mock simples
    if (credentials.email === 'admin@chatbot.com' && credentials.password === 'admin123') {
      console.log('✅ Credenciais mock válidas');
      
      const mockUser = {
        id: '1',
        email: credentials.email,
        name: 'Administrador',
        role: 'admin',
        companyId: '1'
      };

      const mockResponse: LoginResponse = {
        accessToken: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-' + Date.now(),
        user: mockUser
      };

      // Salvar no localStorage
      localStorage.setItem('accessToken', mockResponse.accessToken);
      localStorage.setItem('refreshToken', mockResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));

      console.log('💾 Dados salvos no localStorage');
      console.log('👤 Usuário:', mockResponse.user);
      
      return mockResponse;
    }

    throw new Error('Credenciais inválidas. Use: admin@chatbot.com / admin123');
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('🚪 Logout realizado');
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  static clearMockData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('🧹 Dados limpos');
  }
}
