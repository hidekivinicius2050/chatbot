import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Entitlements, EntitlementKey, QuotaCheckResult } from './dto/billing.dto';
import { config } from '@atendechat/config';

@Injectable()
export class EntitlementsService {
  private readonly logger = new Logger(EntitlementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get(companyId: string): Promise<Entitlements> {
    const [subscription, entitlement] = await Promise.all([
      this.prisma.subscription.findUnique({
        where: { companyId },
        include: { plan: true },
      }),
      this.prisma.subscriptionEntitlement.findUnique({
        where: { companyId },
      }),
    ]);

    if (!subscription) {
      // Fallback para plano FREE se não há subscription
      return this.getDefaultFreeEntitlements();
    }

    const plan = subscription.plan;
    const features = plan.features as Record<string, any>;

    // Combinar plano base com overrides
    const entitlements: Entitlements = {
      'users.max': entitlement?.maxUsers ?? plan.maxUsers,
      'channels.max': entitlement?.maxChannels ?? plan.maxChannels,
      'messages.monthly.max': entitlement?.maxMessagesMonthly ?? plan.maxMessagesMonthly,
      'campaigns.daily.max': entitlement?.maxCampaignsDaily ?? plan.maxCampaignsDaily,
      'retention.days': entitlement?.retentionDays ?? plan.retentionDays,
      'feature.campaigns': features?.campaigns ?? false,
      'feature.automations': features?.automations ?? false,
      'feature.reports.advanced': features?.reports === 'advanced',
    };

    // Aplicar overrides de features se existirem
    if (entitlement?.features) {
      const overrideFeatures = entitlement.features as Record<string, any>;
      if (overrideFeatures.campaigns !== undefined) {
        entitlements['feature.campaigns'] = overrideFeatures.campaigns;
      }
      if (overrideFeatures.automations !== undefined) {
        entitlements['feature.automations'] = overrideFeatures.automations;
      }
      if (overrideFeatures.reports !== undefined) {
        entitlements['feature.reports.advanced'] = overrideFeatures.reports === 'advanced';
      }
    }

    return entitlements;
  }

  async can(companyId: string, featureKey: EntitlementKey): Promise<boolean> {
    const entitlements = await this.get(companyId);
    return entitlements[featureKey] as boolean;
  }

  async checkQuota(
    companyId: string,
    quotaKey: 'messages.monthly' | 'campaigns.daily',
    increment: number = 1,
  ): Promise<QuotaCheckResult> {
    const entitlements = await this.get(companyId);
    const maxKey = quotaKey === 'messages.monthly' ? 'messages.monthly.max' : 'campaigns.daily.max';
    const max = entitlements[maxKey] as number;

    // Obter período atual
    const { periodStart, periodEnd } = await this.getCurrentPeriod(companyId);
    const key = quotaKey === 'campaigns.daily' 
      ? `campaigns.daily:${periodStart.toISOString().split('T')[0]}`
      : quotaKey;

    // Incremento atômico usando upsert
    const counter = await this.prisma.usageCounter.upsert({
      where: {
        companyId_key_periodStart_periodEnd: {
          companyId,
          key,
          periodStart,
          periodEnd,
        },
      },
      update: {
        value: {
          increment,
        },
      },
      create: {
        companyId,
        key,
        periodStart,
        periodEnd,
        value: increment,
      },
    });

    const used = counter.value;
    const remaining = Math.max(0, max - used);
    const percentage = (used / max) * 100;
    const ok = used <= max;

    // Log warning se próximo do limite
    if (percentage >= 80) {
      this.logger.warn(`Quota warning for ${companyId}: ${quotaKey} at ${percentage.toFixed(1)}% (${used}/${max})`);
    }

    return { ok, remaining, used, max, percentage };
  }

  async enforceQuota(
    companyId: string,
    quotaKey: 'messages.monthly' | 'campaigns.daily',
    increment: number = 1,
  ): Promise<void> {
    const result = await this.checkQuota(companyId, quotaKey, increment);
    
    if (!result.ok) {
      throw new ForbiddenException({
        code: 'QUOTA_EXCEEDED',
        message: `Quota exceeded for ${quotaKey}`,
        quota: result,
      });
    }
  }

  async getUsage(companyId: string): Promise<Record<string, any>> {
    const entitlements = await this.get(companyId);
    const { periodStart, periodEnd } = await this.getCurrentPeriod(companyId);

    const counters = await this.prisma.usageCounter.findMany({
      where: {
        companyId,
        periodStart,
        periodEnd,
      },
    });

    const usage: Record<string, any> = {};

    // Mensagens mensais
    const messagesCounter = counters.find(c => c.key === 'messages.monthly');
    const messagesUsed = messagesCounter?.value || 0;
    usage.messages = {
      used: messagesUsed,
      max: entitlements['messages.monthly.max'],
      percentage: (messagesUsed / entitlements['messages.monthly.max']) * 100,
      periodStart,
      periodEnd,
    };

    // Campanhas diárias
    const today = new Date().toISOString().split('T')[0];
    const campaignsKey = `campaigns.daily:${today}`;
    const campaignsCounter = counters.find(c => c.key === campaignsKey);
    const campaignsUsed = campaignsCounter?.value || 0;
    usage.campaigns = {
      used: campaignsUsed,
      max: entitlements['campaigns.daily.max'],
      percentage: (campaignsUsed / entitlements['campaigns.daily.max']) * 100,
      date: today,
    };

    // Usuários
    const userCount = await this.prisma.user.count({
      where: { companyId },
    });
    usage.users = {
      used: userCount,
      max: entitlements['users.max'],
      percentage: (userCount / entitlements['users.max']) * 100,
    };

    // Canais
    const channelCount = await this.prisma.channel.count({
      where: { companyId },
    });
    usage.channels = {
      used: channelCount,
      max: entitlements['channels.max'],
      percentage: (channelCount / entitlements['channels.max']) * 100,
    };

    return usage;
  }

  private async getCurrentPeriod(companyId: string): Promise<{ periodStart: Date; periodEnd: Date }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    if (subscription) {
      return {
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
      };
    }

    // Fallback para período atual baseado no anchor day
    const now = new Date();
    const anchorDay = config.billing.anchorDay;
    
    let periodStart = new Date(now.getFullYear(), now.getMonth(), anchorDay);
    if (now.getDate() < anchorDay) {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, anchorDay);
    }
    
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return { periodStart, periodEnd };
  }

  private getDefaultFreeEntitlements(): Entitlements {
    return {
      'users.max': config.billing.defaults.freeMaxUsers,
      'channels.max': config.billing.defaults.freeMaxChannels,
      'messages.monthly.max': config.billing.defaults.freeMaxMessagesMonth,
      'campaigns.daily.max': config.billing.defaults.freeMaxCampaignsDay,
      'retention.days': config.billing.defaults.freeRetentionDays,
      'feature.campaigns': false,
      'feature.automations': false,
      'feature.reports.advanced': false,
    };
  }
}
