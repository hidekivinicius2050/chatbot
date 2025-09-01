import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateBusinessHoursDto, UpdateSlaDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Settings')
@Controller('api/v1/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Business Hours
  @Get('business-hours')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get business hours configuration' })
  @ApiResponse({ status: 200, description: 'Business hours retrieved successfully' })
  async getBusinessHours(@Request() req: any) {
    const companyId = req.user.companyId;
    return this.settingsService.getBusinessHours(companyId);
  }

  @Put('business-hours')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update business hours configuration' })
  @ApiResponse({ status: 200, description: 'Business hours updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid business hours data' })
  async updateBusinessHours(
    @Body() updateBusinessHoursDto: UpdateBusinessHoursDto,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.settingsService.updateBusinessHours(updateBusinessHoursDto, companyId);
  }

  // SLA
  @Get('sla')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get SLA configuration' })
  @ApiResponse({ status: 200, description: 'SLA configuration retrieved successfully' })
  async getSla(@Request() req: any) {
    const companyId = req.user.companyId;
    return this.settingsService.getSla(companyId);
  }

  @Put('sla')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update SLA configuration' })
  @ApiResponse({ status: 200, description: 'SLA configuration updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid SLA data' })
  async updateSla(
    @Body() updateSlaDto: UpdateSlaDto,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.settingsService.updateSla(updateSlaDto, companyId);
  }

  // SLA Reports
  @Get('reports/sla/daily')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Get daily SLA report' })
  @ApiResponse({ status: 200, description: 'Daily SLA report retrieved successfully' })
  async getSlaDailyReport(
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.settingsService.getSlaDailyReport(companyId, from, to);
  }

  @Get('reports/sla/summary')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Get SLA summary report' })
  @ApiResponse({ status: 200, description: 'SLA summary report retrieved successfully' })
  async getSlaSummary(@Request() req: any) {
    const companyId = req.user.companyId;
    return this.settingsService.getSlaSummary(companyId);
  }
}
