import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { ReportQueryDto, DailyReportQueryDto, ReportScope } from './dto/reports.dto';

@ApiTags('Reports')
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @Roles(Role.OWNER, Role.ADMIN, Role.AGENT)
  @ApiOperation({ summary: 'Visão geral dos relatórios' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas gerais do período',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getOverview(
    @Query() query: ReportQueryDto,
    @Request() req: any,
  ) {
    this.logger.debug(`Fetching overview for company ${req.companyId}`);
    
    return this.reportsService.getOverview(
      req.companyId,
      query.from,
      query.to,
    );
  }

  @Get('agents')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Relatório por agente' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas por agente',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getAgentStats(
    @Query() query: ReportQueryDto,
    @Request() req: any,
  ) {
    this.logger.debug(`Fetching agent stats for company ${req.companyId}`);
    
    return this.reportsService.getAgentStats(
      req.companyId,
      query.from,
      query.to,
    );
  }

  @Get('channels')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Relatório por canal' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas por canal',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getChannelStats(
    @Query() query: ReportQueryDto,
    @Request() req: any,
  ) {
    this.logger.debug(`Fetching channel stats for company ${req.companyId}`);
    
    return this.reportsService.getChannelStats(
      req.companyId,
      query.from,
      query.to,
    );
  }

  @Get('daily')
  @Roles(Role.OWNER, Role.ADMIN, Role.AGENT)
  @ApiOperation({ summary: 'Série diária de métricas' })
  @ApiResponse({
    status: 200,
    description: 'Métricas diárias por escopo',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getDailyMetrics(
    @Query() query: DailyReportQueryDto,
    @Request() req: any,
  ) {
    this.logger.debug(`Fetching daily metrics for company ${req.companyId}`);
    
    return this.reportsService.getDailyMetrics(
      req.companyId,
      query.scope || ReportScope.CHAT,
      query.key || 'total',
      query.from,
      query.to,
    );
  }

  @Get('sla/daily')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Relatório SLA diário' })
  @ApiResponse({
    status: 200,
    description: 'Métricas SLA por dia',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getSlaDaily(
    @Query() query: ReportQueryDto,
    @Request() req: any,
  ) {
    this.logger.debug(`Fetching SLA daily for company ${req.companyId}`);
    
    return this.reportsService.getDailyMetrics(
      req.companyId,
      ReportScope.SLA,
      'total',
      query.from,
      query.to,
    );
  }

  @Get('sla/summary')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Resumo SLA' })
  @ApiResponse({
    status: 200,
    description: 'Resumo das métricas SLA',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getSlaSummary(
    @Query() query: ReportQueryDto,
    @Request() req: any,
  ) {
    this.logger.debug(`Fetching SLA summary for company ${req.companyId}`);
    
    const overview = await this.reportsService.getOverview(
      req.companyId,
      query.from,
      query.to,
    );
    
    return {
      sla: overview.sla,
      period: {
        from: query.from,
        to: query.to,
      },
    };
  }
}
