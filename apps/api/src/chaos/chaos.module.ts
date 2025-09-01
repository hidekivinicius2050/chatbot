import { Module } from '@nestjs/common';
import { ChaosController } from './chaos.controller';
import { ChaosService } from './chaos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ChaosController],
  providers: [ChaosService],
  exports: [ChaosService],
})
export class ChaosModule {}
