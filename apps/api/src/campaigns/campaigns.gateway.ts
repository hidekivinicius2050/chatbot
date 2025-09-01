import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CampaignsService } from './campaigns.service';
import { Logger } from '@nestjs/common';

export interface CampaignProgressEvent {
  campaignId: string;
  companyId: string;
  totalTargets: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  optOutCount: number;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // in seconds
}

export interface CampaignFinishedEvent {
  campaignId: string;
  companyId: string;
  status: 'completed' | 'failed' | 'cancelled';
  totalTargets: number;
  successCount: number;
  failureCount: number;
  optOutCount: number;
  duration: number; // in seconds
  error?: string;
}

@WebSocketGateway({
  namespace: 'campaigns',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CampaignsGateway.name);
  private readonly connectedClients = new Map<string, { socket: Socket; companyId: string; userId: string }>();

  constructor(private readonly campaignsService: CampaignsService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract user info from socket handshake (set by JWT guard)
      const user = client.handshake.auth.user;
      if (!user || !user.companyId) {
        client.disconnect();
        return;
      }

      const companyId = user.companyId;
      const userId = user.id;

      // Join company-specific room for isolation
      await client.join(`company:${companyId}`);
      
      // Store client info
      this.connectedClients.set(client.id, { socket: client, companyId, userId });
      
      this.logger.log(`Client ${client.id} connected to company ${companyId}`);
      
      // Send welcome message
      client.emit('connected', {
        message: 'Connected to campaigns namespace',
        companyId,
        userId,
      });

    } catch (error) {
      this.logger.error('Error during connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join-campaign')
  @Roles('owner', 'admin', 'agent')
  async handleJoinCampaign(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { campaignId: string },
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        client.emit('error', { message: 'Client not authenticated' });
        return;
      }

      const { campaignId } = data;
      const { companyId } = clientInfo;

      // Verify campaign belongs to company
      const campaign = await this.campaignsService.findOne(campaignId, companyId);
      if (!campaign || campaign.companyId !== companyId) {
        client.emit('error', { message: 'Campaign not found or access denied' });
        return;
      }

      // Join campaign-specific room
      await client.join(`campaign:${campaignId}`);
      
      client.emit('joined-campaign', {
        campaignId,
        message: `Joined campaign ${campaignId}`,
      });

      this.logger.log(`Client ${client.id} joined campaign ${campaignId}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      client.emit('error', { message: `Failed to join campaign: ${errorMessage}` });
    }
  }

  @SubscribeMessage('leave-campaign')
  @Roles('owner', 'admin', 'agent')
  async handleLeaveCampaign(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { campaignId: string },
  ) {
    try {
      const { campaignId } = data;
      
      // Leave campaign-specific room
      await client.leave(`campaign:${campaignId}`);
      
      client.emit('left-campaign', {
        campaignId,
        message: `Left campaign ${campaignId}`,
      });

      this.logger.log(`Client ${client.id} left campaign ${campaignId}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      client.emit('error', { message: `Failed to leave campaign: ${errorMessage}` });
    }
  }

  @SubscribeMessage('get-campaign-stats')
  @Roles('owner', 'admin', 'agent')
  async handleGetCampaignStats(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { campaignId: string },
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        client.emit('error', { message: 'Client not authenticated' });
        return;
      }

      const { campaignId } = data;
      const { companyId } = clientInfo;

      // Get campaign statistics
      const stats = await this.campaignsService.getStats(campaignId, companyId);
      
      client.emit('campaign-stats', {
        campaignId,
        stats,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      client.emit('error', { message: `Failed to get campaign stats: ${errorMessage}` });
    }
  }

  /**
   * Emit campaign progress event to all clients in the campaign room
   * 
   * FRONTEND: Este evento será recebido automaticamente por todos os clientes
   * que estão na sala da campanha. Use para atualizar progress bars, contadores
   * e estimativas de tempo em tempo real.
   */
  async emitCampaignProgress(event: CampaignProgressEvent) {
    this.server.to(`campaign:${event.campaignId}`).emit('campaign.progress', event);
    this.logger.log(`Emitted progress for campaign ${event.campaignId}: ${event.progress}%`);
  }

  /**
   * Emit campaign finished event to all clients in the campaign room
   * 
   * FRONTEND: Este evento será recebido quando a campanha for finalizada.
   * Use para mostrar notificações, atualizar status e exibir relatórios finais.
   */
  async emitCampaignFinished(event: CampaignFinishedEvent) {
    this.server.to(`campaign:${event.campaignId}`).emit('campaign.finished', event);
    this.logger.log(`Emitted finished event for campaign ${event.campaignId}: ${event.status}`);
  }

  /**
   * Emit campaign error event to all clients in the campaign room
   * 
   * FRONTEND: Este evento será recebido quando ocorrer um erro na campanha.
   * Use para mostrar alertas e permitir ações corretivas.
   */
  async emitCampaignError(campaignId: string, companyId: string, error: string) {
    this.server.to(`campaign:${campaignId}`).emit('campaign.error', {
      campaignId,
      companyId,
      error,
      timestamp: new Date().toISOString(),
    });
    this.logger.error(`Emitted error for campaign ${campaignId}: ${error}`);
  }

  /**
   * Get connected clients count for a specific campaign
   * 
   * FRONTEND: Use para mostrar quantos usuários estão acompanhando a campanha
   */
  getCampaignClientsCount(campaignId: string): number {
    const room = this.server.sockets.adapter.rooms.get(`campaign:${campaignId}`);
    return room ? room.size : 0;
  }

  /**
   * Get all connected clients for a company
   * 
   * FRONTEND: Use para analytics e monitoramento de usuários ativos
   */
  getCompanyClientsCount(companyId: string): number {
    return Array.from(this.connectedClients.values()).filter(
      client => client.companyId === companyId
    ).length;
  }
}
