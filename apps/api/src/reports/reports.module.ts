import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MetricsRollupWorker } from './workers/metrics-rollup.worker';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService, MetricsRollupWorker],
  exports: [ReportsService],
})
export class ReportsModule {}
