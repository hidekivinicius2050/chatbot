import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { schedulerConfig } from '@atendechat/config';

@Injectable()
export class CampaignSchedulerService {
  private readonly logger = new Logger(CampaignSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executa rollup de agregados a cada 5 minutos (configurável)
   *
   * FRONTEND: Não exposto diretamente, usado pelo sistema de cron
   */
  @Cron('*/5 * * * *') // Temporariamente hardcoded para testes
  async handleAggregatesRollup() {
    this.logger.log('Iniciando rollup de agregados de campanhas');

    try {
      // Buscar campanhas que precisam de atualização de contadores
      const campaignsToUpdate = await this.prisma.campaign.findMany({
        where: {
          status: { in: ['running', 'paused', 'completed'] },
          updatedAt: {
            lt: new Date(Date.now() - 5 * 60 * 1000), // Últimos 5 minutos
          },
        },
        select: { id: true, companyId: true },
      });

      this.logger.log(`Atualizando contadores para ${campaignsToUpdate.length} campanhas`);

      for (const campaign of campaignsToUpdate) {
        await this.updateCampaignCounters(campaign.id, campaign.companyId);
      }

      this.logger.log('Rollup de agregados concluído com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro no rollup de agregados: ${errorMessage}`);
    }
  }

  /**
   * Executa recuperação de campanhas travadas a cada 2 minutos (configurável)
   *
   * FRONTEND: Não exposto diretamente, usado pelo sistema de cron
   */
  @Cron('*/2 * * * *') // Temporariamente hardcoded para testes
  async handleCampaignRecovery() {
    this.logger.log('Iniciando recuperação de campanhas travadas');

    try {
      // Buscar campanhas que podem estar travadas
      const stuckCampaigns = await this.prisma.campaign.findMany({
        where: {
          status: { in: ['running', 'paused'] },
          updatedAt: {
            lt: new Date(Date.now() - 10 * 60 * 1000), // Últimos 10 minutos
          },
        },
        include: {
          runs: {
            where: { status: 'running' },
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
        },
      });

      this.logger.log(`Encontradas ${stuckCampaigns.length} campanhas potencialmente travadas`);

      for (const campaign of stuckCampaigns) {
        await this.recoverStuckCampaign(campaign);
      }

      this.logger.log('Recuperação de campanhas concluída');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro na recuperação de campanhas: ${errorMessage}`);
    }
  }

  /**
   * Agenda campanhas para execução
   *
   * FRONTEND: Não exposto diretamente, usado pelo sistema de cron
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledCampaigns() {
    this.logger.log('Verificando campanhas agendadas');

    try {
      const now = new Date();
      const scheduledCampaigns = await this.prisma.campaign.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: { lte: now },
        },
      });

      if (scheduledCampaigns.length > 0) {
        this.logger.log(`Encontradas ${scheduledCampaigns.length} campanhas para executar`);
      }

      for (const campaign of scheduledCampaigns) {
        await this.startScheduledCampaign(campaign);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao verificar campanhas agendadas: ${errorMessage}`);
    }
  }

  /**
   * Atualiza contadores de uma campanha
   *
   * FRONTEND: Não exposto diretamente, usado internamente
   */
  private async updateCampaignCounters(campaignId: string, companyId: string) {
    try {
      // Contar alvos por status
      const targetCounts = await this.prisma.campaignTarget.groupBy({
        by: ['status'],
        where: { campaignId, companyId },
        _count: { id: true },
      });

      // Calcular contadores
      const sentCount = targetCounts.find(t => t.status === 'sent')?._count.id || 0;
      const failedCount = targetCounts.find(t => t.status === 'failed')?._count.id || 0;
      const optOutCount = targetCounts.find(t => t.status === 'opt_out')?._count.id || 0;
      const pendingCount = targetCounts.find(t => t.status === 'pending')?._count.id || 0;

      const totalTargets = sentCount + failedCount + optOutCount + pendingCount;

      // Atualizar campanha
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: {
          sentCount,
          failedCount,
          optOutCount,
          totalTargets,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Contadores atualizados para campanha ${campaignId}: ${sentCount} enviados, ${failedCount} falharam`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao atualizar contadores da campanha ${campaignId}: ${errorMessage}`);
    }
  }

  /**
   * Recupera uma campanha travada
   *
   * FRONTEND: Não exposto diretamente, usado internamente
   */
  private async recoverStuckCampaign(campaign: any) {
    try {
      this.logger.log(`Tentando recuperar campanha travada: ${campaign.id}`);

      // Verificar se há execução em andamento
      if (campaign.runs.length > 0) {
        const lastRun = campaign.runs[0];
        const runAge = Date.now() - lastRun.startedAt.getTime();

        // Se a execução está muito antiga, marcá-la como falha
        if (runAge > 30 * 60 * 1000) { // 30 minutos
          await this.prisma.campaignRun.update({
            where: { id: lastRun.id },
            data: {
              status: 'failed',
              completedAt: new Date(),
              error: 'Execução travada - recuperação automática',
            },
          });

          this.logger.log(`Execução travada marcada como falha: ${lastRun.id}`);
        }
      }

      // Verificar se a campanha ainda tem alvos pendentes
      const pendingTargets = await this.prisma.campaignTarget.count({
        where: {
          campaignId: campaign.id,
          status: 'pending',
        },
      });

      if (pendingTargets === 0) {
        // Marcar campanha como concluída se não há mais alvos pendentes
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });

        this.logger.log(`Campanha ${campaign.id} marcada como concluída (sem alvos pendentes)`);
      } else {
        // Atualizar timestamp da campanha
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: { updatedAt: new Date() },
        });

        this.logger.log(`Campanha ${campaign.id} recuperada com ${pendingTargets} alvos pendentes`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao recuperar campanha ${campaign.id}: ${errorMessage}`);
    }
  }

  /**
   * Inicia uma campanha agendada
   *
   * FRONTEND: Não exposto diretamente, usado internamente
   */
  private async startScheduledCampaign(campaign: any) {
    try {
      this.logger.log(`Iniciando campanha agendada: ${campaign.id}`);

      // Verificar se o canal ainda está conectado
      const channel = await this.prisma.channel.findFirst({
        where: {
          id: campaign.channelId,
          companyId: campaign.companyId,
          status: 'connected',
        },
      });

      if (!channel) {
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
          },
        });

        this.logger.error(`Campanha ${campaign.id} falhou: canal não está conectado`);
        return;
      }

      // Verificar se há alvos
      const targetCount = await this.prisma.campaignTarget.count({
        where: { campaignId: campaign.id },
      });

      if (targetCount === 0) {
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });

        this.logger.log(`Campanha ${campaign.id} marcada como concluída (sem alvos)`);
        return;
      }

      // Marcar campanha como em execução
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: 'running',
          startedAt: new Date(),
        },
      });

      // Criar execução da campanha
      await this.prisma.campaignRun.create({
        data: {
          campaignId: campaign.id,
          companyId: campaign.companyId,
          status: 'started',
          totalTargets: targetCount,
        },
      });

      this.logger.log(`Campanha agendada ${campaign.id} iniciada com sucesso`);

      // TODO: Enfileirar campanha para processamento
      // await this.campaignQueue.add('enqueue-campaign', {
      //   campaignId: campaign.id,
      //   companyId: campaign.companyId,
      // });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao iniciar campanha agendada ${campaign.id}: ${errorMessage}`);

      // Marcar campanha como falha
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
        },
      });
    }
  }
}
