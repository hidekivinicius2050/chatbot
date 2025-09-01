import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  // Cache para Dashboard (TTL baixo)
  async getDashboardCache<T>(key: string, companyId: string): Promise<T | null> {
    const cacheKey = this.buildCacheKey('dashboard', companyId, key);
    
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Dashboard cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Error reading dashboard cache: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return null;
  }

  async setDashboardCache<T>(key: string, companyId: string, data: T): Promise<void> {
    const cacheKey = this.buildCacheKey('dashboard', companyId, key);
    const ttl = this.configService.get('CACHE_DASHBOARD_TTL_S', 15);
    
    try {
      await this.redisService.set(cacheKey, JSON.stringify(data), ttl);
      this.logger.debug(`Dashboard cache set: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.warn(`Error setting dashboard cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Cache para Settings (TTL alto)
  async getSettingsCache<T>(key: string, companyId: string): Promise<T | null> {
    const cacheKey = this.buildCacheKey('settings', companyId, key);
    
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Settings cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Error reading settings cache: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return null;
  }

  async setSettingsCache<T>(key: string, companyId: string, data: T): Promise<void> {
    const cacheKey = this.buildCacheKey('settings', companyId, key);
    const ttl = this.configService.get('CACHE_SETTINGS_TTL_S', 300);
    
    try {
      await this.redisService.set(cacheKey, JSON.stringify(data), ttl);
      this.logger.debug(`Settings cache set: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.warn(`Error setting settings cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Cache genérico
  async getCache<T>(key: string, companyId: string, namespace: string = 'general'): Promise<T | null> {
    const cacheKey = this.buildCacheKey(namespace, companyId, key);
    
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Error reading cache: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return null;
  }

  async setCache<T>(key: string, companyId: string, data: T, ttl: number, namespace: string = 'general'): Promise<void> {
    const cacheKey = this.buildCacheKey(namespace, companyId, key);
    
    try {
      await this.redisService.set(cacheKey, JSON.stringify(data), ttl);
      this.logger.debug(`Cache set: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.warn(`Error setting cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Invalidação de cache
  async invalidateCache(pattern: string, companyId: string): Promise<void> {
    const cachePattern = this.buildCacheKey(pattern, companyId, '*');
    
    try {
      const keys = await this.redisService.keys(cachePattern);
      if (keys.length > 0) {
        for (const key of keys) {
          await this.redisService.del(key);
        }
        this.logger.debug(`Cache invalidated: ${keys.length} keys matching ${cachePattern}`);
      }
    } catch (error) {
      this.logger.warn(`Error invalidating cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Invalidação específica
  async invalidateKey(key: string, companyId: string, namespace: string = 'general'): Promise<void> {
    const cacheKey = this.buildCacheKey(namespace, companyId, key);
    
    try {
      await this.redisService.del(cacheKey);
      this.logger.debug(`Cache key invalidated: ${cacheKey}`);
    } catch (error) {
      this.logger.warn(`Error invalidating cache key: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Invalidação por namespace
  async invalidateNamespace(namespace: string, companyId: string): Promise<void> {
    const cachePattern = this.buildCacheKey(namespace, companyId, '*');
    
    try {
      const keys = await this.redisService.keys(cachePattern);
      if (keys.length > 0) {
        for (const key of keys) {
          await this.redisService.del(key);
        }
        this.logger.debug(`Namespace cache invalidated: ${keys.length} keys for ${namespace}`);
      }
    } catch (error) {
      this.logger.warn(`Error invalidating namespace cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Limpar todo o cache de uma company
  async clearCompanyCache(companyId: string): Promise<void> {
    const cachePattern = `ac:${companyId}:*`;
    
    try {
      const keys = await this.redisService.keys(cachePattern);
      if (keys.length > 0) {
        for (const key of keys) {
          await this.redisService.del(key);
        }
        this.logger.debug(`Company cache cleared: ${keys.length} keys for company ${companyId}`);
      }
    } catch (error) {
      this.logger.warn(`Error clearing company cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Estatísticas do cache
  async getCacheStats(companyId: string): Promise<{
    dashboard: { hits: number; misses: number; keys: number };
    settings: { hits: number; misses: number; keys: number };
    general: { hits: number; misses: number; keys: number };
  }> {
    try {
      const dashboardPattern = this.buildCacheKey('dashboard', companyId, '*');
      const settingsPattern = this.buildCacheKey('settings', companyId, '*');
      const generalPattern = this.buildCacheKey('general', companyId, '*');

      const [dashboardKeys, settingsKeys, generalKeys] = await Promise.all([
        this.redisService.keys(dashboardPattern),
        this.redisService.keys(settingsPattern),
        this.redisService.keys(generalPattern),
      ]);

      return {
        dashboard: {
          hits: 0, // Seria implementado com contadores Redis
          misses: 0,
          keys: dashboardKeys.length,
        },
        settings: {
          hits: 0,
          misses: 0,
          keys: settingsKeys.length,
        },
        general: {
          hits: 0,
          misses: 0,
          keys: generalKeys.length,
        },
      };
    } catch (error) {
      this.logger.warn(`Error getting cache stats: ${error instanceof Error ? error.message : String(error)}`);
      return {
        dashboard: { hits: 0, misses: 0, keys: 0 },
        settings: { hits: 0, misses: 0, keys: 0 },
        general: { hits: 0, misses: 0, keys: 0 },
      };
    }
  }

  // Construir chave de cache com namespace
  private buildCacheKey(namespace: string, companyId: string, key: string): string {
    return `ac:${companyId}:${namespace}:${key}`;
  }

  // Verificar se o cache está funcionando
  async isHealthy(): Promise<boolean> {
    try {
      await this.redisService.ping();
      return true;
    } catch (error) {
      this.logger.error(`Cache health check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
