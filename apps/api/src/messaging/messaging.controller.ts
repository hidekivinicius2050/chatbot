import { Controller, Post, Body, Param, Get, UseGuards, Request } from '@nestjs/common';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
// import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('messaging')
@Controller('messaging')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Enviar mensagem' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Canal ou contato não encontrado' })
  async sendMessage(@Body() sendMessageDto: any, @Request() req: any) {
    return this.messagingService.sendMessage(sendMessageDto, req.user.companyId);
  }

  @Get('channels/:channelId/qrcode')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Gerar QR code para canal' })
  @ApiResponse({ status: 200, description: 'QR code gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  async generateQRCode(@Param('channelId') channelId: string, @Request() req: any) {
    return this.messagingService.generateQRCode(channelId, req.user.companyId);
  }

  @Post('channels/:channelId/connect/cloud')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Conectar canal via API cloud' })
  @ApiResponse({ status: 200, description: 'Canal conectado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  async connectCloudChannel(
    @Param('channelId') channelId: string,
    @Body() connectData: any,
    @Request() req: any,
  ) {
    return this.messagingService.connectWhatsAppCloud(channelId, req.user.companyId, connectData);
  }

  @Get('channels/:channelId/status')
  @Roles('ADMIN', 'AGENT', 'OWNER')
  @ApiOperation({ summary: 'Verificar status do canal' })
  @ApiResponse({ status: 200, description: 'Status do canal' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  async getChannelStatus(@Param('channelId') channelId: string, @Request() req: any) {
    return this.messagingService.getChannelStatus(channelId, req.user.companyId);
  }
}
