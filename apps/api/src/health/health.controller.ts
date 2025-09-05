import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({ status: 200, description: 'Status de saúde obtido' })
  check() {
    return this.healthService.check();
  }
}
