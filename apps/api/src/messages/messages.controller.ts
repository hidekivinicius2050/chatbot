import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuotaGuard } from '../billing/guards/quota.guard';
import { RequireQuota } from '../billing/decorators/quota.decorator';

@ApiTags('Messages')
@Controller('tickets/:ticketId/messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(QuotaGuard)
  @RequireQuota({ key: 'messages.monthly', increment: 1 })
  @ApiOperation({ summary: 'Enviar mensagem para um ticket' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  @ApiResponse({ status: 403, description: 'Quota excedida' })
  create(
    @Param('ticketId') ticketId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: any,
  ) {
    return this.messagesService.create(
      {
        ...createMessageDto,
        senderId: req.user.id,
      },
      req.user.companyId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar mensagens de um ticket com paginação' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  findAll(
    @Param('ticketId') ticketId: string,
    @Query() query: QueryMessagesDto,
    @Request() req: any,
  ) {
    return this.messagesService.findAll(ticketId, query, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar mensagem por ID' })
  @ApiResponse({ status: 200, description: 'Mensagem encontrada' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.findOne(id, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover mensagem' })
  @ApiResponse({ status: 200, description: 'Mensagem removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.remove(id, req.user.companyId);
  }
}
