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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';

import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { QueryChannelsDto } from './dto/query-channels.dto';

@ApiTags('channels')
@Controller('api/v1/channels')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Criar novo canal' })
  @ApiResponse({ status: 201, description: 'Canal criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createChannelDto: CreateChannelDto, @Request() req: any) {
    return this.channelsService.create(createChannelDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar canais' })
  @ApiResponse({ status: 200, description: 'Lista de canais' })
  findAll(@Query() query: QueryChannelsDto, @Request() req: any) {
    return this.channelsService.findAll(query, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar canal por ID' })
  @ApiResponse({ status: 200, description: 'Canal encontrado' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.channelsService.findOne(id, req.user.companyId);
  }

  @Get(':id/qrcode')
  @ApiOperation({ summary: 'Gerar QR code para canal Baileys' })
  @ApiResponse({ status: 200, description: 'QR code gerado' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  async generateQRCode(@Param('id') id: string, @Request() req: any) {
    const channel = await this.channelsService.findOne(id, req.user.companyId);
    
    if (channel.type !== 'whatsapp-baileys') {
      throw new Error('QR code só está disponível para canais Baileys');
    }

    // TODO: Implementar geração real de QR code via Baileys
    return {
      qrCode: 'data:image/png;base64,QR_CODE_SIMULADO',
      channelId: id,
      type: 'baileys',
    };
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Atualizar canal' })
  @ApiResponse({ status: 200, description: 'Canal atualizado' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
    @Request() req: any,
  ) {
    return this.channelsService.update(id, updateChannelDto, req.user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover canal' })
  @ApiResponse({ status: 204, description: 'Canal removido' })
  @ApiResponse({ status: 404, description: 'Canal não encontrado' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.channelsService.remove(id, req.user.companyId);
  }
}
