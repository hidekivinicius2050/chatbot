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
import { DevAuthGuard } from '../auth/guards/dev-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AutomationsService } from './automations.service';
// import { CreateAutomationDto } from './dto/create-automation.dto';
// import { UpdateAutomationDto } from './dto/update-automation.dto';
// import { QueryAutomationsDto } from './dto/query-automations.dto';

@ApiTags('automations')
@Controller('automations')
@UseGuards(DevAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Criar nova automação' })
  @ApiResponse({ status: 201, description: 'Automação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createAutomationDto: any, @Request() req: any) {
    return this.automationsService.create(createAutomationDto, req.user.companyId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar automações' })
  @ApiResponse({ status: 200, description: 'Lista de automações' })
  findAll(@Query() query: any, @Request() req: any) {
    return this.automationsService.findAll(query, req.user.companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas das automações' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  getStats(@Request() req: any) {
    return this.automationsService.getStats(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar automação por ID' })
  @ApiResponse({ status: 200, description: 'Automação encontrada' })
  @ApiResponse({ status: 404, description: 'Automação não encontrada' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.automationsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Atualizar automação' })
  @ApiResponse({ status: 200, description: 'Automação atualizada' })
  @ApiResponse({ status: 404, description: 'Automação não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateAutomationDto: any,
    @Request() req: any,
  ) {
    return this.automationsService.update(id, updateAutomationDto, req.user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Remover automação' })
  @ApiResponse({ status: 200, description: 'Automação removida' })
  @ApiResponse({ status: 404, description: 'Automação não encontrada' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.automationsService.remove(id, req.user.companyId);
  }

  @Post(':id/test')
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Testar automação' })
  @ApiResponse({ status: 200, description: 'Automação testada com sucesso' })
  @ApiResponse({ status: 404, description: 'Automação não encontrada' })
  test(@Param('id') id: string, @Request() req: any) {
    return this.automationsService.test(id, { eventMock: { test: 'test' } }, req.user.companyId || 'dev-company-id');
  }
}
