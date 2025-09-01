import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from '../audit.service';
import { config } from '@atendechat/config';

@Injectable()
export class AuditRetentionWorker {
  private readonly logger = new Logger(AuditRetentionWorker.name);

  constructor(private readonly auditService: AuditService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldAuditLogs() {
    if (config.env === 'test') {
      return;
    }

    this.logger.log('Starting audit log cleanup...');

    try {
      const deletedCount = await this.auditService.cleanupOldLogs();
      this.logger.log(`Cleaned up ${deletedCount} old audit logs`);
    } catch (error) {
      this.logger.error('Failed to cleanup old audit logs', error);
    }
  }
}
