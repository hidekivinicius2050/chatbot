import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
export class AppWebSocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-conversation')
  @UseGuards(DevAuthGuard)
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const conversationId = data.conversationId;
    await client.join(`conversation:${conversationId}`);
    
    return {
      event: 'joined_conversation',
      conversationId,
      message: 'Joined conversation room',
    };
  }

  @SubscribeMessage('leave-conversation')
  @UseGuards(DevAuthGuard)
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const conversationId = data.conversationId;
    await client.leave(`conversation:${conversationId}`);
    
    return {
      event: 'left_conversation',
      conversationId,
      message: 'Left conversation room',
    };
  }

  @SubscribeMessage('typing')
  @UseGuards(DevAuthGuard)
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, isTyping } = data;
    
    // Emitir para outros usuários na conversa
    client.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      isTyping,
      userId: 'dev-user-id', // Em desenvolvimento
    });
    
    return {
      event: 'typing_sent',
      conversationId,
      isTyping,
    };
  }

  // Método para emitir mensagens para todos os clientes em uma conversa
  emitMessage(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('new_message', {
      conversationId,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Método para emitir status de usuário
  emitUserStatus(userId: string, status: 'online' | 'offline' | 'away') {
    this.server.emit('user_status_change', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // Método para emitir notificações
  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', {
      notification,
      timestamp: new Date().toISOString(),
    });
  }
}
