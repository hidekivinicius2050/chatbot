import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AppWebSocketGateway } from '../../websocket/websocket.gateway';
import { EntitlementsService } from '../entitlements.service';

@Processor('billing')
export class BillingQuotaNotifyWorker {
  private readonly logger = new Logger(BillingQuotaNotifyWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: AppWebSocketGateway,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  @Process('quota:notify')
  async handleQuotaNotification(job: Job) {
    this.logger.log('Starting quota notification job');

    try {
      // Buscar todas as empresas com assinaturas ativas
      const companies = await this.prisma.company.findMany({
        where: {
          subscription: {
            status: { in: ['active', 'trialing'] },
          },
        },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      for (const company of companies) {
        await this.checkAndNotifyQuota(company.id);
      }

      this.logger.log(`Quota notification job completed for ${companies.length} companies`);
    } catch (error) {
      this.logger.error('Error in quota notification job', error);
      throw error;
    }
  }

  private async checkAndNotifyQuota(companyId: string) {
    try {
      const entitlements = await this.entitlementsService.get(companyId);
      const usage = await this.entitlementsService.getUsage(companyId);

      const quotaChecks = [
        {
          key: 'messages.monthly',
          used: usage.messages.monthly,
          max: entitlements['messages.monthly.max'] as number,
        },
        {
          key: 'campaigns.daily',
          used: usage.campaigns.daily,
          max: entitlements['campaigns.daily.max'] as number,
        },
        {
          key: 'users',
          used: usage.users,
          max: entitlements['users.max'] as number,
        },
        {
          key: 'channels',
          used: usage.channels,
          max: entitlements['channels.max'] as number,
        },
      ];

      for (const check of quotaChecks) {
        if (check.max > 0) {
          const percentage = (check.used / check.max) * 100;

          // Enviar notificação se cruzar os limites
          if (percentage >= 80) {
            const warningLevel = percentage >= 100 ? 'critical' : percentage >= 90 ? 'warning' : 'info';

            const notification = {
              type: 'billing.quota.warning',
              data: {
                key: check.key,
                used: check.used,
                max: check.max,
                percentage: Math.round(percentage),
                level: warningLevel,
              },
            };

            // Enviar via WebSocket
            this.websocketGateway.server
              .to(`company:${companyId}`)
              .emit('billing.quota.warning', notification.data);

            this.logger.log(
              `Quota warning sent for company ${companyId}: ${check.key} at ${Math.round(percentage)}%`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error checking quota for company ${companyId}`, error);
    }
  }
}
