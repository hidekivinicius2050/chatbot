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
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit.dto';

@ApiTags('Audit')
@Controller('api/v1/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs de auditoria paginada',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findMany(@Query() query: AuditQueryDto, @Request() req: any) {
    this.logger.debug(`Fetching audit logs for company ${req.companyId}`);
    
    return this.auditService.findMany(req.companyId, query);
  }

  @Get('stats')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Estatísticas de auditoria' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas dos logs de auditoria',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getStats(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: any,
  ) {
    this.logger.debug(`Fetching audit stats for company ${req.companyId}`);
    
    return this.auditService.getStats(req.companyId, from, to);
  }
}
