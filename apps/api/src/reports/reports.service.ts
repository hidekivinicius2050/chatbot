import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OverviewStats,
  AgentStats,
  ChannelStats,
  DailyMetric,
  ReportScope,
} from './dto/reports.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(companyId: string, from?: string, to?: string): Promise<OverviewStats> {
    const where = { companyId };
    const dateFilter = this.buildDateFilter(from, to);
    if (dateFilter) {
      Object.assign(where, dateFilter);
    }

    const [
      tickets,
      messages,
      campaigns,
      slaBreaches,
      firstResponseTimes,
      resolutionTimes,
    ] = await Promise.all([
      // Tickets
      this.prisma.ticket.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      // Messages
      this.prisma.message.groupBy({
        by: ['direction'],
        where,
        _count: { direction: true },
      }),
      // Campaigns
      this.prisma.campaignRun.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      // SLA Breaches
      this.prisma.ticketSla.count({
        where: {
          ...where,
          OR: [
            { breachedFirstResp: true },
            { breachedResolution: true },
          ],
        },
      }),
      // First Response Times - Note: Prisma doesn't support _avg on DateTime fields directly
      // We'll calculate these manually in the service
      Promise.resolve(null), // Placeholder for first response times
      // Resolution Times - Note: Prisma doesn't support _avg on DateTime fields directly
      // We'll calculate these manually in the service
      Promise.resolve(null), // Placeholder for resolution times
    ]);

    const ticketsOpened = tickets.find(t => t.status === 'open')?._count.status || 0;
    const ticketsClosed = tickets.find(t => t.status === 'closed')?._count.status || 0;
    
    const messagesSent = messages.find(m => m.direction === 'outbound')?._count.direction || 0;
    const messagesReceived = messages.find(m => m.direction === 'inbound')?._count.direction || 0;
    // Note: Message model doesn't have status field, so we'll use direction counts for now
    const messagesDelivered = messagesSent; // Simplified for now
    const messagesFailed = 0; // Simplified for now

    const campaignsSent = campaigns.find(c => c.status === 'sent')?._count.status || 0;
    const campaignsDelivered = campaigns.find(c => c.status === 'delivered')?._count.status || 0;
    const campaignsFailed = campaigns.find(c => c.status === 'failed')?._count.status || 0;

    // Calcular compliance de SLA
    const totalTickets = ticketsOpened + ticketsClosed;
    const slaCompliance = totalTickets > 0 ? ((totalTickets - slaBreaches) / totalTickets) * 100 : 0;

    return {
      tickets: {
        opened: ticketsOpened,
        closed: ticketsClosed,
        avgFirstResponseTime: 0, // TODO: Calculate manually
        avgResolutionTime: 0, // TODO: Calculate manually
      },
      messages: {
        sent: messagesSent,
        received: messagesReceived,
        delivered: messagesDelivered,
        failed: messagesFailed,
      },
      campaigns: {
        sent: campaignsSent,
        delivered: campaignsDelivered,
        failed: campaignsFailed,
        optOuts: 0, // TODO: implementar contagem de opt-outs
      },
      sla: {
        firstResponseCompliance: slaCompliance,
        resolutionCompliance: slaCompliance,
        breaches: slaBreaches,
      },
    };
  }

  async getAgentStats(companyId: string, from?: string, to?: string): Promise<AgentStats[]> {
    const where = { companyId };
    const dateFilter = this.buildDateFilter(from, to);
    if (dateFilter) {
      Object.assign(where, dateFilter);
    }

    const agents = await this.prisma.user.findMany({
      where: { companyId, role: { in: ['AGENT', 'ADMIN'] } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        const [
          ticketsHandled,
          messagesSent,
          firstResponseTimes,
          resolutionTimes,
          slaBreaches,
        ] = await Promise.all([
          this.prisma.ticket.count({
            where: { ...where, assignedUserId: agent.id },
          }),
          this.prisma.message.count({
            where: { ...where, sender: { id: agent.id } },
          }),
          this.prisma.ticketSla.aggregate({
            where: {
              ...where,
              ticket: { assignedUserId: agent.id },
              firstRespondedAt: { not: null },
            },
            // Note: Prisma doesn't support _avg on DateTime fields directly
            _count: { id: true },
          }),
          this.prisma.ticketSla.aggregate({
            where: {
              ...where,
              ticket: { assignedUserId: agent.id },
              resolvedAt: { not: null },
            },
            // Note: Prisma doesn't support _avg on DateTime fields directly
            _count: { id: true },
          }),
          this.prisma.ticketSla.count({
            where: {
              ...where,
              ticket: { assignedUserId: agent.id },
              OR: [{ breachedFirstResp: true }, { breachedResolution: true }],
            },
          }),
        ]);

        const slaCompliance = ticketsHandled > 0 ? ((ticketsHandled - slaBreaches) / ticketsHandled) * 100 : 0;

        return {
          agentId: agent.id,
          agentName: agent.name,
          ticketsHandled,
          avgFirstResponseTime: 0, // TODO: Calculate manually
          avgResolutionTime: 0, // TODO: Calculate manually
          messagesSent,
          slaCompliance,
        };
      }),
    );

    return agentStats.sort((a, b) => b.ticketsHandled - a.ticketsHandled);
  }

  async getChannelStats(companyId: string, from?: string, to?: string): Promise<ChannelStats[]> {
    const where = { companyId };
    const dateFilter = this.buildDateFilter(from, to);
    if (dateFilter) {
      Object.assign(where, dateFilter);
    }

    const channels = await this.prisma.channel.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    const channelStats = await Promise.all(
      channels.map(async (channel) => {
        const [
          messagesSent,
          messagesDelivered,
          messagesFailed,
        ] = await Promise.all([
          // Note: Message model doesn't have channelId field
          // We'll use a simplified approach for now
          this.prisma.message.count({
            where: { ...where, direction: 'outbound' },
          }),
          // Note: Message model doesn't have status field
          // We'll use a simplified approach for now
          this.prisma.message.count({
            where: { ...where, direction: 'outbound' },
          }),
          // Note: Message model doesn't have status field
          // We'll use a simplified approach for now
          0,
        ]);

        const deliveryRate = messagesSent > 0 ? (messagesDelivered / messagesSent) * 100 : 0;
        const avgCps = 0; // TODO: implementar cálculo de CPS

        return {
          channelId: channel.id,
          channelName: channel.name,
          channelType: channel.type,
          messagesSent,
          messagesDelivered,
          messagesFailed,
          deliveryRate,
          avgCps,
        };
      }),
    );

    return channelStats.sort((a, b) => b.messagesSent - a.messagesSent);
  }

  async getDailyMetrics(
    companyId: string,
    scope: ReportScope = ReportScope.CHAT,
    key: string = 'total',
    from?: string,
    to?: string,
  ): Promise<DailyMetric[]> {
    const where = { companyId };
    const dateFilter = this.buildDateFilter(from, to);
    if (dateFilter) {
      Object.assign(where, dateFilter);
    }

    // Usar MetricDaily se disponível, senão calcular on-the-fly
    const metrics = await this.prisma.metricDaily.findMany({
      where: {
        ...where,
        scope,
        key,
      },
      orderBy: { date: 'asc' },
    });

    if (metrics.length > 0) {
      return metrics.map(metric => ({
        date: metric.date.toISOString().split('T')[0] || '',
        value: metric.value,
        scope: metric.scope,
        key: metric.key,
        metric: metric.metric,
      }));
    }

    // Fallback: calcular on-the-fly
    return this.calculateDailyMetricsOnTheFly(companyId, scope, key, from, to);
  }

  private async calculateDailyMetricsOnTheFly(
    companyId: string,
    scope: ReportScope,
    key: string,
    from?: string,
    to?: string,
  ): Promise<DailyMetric[]> {
    // Implementação básica - pode ser expandida conforme necessário
    const metrics: DailyMetric[] = [];
    
    const startDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      let value = 0;
      switch (scope) {
        case ReportScope.CHAT:
          value = await this.prisma.message.count({
            where: {
              companyId,
              createdAt: {
                gte: new Date(dateStr + 'T00:00:00Z'),
                lt: new Date(dateStr + 'T23:59:59Z'),
              },
            },
          });
          break;
        case ReportScope.CAMPAIGN:
          value = await this.prisma.campaignRun.count({
            where: {
              companyId,
              createdAt: {
                gte: new Date(dateStr + 'T00:00:00Z'),
                lt: new Date(dateStr + 'T23:59:59Z'),
              },
            },
          });
          break;
        // Adicionar outros casos conforme necessário
      }
      
      metrics.push({
        date: dateStr || '',
        value,
        scope,
        key,
        metric: 'count',
      });
    }
    
    return metrics;
  }

  private buildDateFilter(from?: string, to?: string) {
    if (!from && !to) return null;
    
    const filter: any = {};
    if (from) {
      filter.gte = new Date(from);
    }
    if (to) {
      filter.lte = new Date(to);
    }
    
    return { createdAt: filter };
  }

  private calculateAverageTime(avgDate: Date | null): number {
    if (!avgDate) return 0;
    // Implementação básica - pode ser melhorada para calcular tempo real
    return 0;
  }
}
