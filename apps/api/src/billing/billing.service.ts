import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementsService } from './entitlements.service';
import { PlanTier, CheckoutDto, MockUpgradeDto } from './dto/billing.dto';
import { config } from '@atendechat/config';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async getSubscription(companyId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async getInvoices(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async createCheckoutSession(companyId: string, checkoutDto: CheckoutDto) {
    if (config.billing.provider === 'stripe' && config.billing.stripe.secretKey) {
      return this.createStripeCheckoutSession(companyId, checkoutDto);
    } else {
      return this.createMockCheckoutSession(companyId, checkoutDto);
    }
  }

  async createCustomerPortalSession(companyId: string) {
    if (config.billing.provider === 'stripe' && config.billing.stripe.secretKey) {
      return this.createStripePortalSession(companyId);
    } else {
      return this.createMockPortalSession(companyId);
    }
  }

  async mockUpgrade(companyId: string, upgradeDto: MockUpgradeDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { tier: upgradeDto.tier },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${upgradeDto.tier} not found`);
    }

    const now = new Date();
    const anchorDay = config.billing.anchorDay;
    
    // Calcular período atual
    let periodStart = new Date(now.getFullYear(), now.getMonth(), anchorDay);
    if (now.getDate() < anchorDay) {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, anchorDay);
    }
    
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await this.prisma.subscription.upsert({
      where: { companyId },
      update: {
        planId: plan.id,
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      },
      create: {
        companyId,
        planId: plan.id,
        provider: 'mock',
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        anchorDay,
      },
    });

    this.logger.log(`Mock upgrade for company ${companyId} to ${upgradeDto.tier}`);

    return {
      success: true,
      subscription,
      message: `Upgraded to ${upgradeDto.tier} plan`,
    };
  }

  async mockCancel(companyId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    await this.prisma.subscription.update({
      where: { companyId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    this.logger.log(`Mock cancel for company ${companyId}`);

    return {
      success: true,
      message: 'Subscription canceled at end of current period',
    };
  }

  async handleStripeWebhook(event: any) {
    if (!config.billing.stripe.webhookSecret) {
      this.logger.warn('Stripe webhook secret not configured');
      return;
    }

    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async createStripeCheckoutSession(companyId: string, checkoutDto: CheckoutDto) {
    // Implementação do Stripe seria aqui
    // Por enquanto, retorna mock
    return this.createMockCheckoutSession(companyId, checkoutDto);
  }

  private async createStripePortalSession(companyId: string) {
    // Implementação do Stripe seria aqui
    // Por enquanto, retorna mock
    return this.createMockPortalSession(companyId);
  }

  private async createMockCheckoutSession(companyId: string, checkoutDto: CheckoutDto) {
    return {
      id: `mock_session_${Date.now()}`,
      url: `${config.billing.urls.frontendUrl}/billing/success?session_id=mock_session_${Date.now()}`,
      success_url: `${config.billing.urls.frontendUrl}/billing/success`,
      cancel_url: `${config.billing.urls.frontendUrl}/billing/cancel`,
    };
  }

  private async createMockPortalSession(companyId: string) {
    return {
      url: `${config.billing.urls.frontendUrl}/settings/billing`,
    };
  }

  private async handleSubscriptionUpdated(subscription: any) {
    // Implementação do webhook Stripe
    this.logger.log(`Stripe subscription updated: ${subscription.id}`);
  }

  private async handleInvoicePaid(invoice: any) {
    // Implementação do webhook Stripe
    this.logger.log(`Stripe invoice paid: ${invoice.id}`);
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    // Implementação do webhook Stripe
    this.logger.log(`Stripe invoice payment failed: ${invoice.id}`);
  }
}
