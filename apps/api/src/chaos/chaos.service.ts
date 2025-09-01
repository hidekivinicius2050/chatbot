import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface ChaosConfig {
  target: 'redis' | 'postgres' | 'provider' | 'webhook' | 'latency';
  mode: 'down' | '500' | '429' | 'timeout' | 'slow';
  ttlSec: number;
  metadata?: any;
}

@Injectable()
export class ChaosService {
  private readonly logger = new Logger(ChaosService.name);
  private activeChaos: Map<string, { config: ChaosConfig; expiresAt: Date }> = new Map();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  // Verificar se o usuário pode injetar caos (apenas OWNER em dev/test)
  private canInjectChaos(userRole: string): boolean {
    const nodeEnv = this.configService.get('NODE_ENV', 'development');
    return userRole === 'OWNER' && nodeEnv !== 'production';
  }

  // Injetar falha no Redis
  async injectRedisChaos(config: ChaosConfig, userRole: string): Promise<void> {
    if (!this.canInjectChaos(userRole)) {
      throw new ForbiddenException('Chaos injection not allowed in production');
    }

    const chaosId = `redis_${Date.now()}`;
    const expiresAt = new Date(Date.now() + config.ttlSec * 1000);

    this.activeChaos.set(chaosId, { config, expiresAt });

    this.logger.warn(`Redis chaos injected: ${config.mode} for ${config.ttlSec}s`);

    // Implementar lógica de caos específica
    if (config.mode === 'down') {
      // Simular Redis down (não afeta o serviço real, apenas simula falhas)
      await this.redisService.set(`chaos:redis:down:${chaosId}`, 'true', config.ttlSec);
    }

    // Agendar remoção automática
    setTimeout(() => {
      this.activeChaos.delete(chaosId);
      this.logger.log(`Redis chaos ${chaosId} expired`);
    }, config.ttlSec * 1000);
  }

  // Injetar falha no Postgres
  async injectPostgresChaos(config: ChaosConfig, userRole: string): Promise<void> {
    if (!this.canInjectChaos(userRole)) {
      throw new ForbiddenException('Chaos injection not allowed in production');
    }

    const chaosId = `postgres_${Date.now()}`;
    const expiresAt = new Date(Date.now() + config.ttlSec * 1000);

    this.activeChaos.set(chaosId, { config, expiresAt });

    this.logger.warn(`Postgres chaos injected: ${config.mode} for ${config.ttlSec}s`);

    // Implementar lógica de caos específica
    if (config.mode === '500') {
      // Simular erros de banco
      await this.redisService.set(`chaos:postgres:500:${chaosId}`, 'true', config.ttlSec);
    }

    // Agendar remoção automática
    setTimeout(() => {
      this.activeChaos.delete(chaosId);
      this.logger.log(`Postgres chaos ${chaosId} expired`);
    }, config.ttlSec * 1000);
  }

  // Injetar falha no Provider
  async injectProviderChaos(config: ChaosConfig, userRole: string): Promise<void> {
    if (!this.canInjectChaos(userRole)) {
      throw new ForbiddenException('Chaos injection not allowed in production');
    }

    const chaosId = `provider_${Date.now()}`;
    const expiresAt = new Date(Date.now() + config.ttlSec * 1000);

    this.activeChaos.set(chaosId, { config, expiresAt });

    this.logger.warn(`Provider chaos injected: ${config.mode} for ${config.ttlSec}s`);

    // Implementar lógica de caos específica
    if (config.mode === '500') {
      await this.redisService.set(`chaos:provider:500:${chaosId}`, 'true', config.ttlSec);
    } else if (config.mode === '429') {
      await this.redisService.set(`chaos:provider:429:${chaosId}`, 'true', config.ttlSec);
    }

    // Agendar remoção automática
    setTimeout(() => {
      this.activeChaos.delete(chaosId);
      this.logger.log(`Provider chaos ${chaosId} expired`);
    }, config.ttlSec * 1000);
  }

  // Injetar latência extra
  async injectLatencyChaos(config: ChaosConfig, userRole: string): Promise<void> {
    if (!this.canInjectChaos(userRole)) {
      throw new ForbiddenException('Chaos injection not allowed in production');
    }

    const chaosId = `latency_${Date.now()}`;
    const expiresAt = new Date(Date.now() + config.ttlSec * 1000);

    this.activeChaos.set(chaosId, { config, expiresAt });

    this.logger.warn(`Latency chaos injected: ${config.mode} for ${config.ttlSec}s`);

    // Implementar lógica de caos específica
    if (config.mode === 'slow') {
      const delayMs = config.metadata?.delayMs || 200;
      await this.redisService.set(`chaos:latency:slow:${chaosId}`, delayMs.toString(), config.ttlSec);
    }

    // Agendar remoção automática
    setTimeout(() => {
      this.activeChaos.delete(chaosId);
      this.logger.log(`Latency chaos ${chaosId} expired`);
    }, config.ttlSec * 1000);
  }

  // Verificar se há caos ativo para um serviço
  async isChaosActive(target: string): Promise<boolean> {
    for (const [chaosId, chaos] of this.activeChaos.entries()) {
      if (chaos.config.target === target && chaos.expiresAt > new Date()) {
        return true;
      }
    }
    return false;
  }

  // Obter configuração de caos ativa
  async getActiveChaos(target: string): Promise<ChaosConfig | null> {
    for (const [chaosId, chaos] of this.activeChaos.entries()) {
      if (chaos.config.target === target && chaos.expiresAt > new Date()) {
        return chaos.config;
      }
    }
    return null;
  }

  // Listar todos os caos ativos
  getActiveChaosList(): Array<{ id: string; config: ChaosConfig; expiresAt: Date }> {
    const now = new Date();
    const active = [];

    for (const [chaosId, chaos] of this.activeChaos.entries()) {
      if (chaos.expiresAt > now) {
        active.push({
          id: chaosId,
          config: chaos.config,
          expiresAt: chaos.expiresAt,
        });
      }
    }

    return active;
  }

  // Remover caos ativo
  async removeChaos(chaosId: string, userRole: string): Promise<void> {
    if (!this.canInjectChaos(userRole)) {
      throw new ForbiddenException('Chaos removal not allowed in production');
    }

    if (this.activeChaos.has(chaosId)) {
      this.activeChaos.delete(chaosId);
      this.logger.log(`Chaos ${chaosId} manually removed`);
    }
  }

  // Limpar todos os caos ativos
  async clearAllChaos(userRole: string): Promise<void> {
    if (!this.canInjectChaos(userRole)) {
      throw new ForbiddenException('Chaos clearing not allowed in production');
    }

    const count = this.activeChaos.size;
    this.activeChaos.clear();
    this.logger.log(`All chaos cleared (${count} active)`);
  }

  // Simular falha baseada no caos ativo
  async simulateFailure(target: string, operation: string): Promise<void> {
    const chaos = await this.getActiveChaos(target);
    if (!chaos) return;

    this.logger.debug(`Simulating ${chaos.mode} failure for ${target}:${operation}`);

    switch (chaos.mode) {
      case 'down':
        throw new Error(`Simulated ${target} down`);
      case '500':
        throw new Error(`Simulated ${target} 500 error`);
      case '429':
        throw new Error(`Simulated ${target} rate limit`);
      case 'timeout':
        // Simular timeout
        await new Promise(resolve => setTimeout(resolve, 10000));
        throw new Error(`Simulated ${target} timeout`);
      case 'slow':
        // Simular latência extra
        const delayMs = chaos.metadata?.delayMs || 200;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        break;
    }
  }
}
