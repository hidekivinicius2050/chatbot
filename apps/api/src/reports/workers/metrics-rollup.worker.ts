import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { config } from '@atendechat/config';

@Injectable()
export class MetricsRollupWorker {
  private readonly logger = new Logger(MetricsRollupWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async rollupDailyMetrics() {
    if (config.env === 'test') {
      return;
    }

    this.logger.log('Starting daily metrics rollup...');

    try {
      const companies = await this.prisma.company.findMany({
        select: { id: true },
      });

      for (const company of companies) {
        await this.rollupCompanyMetrics(company.id);
      }

      this.logger.log('Daily metrics rollup completed');
    } catch (error) {
      this.logger.error('Failed to rollup daily metrics', error);
    }
  }

  private async rollupCompanyMetrics(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Verificar se já existe métrica para ontem
    const existingMetrics = await this.prisma.metricDaily.findMany({
      where: {
        companyId,
        date: yesterday,
      },
    });

    if (existingMetrics.length > 0) {
      this.logger.debug(`Metrics already exist for ${yesterday.toISOString()} for company ${companyId}`);
      return;
    }

    // Agregar métricas de chat
    await this.rollupChatMetrics(companyId, yesterday);

    // Agregar métricas de campanhas
    await this.rollupCampaignMetrics(companyId, yesterday);

    // Agregar métricas de SLA
    await this.rollupSlaMetrics(companyId, yesterday);

    // Agregar métricas por canal
    await this.rollupChannelMetrics(companyId, yesterday);

    // Agregar métricas por agente
    await this.rollupAgentMetrics(companyId, yesterday);
  }

  private async rollupChatMetrics(companyId: string, date: Date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [
      totalMessages,
      inboundMessages,
      outboundMessages,
      deliveredMessages,
      failedMessages,
    ] = await Promise.all([
      this.prisma.message.count({
        where: {
          companyId,
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.message.count({
        where: {
          companyId,
          direction: 'inbound',
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.message.count({
        where: {
          companyId,
          direction: 'outbound',
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      // Note: Message model doesn't have status field
      // We'll use direction for now
      this.prisma.message.count({
        where: {
          companyId,
          direction: 'outbound',
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      // Note: Message model doesn't have status field
      // We'll use 0 for failed for now
      0,
    ]);

    const metrics = [
      { metric: 'messages', value: totalMessages },
      { metric: 'messages_inbound', value: inboundMessages },
      { metric: 'messages_outbound', value: outboundMessages },
      { metric: 'messages_delivered', value: deliveredMessages },
      { metric: 'messages_failed', value: failedMessages },
    ];

    await this.upsertMetrics(companyId, date, 'chat', 'total', metrics);
  }

  private async rollupCampaignMetrics(companyId: string, date: Date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [
      totalRuns,
      sentRuns,
      deliveredRuns,
      failedRuns,
    ] = await Promise.all([
      this.prisma.campaignRun.count({
        where: {
          companyId,
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.campaignRun.count({
        where: {
          companyId,
          status: 'sent',
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.campaignRun.count({
        where: {
          companyId,
          status: 'delivered',
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.campaignRun.count({
        where: {
          companyId,
          status: 'failed',
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
    ]);

    const metrics = [
      { metric: 'campaign_runs', value: totalRuns },
      { metric: 'campaign_sent', value: sentRuns },
      { metric: 'campaign_delivered', value: deliveredRuns },
      { metric: 'campaign_failed', value: failedRuns },
    ];

    await this.upsertMetrics(companyId, date, 'campaign', 'total', metrics);
  }

  private async rollupSlaMetrics(companyId: string, date: Date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [
      totalBreaches,
      firstResponseBreaches,
      resolutionBreaches,
    ] = await Promise.all([
      this.prisma.ticketSla.count({
        where: {
          companyId,
          OR: [{ breachedFirstResp: true }, { breachedResolution: true }],
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.ticketSla.count({
        where: {
          companyId,
          breachedFirstResp: true,
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.ticketSla.count({
        where: {
          companyId,
          breachedResolution: true,
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
    ]);

    const metrics = [
      { metric: 'sla_breaches', value: totalBreaches },
      { metric: 'sla_first_response_breaches', value: firstResponseBreaches },
      { metric: 'sla_resolution_breaches', value: resolutionBreaches },
    ];

    await this.upsertMetrics(companyId, date, 'sla', 'total', metrics);
  }

  private async rollupChannelMetrics(companyId: string, date: Date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const channels = await this.prisma.channel.findMany({
      where: { companyId },
      select: { id: true, name: true },
    });

    for (const channel of channels) {
      const [
        messagesSent,
        messagesDelivered,
        messagesFailed,
      ] = await Promise.all([
        this.prisma.message.count({
          where: {
            companyId,
            // Note: Message model doesn't have channelId field
            // We'll use all messages for now
            direction: 'outbound',
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        this.prisma.message.count({
          where: {
            companyId,
            // Note: Message model doesn't have channelId or status fields
            // We'll use direction for now
            direction: 'outbound',
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        this.prisma.message.count({
          where: {
            companyId,
            // Note: Message model doesn't have channelId or status fields
            // We'll use 0 for failed for now
            id: 'nonexistent', // This will return 0
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
      ]);

      const metrics = [
        { metric: 'messages_sent', value: messagesSent },
        { metric: 'messages_delivered', value: messagesDelivered },
        { metric: 'messages_failed', value: messagesFailed },
      ];

      await this.upsertMetrics(companyId, date, 'channel', channel.id, metrics);
    }
  }

  private async rollupAgentMetrics(companyId: string, date: Date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const agents = await this.prisma.user.findMany({
      where: { companyId, role: { in: ['AGENT', 'ADMIN'] } },
      select: { id: true, name: true },
    });

    for (const agent of agents) {
      const [
        ticketsHandled,
        messagesSent,
        slaBreaches,
      ] = await Promise.all([
        this.prisma.ticket.count({
          where: {
            companyId,
            assignedUserId: agent.id,
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        this.prisma.message.count({
          where: {
            companyId,
            sender: { id: agent.id },
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        this.prisma.ticketSla.count({
          where: {
            companyId,
            ticket: { assignedUserId: agent.id },
            OR: [{ breachedFirstResp: true }, { breachedResolution: true }],
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
      ]);

      const metrics = [
        { metric: 'tickets_handled', value: ticketsHandled },
        { metric: 'messages_sent', value: messagesSent },
        { metric: 'sla_breaches', value: slaBreaches },
      ];

      await this.upsertMetrics(companyId, date, 'agent', agent.id, metrics);
    }
  }

  private async upsertMetrics(
    companyId: string,
    date: Date,
    scope: string,
    key: string,
    metrics: Array<{ metric: string; value: number }>,
  ) {
    for (const { metric, value } of metrics) {
      await this.prisma.metricDaily.upsert({
        where: {
          id: `${companyId}_${date.toISOString().split('T')[0]}_${scope}_${key}_${metric}`,
        },
        update: { value },
        create: {
          companyId,
          date,
          scope,
          key,
          metric,
          value,
        },
      });
    }
  }
}
