import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ChaosService, ChaosConfig } from './chaos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/dev/chaos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class ChaosController {
  private readonly logger = new Logger(ChaosController.name);

  constructor(private chaosService: ChaosService) {}

  // Injetar caos no Redis
  @Post('redis')
  async injectRedisChaos(
    @Body() config: any,
    @Request() req: any,
  ) {
    this.logger.warn(`Redis chaos injection requested by user ${req.user.id}`);
    
    await this.chaosService.injectRedisChaos(config, req.user.role);
    
    return {
      success: true,
      message: `Redis chaos injected: ${config.mode} for ${config.ttlSec}s`,
      target: 'redis',
      expiresAt: new Date(Date.now() + config.ttlSec * 1000),
    };
  }

  // Injetar caos no Postgres
  @Post('postgres')
  async injectPostgresChaos(
    @Body() config: any,
    @Request() req: any,
  ) {
    this.logger.warn(`Postgres chaos injection requested by user ${req.user.id}`);
    
    await this.chaosService.injectPostgresChaos(config, req.user.role);
    
    return {
      success: true,
      message: `Postgres chaos injected: ${config.mode} for ${config.ttlSec}s`,
      target: 'postgres',
      expiresAt: new Date(Date.now() + config.ttlSec * 1000),
    };
  }

  // Injetar caos no Provider
  @Post('provider')
  async injectProviderChaos(
    @Body() config: any,
    @Request() req: any,
  ) {
    this.logger.warn(`Provider chaos injection requested by user ${req.user.id}`);
    
    await this.chaosService.injectProviderChaos(config, req.user.role);
    
    return {
      success: true,
      message: `Provider chaos injected: ${config.mode} for ${config.ttlSec}s`,
      target: 'provider',
      expiresAt: new Date(Date.now() + config.ttlSec * 1000),
    };
  }

  // Injetar latência extra
  @Post('latency')
  async injectLatencyChaos(
    @Body() config: any,
    @Request() req: any,
  ) {
    this.logger.warn(`Latency chaos injection requested by user ${req.user.id}`);
    
    await this.chaosService.injectLatencyChaos(config, req.user.role);
    
    return {
      success: true,
      message: `Latency chaos injected: ${config.mode} for ${config.ttlSec}s`,
      target: 'latency',
      expiresAt: new Date(Date.now() + config.ttlSec * 1000),
    };
  }

  // Listar caos ativos
  @Get()
  async listActiveChaos(@Request() req: any) {
    const activeChaos = this.chaosService.getActiveChaosList();
    
    return {
      success: true,
      data: activeChaos,
      count: activeChaos.length,
    };
  }

  // Verificar caos específico
  @Get(':target')
  async checkChaos(
    @Param('target') target: string,
    @Request() req: any,
  ) {
    const isActive = await this.chaosService.isChaosActive(target);
    const config = await this.chaosService.getActiveChaos(target);
    
    return {
      success: true,
      target,
      isActive,
      config: config || null,
    };
  }

  // Remover caos específico
  @Delete(':chaosId')
  async removeChaos(
    @Param('chaosId') chaosId: string,
    @Request() req: any,
  ) {
    await this.chaosService.removeChaos(chaosId, req.user.role);
    
    return {
      success: true,
      message: `Chaos ${chaosId} removed`,
    };
  }

  // Limpar todos os caos
  @Delete()
  async clearAllChaos(@Request() req: any) {
    await this.chaosService.clearAllChaos(req.user.role);
    
    return {
      success: true,
      message: 'All chaos cleared',
    };
  }

  // Endpoint de teste para verificar se o caos está funcionando
  @Post('test/:target')
  async testChaos(
    @Param('target') target: string,
    @Request() req: any,
  ) {
    try {
      await this.chaosService.simulateFailure(target, 'test');
      return {
        success: true,
        message: `No chaos active for ${target}`,
        target,
      };
    } catch (error) {
      return {
        success: false,
        message: `Chaos active for ${target}: ${error instanceof Error ? error.message : String(error)}`,
        target,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
