import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PiiRedactorService } from './pii-redactor.service';
import { AuditRetentionWorker } from './workers/audit-retention.worker';

@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditService, PiiRedactorService, AuditRetentionWorker],
  exports: [AuditService, PiiRedactorService],
})
export class AuditModule {}
