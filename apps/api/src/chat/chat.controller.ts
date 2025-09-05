import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Listar conversas' })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.companyId || 'dev-company-id');
  }

  @Get('conversations/:id')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Obter conversa específica' })
  @ApiResponse({ status: 200, description: 'Conversa encontrada' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async getConversation(@Param('id') id: string, @Request() req: any) {
    return this.chatService.getConversation(id, req.user.companyId || 'dev-company-id');
  }

  @Get('conversations/:id/messages')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Obter mensagens de uma conversa' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async getMessages(@Param('id') id: string, @Request() req: any) {
    return this.chatService.getMessages(id, req.user.companyId || 'dev-company-id');
  }

  @Post('conversations/:id/messages')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Enviar mensagem' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async sendMessage(
    @Param('id') id: string,
    @Body() messageData: any,
    @Request() req: any
  ) {
    return this.chatService.sendMessage(id, messageData, req.user.companyId || 'dev-company-id');
  }

  @Put('conversations/:id/status')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Atualizar status da conversa' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async updateConversationStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: any
  ) {
    return this.chatService.updateConversationStatus(id, body.status, req.user.companyId || 'dev-company-id');
  }

  @Put('conversations/:id/assign')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Atribuir conversa a um agente' })
  @ApiResponse({ status: 200, description: 'Conversa atribuída com sucesso' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async assignConversation(
    @Param('id') id: string,
    @Body() body: { assignedTo: any },
    @Request() req: any
  ) {
    return this.chatService.assignConversation(id, body.assignedTo, req.user.companyId || 'dev-company-id');
  }
}
