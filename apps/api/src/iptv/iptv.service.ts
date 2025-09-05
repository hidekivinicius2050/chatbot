import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface IPTVUser {
  id: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  connections: number;
  expirationDate: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface CreateIPTVUserDto {
  username: string;
  email?: string;
  phone?: string;
  connections?: number;
  expirationDays?: number;
  package?: string;
}

export interface IPTVResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

@Injectable()
export class IPTVService {
  private readonly logger = new Logger(IPTVService.name);
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('IPTV_BASE_URL', 'https://api.iptv.com');
    this.token = this.configService.get<string>('IPTV_TOKEN', 'I4U0WOtgP65VB7cAVHFt00DvLmk1aXsYAHgRSpyxWBtoQD7Dj5prpKBJm82Y9zN0');
    
    // Validação de segurança do token
    if (!this.token || this.token.length < 10) {
      this.logger.warn('IPTV token não configurado ou inválido');
    }
  }

  /**
   * Solicita criação de usuário de teste no sistema IPTV externo
   * NOTA: Este sistema NÃO gera usuários, apenas solicita ao sistema IPTV
   */
  async requestTestUser(userData: CreateIPTVUserDto): Promise<IPTVResponse> {
    try {
      this.logger.log(`Requesting IPTV test user creation for: ${userData.phone}`);

      const payload = {
        phone: userData.phone,
        name: userData.name,
        duration_days: userData.expirationDays || 7,
        request_source: 'chatbot_whatsapp'
      };

      // Chama a API do sistema IPTV para solicitar criação
      const response = await axios.post(`${this.baseUrl}/api/users/request-test`, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        // Salva no banco local apenas para controle
        await this.prisma.testUser.create({
          data: {
            phoneNumber: userData.phone,
            name: userData.name,
            iptvUsername: response.data.data.username,
            iptvPassword: response.data.data.password,
            expirationDate: new Date(response.data.data.expiration_date),
            status: 'active',
          },
        });

        this.logger.log(`IPTV test user requested successfully for: ${userData.phone}`);
        
        return {
          success: true,
          message: 'Solicitação de usuário de teste enviada com sucesso',
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Erro ao solicitar usuário de teste');
      }

    } catch (error) {
      this.logger.error(`Error requesting IPTV test user: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: 'Erro ao solicitar usuário de teste no sistema IPTV',
          error: error.response?.data?.message || error.message
        };
      }

      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      };
    }
  }

  /**
   * Busca informações de um usuário específico
   */
  async getUserInfo(username: string): Promise<IPTVResponse> {
    try {
      this.logger.log(`Fetching user info: ${username}`);

      const response = await axios.get(`${this.baseUrl}/api/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Usuário encontrado',
        data: response.data
      };

    } catch (error) {
      this.logger.error(`Error fetching user info: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: 'Usuário não encontrado',
          error: error.response?.data?.message || error.message
        };
      }

      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      };
    }
  }

  /**
   * Atualiza informações de um usuário
   */
  async updateUser(username: string, updateData: Partial<CreateIPTVUserDto>): Promise<IPTVResponse> {
    try {
      this.logger.log(`Updating user: ${username}`);

      const response = await axios.put(`${this.baseUrl}/api/users/${username}`, updateData, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: response.data
      };

    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: 'Erro ao atualizar usuário',
          error: error.response?.data?.message || error.message
        };
      }

      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      };
    }
  }

  /**
   * Remove um usuário de teste
   */
  async deleteTestUser(username: string): Promise<IPTVResponse> {
    try {
      this.logger.log(`Deleting test user: ${username}`);

      const response = await axios.delete(`${this.baseUrl}/api/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Usuário de teste removido com sucesso',
        data: response.data
      };

    } catch (error) {
      this.logger.error(`Error deleting test user: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: 'Erro ao remover usuário de teste',
          error: error.response?.data?.message || error.message
        };
      }

      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      };
    }
  }

  /**
   * Lista usuários de teste
   */
  async listTestUsers(): Promise<IPTVResponse> {
    try {
      this.logger.log('Fetching test users list');

      const response = await axios.get(`${this.baseUrl}/api/users?is_test=true`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Lista de usuários de teste obtida com sucesso',
        data: response.data
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Error listing test users: ${errorMessage}`);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: 'Erro ao listar usuários de teste',
          error: error.response?.data?.message || error.message
        };
      }

      return {
        success: false,
        message: 'Erro interno do servidor',
        error: errorMessage
      };
    }
  }

  /**
   * Gera credenciais de teste para um cliente
   */
  async generateTestCredentials(phoneNumber: string, name?: string): Promise<IPTVResponse> {
    try {
      // Gerar username único baseado no telefone
      const username = `test_${phoneNumber.replace(/\D/g, '')}_${Date.now()}`;
      
      const userData: CreateIPTVUserDto = {
        username,
        phone: phoneNumber,
        connections: 1,
        expirationDays: 7,
        package: 'test'
      };

      if (name) {
        userData.email = `${username}@teste.iptv.com`;
      }

      const result = await this.requestTestUser(userData);
      
      if (result.success) {
        // Adicionar informações de acesso ao resultado
        result.data = {
          ...result.data,
          accessInfo: {
            username: username,
            password: result.data.password || 'test123',
            serverUrl: this.configService.get<string>('IPTV_SERVER_URL', 'https://iptv.example.com'),
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            instructions: [
              '1. Baixe um aplicativo IPTV (VLC, IPTV Smarters, etc.)',
              '2. Configure com as credenciais fornecidas',
              '3. Aproveite seu teste de 7 dias!'
            ]
          }
        };
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Error generating test credentials: ${errorMessage}`);
      return {
        success: false,
        message: 'Erro ao gerar credenciais de teste',
        error: errorMessage
      };
    }
  }
}
