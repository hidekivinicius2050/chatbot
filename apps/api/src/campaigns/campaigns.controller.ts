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
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { QuotaGuard } from '../billing/guards/quota.guard';
import { RequireQuota } from '../billing/decorators/quota.decorator';

import { CampaignsService } from './campaigns.service';
// import { CreateCampaignDto } from './dto/create-campaign.dto';
// import { UpdateCampaignDto } from './dto/update-campaign.dto';
// import { QueryCampaignsDto } from './dto/query-campaigns.dto';
// import { AddTargetsDto } from './dto/add-targets.dto';

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER')
  @UseGuards(QuotaGuard)
  @RequireQuota({ key: 'campaigns.daily', increment: 1 })
  @ApiOperation({ summary: 'Criar nova campanha' })
  @ApiResponse({ status: 201, description: 'Campanha criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado ou quota excedida' })
  create(@Body() createCampaignDto: any, @Request() req: any) {
    return this.campaignsService.create(createCampaignDto, req.user.companyId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campanhas' })
  @ApiResponse({ status: 200, description: 'Lista de campanhas' })
  findAll(@Query() query: any, @Request() req: any) {
    return this.campaignsService.findAll(query, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar campanha por ID' })
  @ApiResponse({ status: 200, description: 'Campanha encontrada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Atualizar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha atualizada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: any,
    @Request() req: any,
  ) {
    return this.campaignsService.update(id, updateCampaignDto, req.user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover campanha' })
  @ApiResponse({ status: 204, description: 'Campanha removida' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.remove(id, req.user.companyId);
  }

  @Post(':id/targets')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Adicionar alvos à campanha' })
  @ApiResponse({ status: 200, description: 'Alvos adicionados com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  addTargets(
    @Param('id') id: string,
    @Body() addTargetsDto: any,
    @Request() req: any,
  ) {
    return this.campaignsService.addTargets(id, addTargetsDto, req.user.companyId);
  }

  @Post(':id/start')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Iniciar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha iniciada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  start(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.start(id, req.user.companyId);
  }

  @Post(':id/pause')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Pausar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha pausada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  pause(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.pause(id, req.user.companyId);
  }

  @Post(':id/resume')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Retomar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha retomada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  resume(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.resume(id, req.user.companyId);
  }

  @Post(':id/finish')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Finalizar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha finalizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  finish(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.finish(id, req.user.companyId);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Cancelar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha cancelada com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.cancel(id, req.user.companyId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obter estatísticas da campanha' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  getStats(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.getStats(id, req.user.companyId);
  }
}
