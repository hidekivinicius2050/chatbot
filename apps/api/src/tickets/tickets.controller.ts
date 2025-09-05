import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(DevAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo ticket' })
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(
    @Body() createTicketDto: any,
    @Request() req: any,
  ) {
    return this.ticketsService.create(
      createTicketDto,
      req.user.companyId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar tickets com paginação' })
  @ApiResponse({ status: 200, description: 'Lista de tickets' })
  findAll(@Query() query: QueryTicketsDto, @Request() req: any) {
    return this.ticketsService.findAll(query, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ticket por ID' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.ticketsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ticket' })
  @ApiResponse({ status: 200, description: 'Ticket atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req: any,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover ticket' })
  @ApiResponse({ status: 200, description: 'Ticket removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.ticketsService.remove(id, req.user.companyId);
  }
}
