import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@WebSocketGateway({
  namespace: 'campaigns',
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
export class CampaignsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly campaignsService: CampaignsService) {}

  @SubscribeMessage('join-campaign')
  @UseGuards(DevAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AGENT', 'OWNER', 'VIEWER')
  async handleJoinCampaign(
    @MessageBody() data: { campaignId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const campaignId = data.campaignId;
    await client.join(`campaign:${campaignId}`);
    
    return {
      event: 'joined_campaign',
      campaignId,
      message: 'Joined campaign room',
    };
  }

  @SubscribeMessage('leave-campaign')
  @UseGuards(DevAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AGENT', 'OWNER', 'VIEWER')
  async handleLeaveCampaign(
    @MessageBody() data: { campaignId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const campaignId = data.campaignId;
    await client.leave(`campaign:${campaignId}`);
    
    return {
      event: 'left_campaign',
      campaignId,
      message: 'Left campaign room',
    };
  }

  @SubscribeMessage('get-campaign-stats')
  @UseGuards(DevAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AGENT', 'OWNER', 'VIEWER')
  async handleGetCampaignStats(
    @MessageBody() data: { campaignId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const campaignId = data.campaignId;
    const stats = await this.campaignsService.getStats(campaignId, 'dev-company-id');
    
    return {
      event: 'campaign_stats',
      campaignId,
      stats,
    };
  }

  // Método para emitir atualizações de campanha para todos os clientes conectados
  emitCampaignUpdate(campaignId: string, data: any) {
    this.server.to(`campaign:${campaignId}`).emit('campaign_update', {
      campaignId,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Método para emitir estatísticas de campanha
  emitCampaignStats(campaignId: string, stats: any) {
    this.server.to(`campaign:${campaignId}`).emit('campaign_stats_update', {
      campaignId,
      stats,
      timestamp: new Date().toISOString(),
    });
  }

  // Método para emitir progresso de campanha
  emitCampaignProgress(campaignId: string, progress: any) {
    this.server.to(`campaign:${campaignId}`).emit('campaign_progress', {
      campaignId,
      progress,
      timestamp: new Date().toISOString(),
    });
  }
}
