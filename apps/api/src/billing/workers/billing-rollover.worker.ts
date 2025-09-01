import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { config } from '@atendechat/config';

@Processor('billing')
export class BillingRolloverWorker {
  private readonly logger = new Logger(BillingRolloverWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('period:rollover')
  async handlePeriodRollover(job: Job) {
    this.logger.log('Starting billing period rollover job');

    try {
      // Buscar todas as assinaturas ativas
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          status: { in: ['active', 'trialing'] },
        },
        include: {
          plan: true,
          company: true,
        },
      });

      const now = new Date();
      let processedCount = 0;

      for (const subscription of subscriptions) {
        // Verificar se o período atual expirou
        if (now >= subscription.currentPeriodEnd) {
          await this.prisma.$transaction(async (tx) => {
            // Calcular novo período
            const newPeriodStart = subscription.currentPeriodEnd;
            const newPeriodEnd = this.calculateNextPeriodEnd(
              newPeriodStart,
              subscription.anchorDay,
            );

            // Atualizar período da assinatura
            await tx.subscription.update({
              where: { id: subscription.id },
              data: {
                currentPeriodStart: newPeriodStart,
                currentPeriodEnd: newPeriodEnd,
              },
            });

            // Resetar contadores de uso do período anterior
            await tx.usageCounter.deleteMany({
              where: {
                companyId: subscription.companyId,
                periodStart: subscription.currentPeriodStart,
                periodEnd: subscription.currentPeriodEnd,
              },
            });

            this.logger.log(
              `Rolled over subscription ${subscription.id} for company ${subscription.companyId}`,
            );
          });

          processedCount++;
        }
      }

      this.logger.log(`Billing rollover completed. Processed ${processedCount} subscriptions`);
    } catch (error) {
      this.logger.error('Error in billing rollover job', error);
      throw error;
    }
  }

  private calculateNextPeriodEnd(startDate: Date, anchorDay: number): Date {
    const nextPeriod = new Date(startDate);
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
    nextPeriod.setDate(anchorDay);
    nextPeriod.setHours(23, 59, 59, 999);
    return nextPeriod;
  }
}
