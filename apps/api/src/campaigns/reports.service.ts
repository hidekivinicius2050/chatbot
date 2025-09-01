import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType } from './dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gera relatório diário de campanhas
   *
   * FRONTEND: Deve mostrar:
   * - Dashboard com métricas do dia
   * - Gráficos de performance
   * - Comparativo com dias anteriores
   * - Alertas e insights
   */
  async generateDailyReport(companyId: string, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Estatísticas gerais do dia
    const dailyStats = await this.prisma.campaign.aggregate({
      where: {
        companyId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _count: { id: true },
      _sum: {
        totalTargets: true,
        sentCount: true,
        failedCount: true,
        optOutCount: true,
      },
    });

    // Campanhas criadas no dia
    const campaignsCreated = await this.prisma.campaign.findMany({
      where: {
        companyId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        totalTargets: true,
        sentCount: true,
        failedCount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Execuções de campanhas no dia
    const campaignRuns = await this.prisma.campaignRun.aggregate({
      where: {
        companyId,
        startedAt: { gte: startOfDay, lte: endOfDay },
      },
      _count: { id: true },
      _sum: {
        totalTargets: true,
        processedCount: true,
        successCount: true,
        failureCount: true,
      },
    });

    // Opt-outs no dia
    const optOuts = await this.prisma.optOut.count({
      where: {
        companyId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    // Performance por canal
    const channelPerformance = await this.prisma.channel.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        campaigns: {
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
          select: {
            totalTargets: true,
            sentCount: true,
            failedCount: true,
          },
        },
      },
    });

    const report = {
      date: startOfDay.toISOString().split('T')[0],
      summary: {
        campaignsCreated: dailyStats._count.id || 0,
        totalTargets: dailyStats._sum.totalTargets || 0,
        totalSent: dailyStats._sum.sentCount || 0,
        totalFailed: dailyStats._sum.failedCount || 0,
        totalOptOuts: dailyStats._sum.optOutCount || 0,
        successRate: dailyStats._sum.totalTargets 
          ? ((dailyStats._sum.sentCount || 0) / dailyStats._sum.totalTargets) * 100 
          : 0,
      },
      executions: {
        totalRuns: campaignRuns._count.id || 0,
        totalProcessed: campaignRuns._sum.processedCount || 0,
        totalSuccess: campaignRuns._sum.successCount || 0,
        totalFailure: campaignRuns._sum.failureCount || 0,
        executionSuccessRate: campaignRuns._sum.processedCount 
          ? ((campaignRuns._sum.successCount || 0) / campaignRuns._sum.processedCount) * 100 
          : 0,
      },
      optOuts: {
        total: optOuts,
      },
      campaigns: campaignsCreated,
      channelPerformance: channelPerformance.map(channel => ({
        ...channel,
        totalTargets: channel.campaigns.reduce((sum, c) => sum + (c.totalTargets || 0), 0),
        totalSent: channel.campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
        totalFailed: channel.campaigns.reduce((sum, c) => sum + (c.failedCount || 0), 0),
      })),
    };

    this.logger.log(`Relatório diário gerado para empresa ${companyId} - ${report.date}`);
    return report;
  }

  /**
   * Gera relatório específico de uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Métricas detalhadas da campanha
   * - Gráficos de progresso
   * - Análise de alvos
   * - Comparativo com outras campanhas
   */
  async generateCampaignReport(campaignId: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, companyId },
      include: {
        channel: {
          select: { id: true, name: true, type: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        targets: {
          select: {
            id: true,
            status: true,
            attempts: true,
            lastAttemptAt: true,
            error: true,
            providerMessageId: true,
            contact: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        runs: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            totalTargets: true,
            processedCount: true,
            successCount: true,
            failureCount: true,
            error: true,
          },
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Análise de alvos por status
    const targetAnalysis = {
      total: campaign.targets.length,
      pending: campaign.targets.filter(t => t.status === 'pending').length,
      sent: campaign.targets.filter(t => t.status === 'sent').length,
      failed: campaign.targets.filter(t => t.status === 'failed').length,
      optOut: campaign.targets.filter(t => t.status === 'opt_out').length,
    };

    // Análise de tentativas
    const attemptAnalysis = {
      average: campaign.targets.length > 0 
        ? campaign.targets.reduce((sum, t) => sum + t.attempts, 0) / campaign.targets.length 
        : 0,
      max: Math.max(...campaign.targets.map(t => t.attempts)),
      distribution: campaign.targets.reduce((acc, t) => {
        acc[t.attempts] = (acc[t.attempts] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };

    // Análise de erros
    const errorAnalysis = {
      totalErrors: campaign.targets.filter(t => t.error).length,
      commonErrors: campaign.targets
        .filter(t => t.error)
        .reduce((acc, t) => {
          acc[t.error!] = (acc[t.error!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
    };

    // Performance por execução
    const runPerformance = campaign.runs.map(run => ({
      ...run,
      duration: run.completedAt 
        ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
        : null,
      successRate: run.processedCount > 0 
        ? (run.successCount / run.processedCount) * 100 
        : 0,
    }));

    const report = {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        message: campaign.message,
        mediaUrl: campaign.mediaUrl,
        mediaType: campaign.mediaType,
        scheduledAt: campaign.scheduledAt,
        startedAt: campaign.startedAt,
        completedAt: campaign.completedAt,
        channel: campaign.channel,
        creator: campaign.creator,
      },
      metrics: {
        totalTargets: campaign.totalTargets,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
        optOutCount: campaign.optOutCount,
        successRate: campaign.totalTargets > 0 
          ? (campaign.sentCount / campaign.totalTargets) * 100 
          : 0,
        failureRate: campaign.totalTargets > 0 
          ? (campaign.failedCount / campaign.totalTargets) * 100 
          : 0,
      },
      targetAnalysis,
      attemptAnalysis,
      errorAnalysis,
      runPerformance,
      timeline: {
        created: campaign.createdAt,
        scheduled: campaign.scheduledAt,
        started: campaign.startedAt,
        completed: campaign.completedAt,
        duration: campaign.startedAt && campaign.completedAt
          ? new Date(campaign.completedAt).getTime() - new Date(campaign.startedAt).getTime()
          : null,
      },
    };

    this.logger.log(`Relatório de campanha gerado: ${campaignId}`);
    return report;
  }

  /**
   * Gera relatório resumido de campanhas
   *
   * FRONTEND: Deve mostrar:
   * - Visão geral de todas as campanhas
   * - KPIs principais
   * - Tendências e insights
   * - Comparativos temporais
   */
  async generateSummaryReport(companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = { companyId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Estatísticas gerais
    const generalStats = await this.prisma.campaign.aggregate({
      where,
      _count: { id: true },
      _sum: {
        totalTargets: true,
        sentCount: true,
        failedCount: true,
        optOutCount: true,
      },
    });

    // Estatísticas por status
    const statusStats = await this.prisma.campaign.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
      _sum: {
        totalTargets: true,
        sentCount: true,
        failedCount: true,
      },
    });

    // Estatísticas por tipo
    const typeStats = await this.prisma.campaign.groupBy({
      by: ['type'],
      where,
      _count: { id: true },
      _sum: {
        totalTargets: true,
        sentCount: true,
        failedCount: true,
      },
    });

    // Performance por canal
    const channelStats = await this.prisma.channel.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        campaigns: {
          where,
          select: {
            totalTargets: true,
            sentCount: true,
            failedCount: true,
            optOutCount: true,
          },
        },
      },
    });

    // Tendências temporais (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrends = await this.prisma.campaign.groupBy({
      by: ['createdAt'],
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      _sum: {
        totalTargets: true,
        sentCount: true,
        failedCount: true,
      },
    });

    const report = {
      period: {
        start: startDate || new Date(0),
        end: endDate || new Date(),
      },
      summary: {
        totalCampaigns: generalStats._count.id || 0,
        totalTargets: generalStats._sum.totalTargets || 0,
        totalSent: generalStats._sum.sentCount || 0,
        totalFailed: generalStats._sum.failedCount || 0,
        totalOptOuts: generalStats._sum.optOutCount || 0,
        overallSuccessRate: generalStats._sum.totalTargets 
          ? ((generalStats._sum.sentCount || 0) / generalStats._sum.totalTargets) * 100 
          : 0,
      },
      byStatus: statusStats.map(stat => ({
        status: stat.status,
        count: stat._count.id,
        totalTargets: stat._sum.totalTargets || 0,
        sentCount: stat._sum.sentCount || 0,
        failedCount: stat._sum.failedCount || 0,
        successRate: stat._sum.totalTargets 
          ? ((stat._sum.sentCount || 0) / stat._sum.totalTargets) * 100 
          : 0,
      })),
      byType: typeStats.map(stat => ({
        type: stat.type,
        count: stat._count.id,
        totalTargets: stat._sum.totalTargets || 0,
        sentCount: stat._sum.sentCount || 0,
        failedCount: stat._sum.failedCount || 0,
        successRate: stat._sum.totalTargets 
          ? ((stat._sum.sentCount || 0) / stat._sum.totalTargets) * 100 
          : 0,
      })),
      byChannel: channelStats.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        status: channel.status,
        totalCampaigns: channel.campaigns.length,
        totalTargets: channel.campaigns.reduce((sum, c) => sum + (c.totalTargets || 0), 0),
        totalSent: channel.campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
        totalFailed: channel.campaigns.reduce((sum, c) => sum + (c.failedCount || 0), 0),
        totalOptOuts: channel.campaigns.reduce((sum, c) => sum + (c.optOutCount || 0), 0),
        successRate: channel.campaigns.reduce((sum, c) => sum + (c.totalTargets || 0), 0) > 0
          ? (channel.campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0) / 
             channel.campaigns.reduce((sum, c) => sum + (c.totalTargets || 0), 0)) * 100
          : 0,
      })),
      trends: dailyTrends.map(trend => ({
        date: trend.createdAt.toISOString().split('T')[0],
        campaignsCreated: trend._count.id,
        totalTargets: trend._sum.totalTargets || 0,
        totalSent: trend._sum.sentCount || 0,
        totalFailed: trend._sum.failedCount || 0,
      })),
    };

    this.logger.log(`Relatório resumido gerado para empresa ${companyId}`);
    return report;
  }
}
