import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class AppWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients = new Map<string, { socket: Socket; companyId: string; userId: string }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || 
                   client.handshake.headers.authorization?.replace('Bearer ', '') ||
                   client.handshake.headers.authorization;
      
      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET não configurado');
      }
      
      const payload = this.jwtService.verify(token, {
        secret,
      });

      const companyId = payload.companyId;
      const userId = payload.sub;

      // Adicionar cliente à lista de conectados
      this.connectedClients.set(client.id, { socket: client, companyId, userId });

      // Juntar o cliente ao namespace da empresa
      await client.join(`company:${companyId}`);

      this.logger.log(`Cliente conectado: ${client.id} (Company: ${companyId}, User: ${userId})`);

      // Enviar evento de conexão bem-sucedida
      client.emit('connected', {
        companyId,
        userId,
        timestamp: new Date(),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro na conexão WebSocket: ${errorMessage}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`Cliente desconectado: ${client.id} (Company: ${clientInfo.companyId})`);
      this.connectedClients.delete(client.id);
    }
  }

  @SubscribeMessage('join-ticket')
  async handleJoinTicket(client: Socket, payload: { ticketId: string }) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      await client.join(`ticket:${payload.ticketId}`);
      this.logger.log(`Usuário ${clientInfo.userId} entrou no ticket ${payload.ticketId}`);
    }
  }

  @SubscribeMessage('leave-ticket')
  async handleLeaveTicket(client: Socket, payload: { ticketId: string }) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      await client.leave(`ticket:${payload.ticketId}`);
      this.logger.log(`Usuário ${clientInfo.userId} saiu do ticket ${payload.ticketId}`);
    }
  }

  // Métodos para emitir eventos para clientes específicos
  emitToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company:${companyId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  }

  emitToTicket(ticketId: string, event: string, data: any) {
    this.server.to(`ticket:${ticketId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  }

  emitToUser(userId: string, event: string, data: any) {
    const client = Array.from(this.connectedClients.values()).find(c => c.userId === userId);
    if (client) {
      client.socket.emit(event, {
        ...data,
        timestamp: new Date(),
      });
    }
  }

  // Eventos específicos do sistema
  emitTicketUpdated(companyId: string, ticketId: string, data: any) {
    this.emitToCompany(companyId, 'ticket.updated', {
      ticketId,
      ...data,
    });
  }

  emitMessageCreated(companyId: string, ticketId: string, data: any) {
    this.emitToCompany(companyId, 'message.created', {
      ticketId,
      ...data,
    });
    
    // Também emite para o ticket específico
    this.emitToTicket(ticketId, 'message.created', data);
  }

  emitChannelStatusChanged(companyId: string, channelId: string, data: any) {
    this.emitToCompany(companyId, 'channel.status', {
      channelId,
      ...data,
    });
  }

  // Método para obter estatísticas de conexão
  getConnectionStats() {
    const companyStats = new Map<string, number>();
    
    for (const client of this.connectedClients.values()) {
      const count = companyStats.get(client.companyId) || 0;
      companyStats.set(client.companyId, count + 1);
    }

    return {
      totalConnections: this.connectedClients.size,
      companyStats: Object.fromEntries(companyStats),
    };
  }
}
