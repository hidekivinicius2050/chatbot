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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto, UpdateAutomationDto, QueryAutomationsDto, TestAutomationDto } from './dto/automation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { FeatureGuard } from '../billing/guards/feature.guard';
// import { RequireFeature } from '../billing/decorators/require-feature.decorator';

@ApiTags('Automations')
@Controller('api/v1/automations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  // @UseGuards(FeatureGuard)
  // @RequireFeature('feature.automations')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Create a new automation' })
  @ApiResponse({ status: 201, description: 'Automation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid automation data' })
  @ApiResponse({ status: 403, description: 'Feature not available in current plan' })
  async create(
    @Body() createAutomationDto: CreateAutomationDto,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    return this.automationsService.create(createAutomationDto, companyId, userId);
  }

  @Get()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get all automations with pagination' })
  @ApiResponse({ status: 200, description: 'Automations retrieved successfully' })
  async findAll(
    @Query() query: QueryAutomationsDto,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.automationsService.findAll(query, companyId);
  }

  @Get('stats')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Get automation statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    const companyId = req.user.companyId;
    return this.automationsService.getStats(companyId);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get automation by ID' })
  @ApiResponse({ status: 200, description: 'Automation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Automation not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.automationsService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update automation' })
  @ApiResponse({ status: 200, description: 'Automation updated successfully' })
  @ApiResponse({ status: 404, description: 'Automation not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAutomationDto: UpdateAutomationDto,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.automationsService.update(id, updateAutomationDto, companyId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete automation' })
  @ApiResponse({ status: 204, description: 'Automation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Automation not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    await this.automationsService.remove(id, companyId);
  }

  @Post(':id/test')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Test automation with mock event' })
  @ApiResponse({ status: 200, description: 'Automation test completed' })
  @ApiResponse({ status: 404, description: 'Automation not found' })
  async test(
    @Param('id') id: string,
    @Body() testAutomationDto: TestAutomationDto,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.automationsService.test(id, testAutomationDto, companyId);
  }
}
