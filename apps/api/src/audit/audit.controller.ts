import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
// import { QueryAuditDto } from './dto/query-audit.dto';

@ApiTags('audit')
@Controller('audit')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiResponse({ status: 200, description: 'Logs de auditoria obtidos' })
  findAll(@Query() query: any, @Request() req: any) {
    return this.auditService.findMany(req.user.companyId, query);
  }

  @Get('stats')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Obter estatísticas de auditoria' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas' })
  getStats(@Request() req: any) {
    return this.auditService.getStats(req.user.companyId);
  }
}
