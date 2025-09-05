import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface IPTVWebhookPayload {
  event: string;
  data: {
    user_id?: string;
    username?: string;
    status?: string;
    expiration_date?: string;
    connections?: number;
    [key: string]: any;
  };
  timestamp: string;
}

@Injectable()
export class IPTVWebhookService {
  private readonly logger = new Logger(IPTVWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processa webhook recebido do sistema IPTV
   */
  async processWebhook(payload: IPTVWebhookPayload): Promise<void> {
    try {
      this.logger.log(`Processing IPTV webhook: ${payload.event}`);

      switch (payload.event) {
        case 'user.created':
          await this.handleUserCreated(payload.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(payload.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(payload.data);
          break;
        case 'user.expired':
          await this.handleUserExpired(payload.data);
          break;
        case 'user.connection_limit_reached':
          await this.handleConnectionLimitReached(payload.data);
          break;
        default:
          this.logger.warn(`Unknown webhook event: ${payload.event}`);
      }
    } catch (error) {
      this.logger.error(`Error processing IPTV webhook: ${error.message}`);
    }
  }

  /**
   * Processa criação de usuário
   */
  private async handleUserCreated(data: any): Promise<void> {
    try {
      this.logger.log(`User created: ${data.username}`);
      
      // Atualiza status no banco local se existir
      await this.prisma.testUser.updateMany({
        where: {
          iptvUsername: data.username
        },
        data: {
          status: 'active',
          updatedAt: new Date()
        }
      });

      // Log da criação
      this.logger.log(`User ${data.username} marked as active`);
    } catch (error) {
      this.logger.error(`Error handling user created: ${error.message}`);
    }
  }

  /**
   * Processa atualização de usuário
   */
  private async handleUserUpdated(data: any): Promise<void> {
    try {
      this.logger.log(`User updated: ${data.username}`);
      
      // Atualiza dados no banco local
      const updateData: any = {
        updatedAt: new Date()
      };

      if (data.expiration_date) {
        updateData.expirationDate = new Date(data.expiration_date);
      }

      if (data.status) {
        updateData.status = data.status;
      }

      await this.prisma.testUser.updateMany({
        where: {
          iptvUsername: data.username
        },
        data: updateData
      });

      this.logger.log(`User ${data.username} updated successfully`);
    } catch (error) {
      this.logger.error(`Error handling user updated: ${error.message}`);
    }
  }

  /**
   * Processa exclusão de usuário
   */
  private async handleUserDeleted(data: any): Promise<void> {
    try {
      this.logger.log(`User deleted: ${data.username}`);
      
      // Marca como cancelado no banco local
      await this.prisma.testUser.updateMany({
        where: {
          iptvUsername: data.username
        },
        data: {
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      this.logger.log(`User ${data.username} marked as cancelled`);
    } catch (error) {
      this.logger.error(`Error handling user deleted: ${error.message}`);
    }
  }

  /**
   * Processa expiração de usuário
   */
  private async handleUserExpired(data: any): Promise<void> {
    try {
      this.logger.log(`User expired: ${data.username}`);
      
      // Marca como expirado no banco local
      await this.prisma.testUser.updateMany({
        where: {
          iptvUsername: data.username
        },
        data: {
          status: 'expired',
          updatedAt: new Date()
        }
      });

      this.logger.log(`User ${data.username} marked as expired`);
    } catch (error) {
      this.logger.error(`Error handling user expired: ${error.message}`);
    }
  }

  /**
   * Processa limite de conexões atingido
   */
  private async handleConnectionLimitReached(data: any): Promise<void> {
    try {
      this.logger.log(`Connection limit reached for user: ${data.username}`);
      
      // Aqui você pode implementar lógica para notificar o usuário
      // ou tomar outras ações quando o limite de conexões for atingido
      
      this.logger.log(`Connection limit notification processed for ${data.username}`);
    } catch (error) {
      this.logger.error(`Error handling connection limit: ${error.message}`);
    }
  }

  /**
   * Valida assinatura do webhook (se implementado pelo sistema IPTV)
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      // Implementar validação de assinatura se o sistema IPTV suportar
      // Por exemplo, usando HMAC-SHA256
      
      // Por enquanto, retorna true (sem validação)
      return true;
    } catch (error) {
      this.logger.error(`Error validating webhook signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Lista eventos de webhook suportados
   */
  getSupportedEvents(): string[] {
    return [
      'user.created',
      'user.updated', 
      'user.deleted',
      'user.expired',
      'user.connection_limit_reached'
    ];
  }
}
