import { Injectable, Logger } from '@nestjs/common';
import { IPTVService } from '../iptv/iptv.service';
import { PrismaService } from '../prisma/prisma.service';

export interface WhatsAppMessage {
  from: string;
  to: string;
  body: string;
  timestamp: string;
  messageId: string;
}

export interface TestUserRequest {
  phoneNumber: string;
  name?: string;
  message: string;
  ticketId?: string;
}

@Injectable()
export class IPTVAutomationService {
  private readonly logger = new Logger(IPTVAutomationService.name);

  constructor(
    private readonly iptvService: IPTVService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Processa mensagem do WhatsApp e detecta solicitação de teste
   */
  async processWhatsAppMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const messageText = message.body.toLowerCase();
      
      // Palavras-chave que indicam solicitação de teste
      const testKeywords = [
        'teste',
        'testar',
        'experimentar',
        'provar',
        'demo',
        'demonstração',
        'gratuito',
        'grátis',
        'trial',
        'avaliação'
      ];

      // Verifica se a mensagem contém palavras-chave de teste
      const hasTestKeyword = testKeywords.some(keyword => 
        messageText.includes(keyword)
      );

      if (hasTestKeyword) {
        this.logger.log(`Test request detected from ${message.from}`);
        
        // Extrai nome se mencionado
        const nameMatch = messageText.match(/(?:meu nome é|sou o|sou a|chamo|nome)\s+([a-záàâãéèêíìîóòôõúùûç\s]+)/i);
        const name = nameMatch ? nameMatch[1].trim() : undefined;

        await this.handleTestUserRequest({
          phoneNumber: message.from,
          name,
          message: message.body,
        });

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error processing WhatsApp message: ${error.message}`);
      return false;
    }
  }

  /**
   * Processa solicitação de usuário de teste
   */
  async handleTestUserRequest(request: TestUserRequest): Promise<void> {
    try {
      this.logger.log(`Handling test user request for ${request.phoneNumber}`);

      // Verifica se já existe um usuário de teste para este telefone
      const existingUser = await this.findExistingTestUser(request.phoneNumber);
      
      if (existingUser) {
        this.logger.log(`Test user already exists for ${request.phoneNumber}`);
        // Aqui você pode enviar uma mensagem informando que já existe um teste
        return;
      }

      // Gera credenciais de teste
      const result = await this.iptvService.generateTestCredentials(
        request.phoneNumber,
        request.name
      );

      if (result.success) {
        // Salva o registro do teste
        await this.saveTestUserRecord(request, result.data);
        
        this.logger.log(`Test user created successfully for ${request.phoneNumber}`);
        
        // Aqui você pode enviar uma mensagem com as credenciais via WhatsApp
        await this.sendTestCredentialsMessage(request, result.data);
      } else {
        this.logger.error(`Failed to create test user: ${result.error}`);
        // Aqui você pode enviar uma mensagem de erro
      }

    } catch (error) {
      this.logger.error(`Error handling test user request: ${error.message}`);
    }
  }

  /**
   * Busca usuário de teste existente
   */
  private async findExistingTestUser(phoneNumber: string): Promise<any> {
    try {
      // Busca no banco de dados local
      const testRecord = await this.prisma.testUser.findFirst({
        where: {
          phoneNumber: phoneNumber,
          status: 'active'
        }
      });

      return testRecord;
    } catch (error) {
      this.logger.error(`Error finding existing test user: ${error.message}`);
      return null;
    }
  }

  /**
   * Salva registro do usuário de teste
   */
  private async saveTestUserRecord(request: TestUserRequest, userData: any): Promise<void> {
    try {
      await this.prisma.testUser.create({
        data: {
          phoneNumber: request.phoneNumber,
          name: request.name,
          iptvUsername: userData.username,
          iptvPassword: userData.password,
          expirationDate: new Date(userData.expirationDate),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Error saving test user record: ${error.message}`);
    }
  }

  /**
   * Envia mensagem com credenciais de teste
   */
  private async sendTestCredentialsMessage(request: TestUserRequest, userData: any): Promise<void> {
    try {
      const message = this.formatTestCredentialsMessage(userData);
      
      // Aqui você integraria com o serviço de WhatsApp para enviar a mensagem
      // Por exemplo: await this.whatsappService.sendMessage(request.phoneNumber, message);
      
      this.logger.log(`Test credentials message prepared for ${request.phoneNumber}`);
      
      // Por enquanto, apenas logamos a mensagem
      console.log(`Mensagem para ${request.phoneNumber}:`, message);
      
    } catch (error) {
      this.logger.error(`Error sending test credentials message: ${error.message}`);
    }
  }

  /**
   * Formata mensagem com credenciais de teste
   */
  private formatTestCredentialsMessage(userData: any): string {
    const accessInfo = userData.accessInfo;
    
    return `🎉 *Seu teste IPTV está pronto!*

📱 *Credenciais de Acesso:*
👤 Usuário: \`${accessInfo.username}\`
🔑 Senha: \`${accessInfo.password}\`
🌐 Servidor: \`${accessInfo.serverUrl}\`

⏰ *Validade:* ${new Date(accessInfo.expirationDate).toLocaleDateString('pt-BR')} (7 dias)

📋 *Como usar:*
${accessInfo.instructions.map((instruction: string, index: number) => `${index + 1}. ${instruction}`).join('\n')}

💡 *Dica:* Baixe o app "IPTV Smarters" ou "VLC" para começar!

❓ Precisa de ajuda? Responda esta mensagem!`;
  }

  /**
   * Lista usuários de teste ativos
   */
  async listActiveTestUsers(): Promise<any[]> {
    try {
      return await this.prisma.testUser.findMany({
        where: {
          status: 'active'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      this.logger.error(`Error listing active test users: ${error.message}`);
      return [];
    }
  }

  /**
   * Remove usuário de teste expirado
   */
  async cleanupExpiredTestUsers(): Promise<void> {
    try {
      const expiredUsers = await this.prisma.testUser.findMany({
        where: {
          status: 'active',
          expirationDate: {
            lt: new Date()
          }
        }
      });

      for (const user of expiredUsers) {
        // Remove do sistema IPTV
        await this.iptvService.deleteTestUser(user.iptvUsername);
        
        // Marca como expirado no banco local
        await this.prisma.testUser.update({
          where: { id: user.id },
          data: { status: 'expired' }
        });
      }

      this.logger.log(`Cleaned up ${expiredUsers.length} expired test users`);
    } catch (error) {
      this.logger.error(`Error cleaning up expired test users: ${error.message}`);
    }
  }
}
