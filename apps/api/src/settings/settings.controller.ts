import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
// import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
// import { UpdateSlaDto } from './dto/update-sla.dto';

@ApiTags('settings')
@Controller('settings')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business-hours')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Obter horário de funcionamento' })
  @ApiResponse({ status: 200, description: 'Horário de funcionamento obtido' })
  getBusinessHours(@Request() req: any) {
    return this.settingsService.getBusinessHours(req.user.companyId);
  }

  @Put('business-hours')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Atualizar horário de funcionamento' })
  @ApiResponse({ status: 200, description: 'Horário de funcionamento atualizado' })
  updateBusinessHours(
    @Body() updateBusinessHoursDto: any,
    @Request() req: any,
  ) {
    return this.settingsService.updateBusinessHours(
      updateBusinessHoursDto,
      req.user.companyId,
    );
  }

  @Get('sla')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Obter configurações de SLA' })
  @ApiResponse({ status: 200, description: 'Configurações de SLA obtidas' })
  getSla(@Request() req: any) {
    return this.settingsService.getSla(req.user.companyId);
  }

  @Put('sla')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Atualizar configurações de SLA' })
  @ApiResponse({ status: 200, description: 'Configurações de SLA atualizadas' })
  updateSla(
    @Body() updateSlaDto: any,
    @Request() req: any,
  ) {
    return this.settingsService.updateSla(updateSlaDto, req.user.companyId);
  }

  @Get('reports/sla/daily')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Obter relatório diário de SLA' })
  @ApiResponse({ status: 200, description: 'Relatório diário de SLA obtido' })
  getDailySlaReport(@Request() req: any) {
    const today = new Date().toISOString().split('T')[0] as string;
    const companyId = req.user?.companyId ?? 'dev-company-id';
    return this.settingsService.getSlaDailyReport(companyId, today, today);
  }

  @Get('reports/sla/summary')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Obter resumo de SLA' })
  @ApiResponse({ status: 200, description: 'Resumo de SLA obtido' })
  getSlaSummary(@Request() req: any) {
    return this.settingsService.getSlaSummary(req.user.companyId);
  }
}
