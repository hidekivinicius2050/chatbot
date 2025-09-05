import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const env = process.env.NODE_ENV || 'development';

    // DB status
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {}

    // Redis status (simplificado por enquanto)
    let redisOk = false;
    if (process.env.REDIS_URL) {
      redisOk = true; // Assumimos que está funcionando se a URL existe
    }
    
    return {
      up: true,
      environment: env,
      db: dbOk,
      redis: redisOk,
      timestamp: new Date().toISOString(),
    };
  }
}
