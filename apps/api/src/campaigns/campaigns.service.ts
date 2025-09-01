import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignsDto, AddTargetsDto, CampaignStatus } from './dto';
import { campaignConfig } from '@atendechat/config';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova campanha
   *
   * FRONTEND: Deve mostrar:
   * - Formulário de criação com validação em tempo real
   * - Seleção de canal disponível
   * - Preview da mensagem
   * - Configurações de agendamento
   * - Validação de permissões
   */
  async create(createCampaignDto: CreateCampaignDto, companyId: string, userId: string) {
    // Validar se o canal existe e está conectado
    const channel = await this.prisma.channel.findFirst({
      where: {
        id: createCampaignDto.channelId,
        companyId,
        status: 'connected',
      },
    });

    if (!channel) {
      throw new BadRequestException('Canal não encontrado ou não está conectado');
    }

    // Validar data agendada se for campanha agendada
    if (createCampaignDto.type === 'scheduled' && createCampaignDto.scheduledAt) {
      const scheduledDate = new Date(createCampaignDto.scheduledAt);
      if (scheduledDate <= new Date()) {
        throw new BadRequestException('Data agendada deve ser no futuro');
      }
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        companyId,
        createdBy: userId,
        status: createCampaignDto.type === 'scheduled' ? 'scheduled' : 'draft',
        scheduledAt: createCampaignDto.scheduledAt ? new Date(createCampaignDto.scheduledAt) : null,
        config: {
          ...createCampaignDto.config,
          rateLimit: campaignConfig.maxCpsPerChannel,
          retryAttempts: campaignConfig.retryAttempts,
          retryBackoffMs: campaignConfig.retryBackoffMs,
        },
      },
      include: {
        channel: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    this.logger.log(`Campanha criada: ${campaign.id} por usuário ${userId}`);
    return campaign;
  }

  /**
   * Lista campanhas com filtros e paginação
   *
   * FRONTEND: Deve mostrar:
   * - Lista paginada de campanhas
   * - Filtros por status, tipo, canal, datas
   * - Indicadores visuais de status
   * - Ações disponíveis por campanha
   * - Estatísticas resumidas
   */
  async findAll(query: QueryCampaignsDto, companyId: string) {
    const { status, type, channelId, startDate, endDate, cursor, limit = 20 } = query;

    const where: any = { companyId };

    if (status) where.status = status;
    if (type) where.type = type;
    if (channelId) where.channelId = channelId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const campaigns = await this.prisma.campaign.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
      include: {
        channel: {
          select: { id: true, name: true, type: true },
        },
        creator: {
          select: { id: true, name: true },
        },
        _count: {
          select: { targets: true, runs: true },
        },
      },
    });

    const hasNextPage = campaigns.length > limit;
    const nextCursor = hasNextPage && campaigns[limit - 1] ? campaigns[limit - 1]?.id : null;

    return {
      campaigns: campaigns.slice(0, limit),
      pagination: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  /**
   * Busca uma campanha específica
   *
   * FRONTEND: Deve mostrar:
   * - Detalhes completos da campanha
   * - Estatísticas de envio
   * - Lista de alvos
   * - Histórico de execuções
   * - Ações disponíveis
   */
  async findOne(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
      include: {
        channel: {
          select: { id: true, name: true, type: true, status: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        targets: {
          include: {
            contact: {
              select: { id: true, name: true, phone: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 100, // Limitar para performance
        },
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 10, // Limitar para performance
        },
        _count: {
          select: { targets: true, runs: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    return campaign;
  }

  /**
   * Atualiza uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Formulário de edição pré-preenchido
   * - Validação de campos modificados
   * - Confirmação antes de salvar
   * - Histórico de alterações
   */
  async update(id: string, updateCampaignDto: UpdateCampaignDto, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    // Não permitir editar campanhas em execução
    if (['running', 'completed'].includes(campaign.status)) {
      throw new BadRequestException('Não é possível editar campanhas em execução ou concluídas');
    }

    // Validar canal se foi alterado
    if (updateCampaignDto.channelId && updateCampaignDto.channelId !== campaign.channelId) {
      const channel = await this.prisma.channel.findFirst({
        where: {
          id: updateCampaignDto.channelId,
          companyId,
          status: 'connected',
        },
      });

      if (!channel) {
        throw new BadRequestException('Canal não encontrado ou não está conectado');
      }
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...updateCampaignDto,
        ...(updateCampaignDto.scheduledAt && { scheduledAt: new Date(updateCampaignDto.scheduledAt) }),
      },
      include: {
        channel: true,
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    this.logger.log(`Campanha atualizada: ${id}`);
    return updatedCampaign;
  }

  /**
   * Remove uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de exclusão
   * - Impacto da exclusão (alvos, execuções)
   * - Opção de cancelar em vez de excluir
   */
  async remove(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    // Não permitir excluir campanhas em execução
    if (['running', 'scheduled'].includes(campaign.status)) {
      throw new BadRequestException('Não é possível excluir campanhas em execução ou agendadas');
    }

    // Excluir em cascata (alvos, execuções)
    await this.prisma.campaign.delete({
      where: { id },
    });

    this.logger.log(`Campanha removida: ${id}`);
    return { message: 'Campanha removida com sucesso' };
  }

  /**
   * Adiciona alvos a uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Seleção de contatos disponíveis
   * - Validação de duplicatas
   * - Confirmação de adição
   * - Atualização da lista de alvos
   */
  async addTargets(id: string, addTargetsDto: AddTargetsDto, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (['completed', 'cancelled'].includes(campaign.status)) {
      throw new BadRequestException('Não é possível adicionar alvos a campanhas concluídas ou canceladas');
    }

    // Verificar se os contatos existem
    const contacts = await this.prisma.contact.findMany({
      where: {
        id: { in: addTargetsDto.contactIds },
        companyId,
      },
    });

    if (contacts.length !== addTargetsDto.contactIds.length) {
      throw new BadRequestException('Alguns contatos não foram encontrados');
    }

    // Verificar opt-outs
    const optOuts = await this.prisma.optOut.findMany({
      where: {
        contactId: { in: addTargetsDto.contactIds },
        channelId: campaign.channelId,
      },
    });

    const optOutContactIds = optOuts.map(o => o.contactId);
    const validContactIds = addTargetsDto.contactIds.filter(id => !optOutContactIds.includes(id));

    if (validContactIds.length === 0) {
      throw new BadRequestException('Todos os contatos fizeram opt-out deste canal');
    }

    // Adicionar alvos válidos
    const targets = await Promise.all(
      validContactIds.map(contactId =>
        this.prisma.campaignTarget.upsert({
          where: {
            campaignId_contactId: {
              campaignId: id,
              contactId,
            },
          },
          update: {
            status: 'pending',
            attempts: 0,
            error: null,
            lastAttemptAt: null,
          },
          create: {
            campaignId: id,
            contactId,
            companyId,
            status: 'pending',
          },
        })
      )
    );

    // Atualizar contador de alvos
    await this.prisma.campaign.update({
      where: { id },
      data: {
        totalTargets: {
          increment: targets.length,
        },
      },
    });

    this.logger.log(`Adicionados ${targets.length} alvos à campanha ${id}`);
    return {
      message: `${targets.length} alvos adicionados com sucesso`,
      targetsAdded: targets.length,
      optOutsSkipped: addTargetsDto.contactIds.length - validContactIds.length,
    };
  }

  /**
   * Inicia uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de início
   * - Progresso em tempo real
   * - Estatísticas de envio
   * - Controles de pausa/parada
   */
  async start(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
      include: {
        targets: {
          where: { status: 'pending' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new BadRequestException('Campanha não pode ser iniciada');
    }

    if (campaign.targets.length === 0) {
      throw new BadRequestException('Campanha não possui alvos para envio');
    }

    // Verificar se o canal ainda está conectado
    const channel = await this.prisma.channel.findFirst({
      where: {
        id: campaign.channelId,
        companyId,
        status: 'connected',
      },
    });

    if (!channel) {
      throw new BadRequestException('Canal não está mais conectado');
    }

    // Criar execução da campanha
    const campaignRun = await this.prisma.campaignRun.create({
      data: {
        campaignId: id,
        companyId,
        status: 'started',
        totalTargets: campaign.targets.length,
      },
    });

    // Atualizar status da campanha
    await this.prisma.campaign.update({
      where: { id },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });

    this.logger.log(`Campanha iniciada: ${id}, execução: ${campaignRun.id}`);
    return {
      message: 'Campanha iniciada com sucesso',
      campaignRunId: campaignRun.id,
      totalTargets: campaign.targets.length,
    };
  }

  /**
   * Pausa uma campanha em execução
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de pausa
   * - Status atualizado
   * - Opção de retomar
   */
  async pause(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (campaign.status !== 'running') {
      throw new BadRequestException('Apenas campanhas em execução podem ser pausadas');
    }

    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'paused' },
    });

    this.logger.log(`Campanha pausada: ${id}`);
    return { message: 'Campanha pausada com sucesso' };
  }

  /**
   * Retoma uma campanha pausada
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de retomada
   * - Status atualizado
   * - Progresso continuado
   */
  async resume(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (campaign.status !== 'paused') {
      throw new BadRequestException('Apenas campanhas pausadas podem ser retomadas');
    }

    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'running' },
    });

    this.logger.log(`Campanha retomada: ${id}`);
    return { message: 'Campanha retomada com sucesso' };
  }

  /**
   * Finaliza uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de finalização
   * - Resumo final
   * - Relatórios disponíveis
   */
  async finish(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (!['running', 'paused'].includes(campaign.status)) {
      throw new BadRequestException('Apenas campanhas em execução ou pausadas podem ser finalizadas');
    }

    await this.prisma.campaign.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    this.logger.log(`Campanha finalizada: ${id}`);
    return { message: 'Campanha finalizada com sucesso' };
  }

  /**
   * Cancela uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de cancelamento
   * - Impacto do cancelamento
   * - Opção de reativar
   */
  async cancel(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    if (['completed', 'cancelled'].includes(campaign.status)) {
      throw new BadRequestException('Campanha já foi concluída ou cancelada');
    }

    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    this.logger.log(`Campanha cancelada: ${id}`);
    return { message: 'Campanha cancelada com sucesso' };
  }

  /**
   * Obtém estatísticas de uma campanha
   *
   * FRONTEND: Deve mostrar:
   * - Métricas de envio
   * - Gráficos de progresso
   * - Comparativos com outras campanhas
   * - Exportação de dados
   */
  async getStats(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
      include: {
        targets: {
          select: {
            status: true,
            attempts: true,
            error: true,
          },
        },
        runs: {
          select: {
            status: true,
            totalTargets: true,
            processedCount: true,
            successCount: true,
            failureCount: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    const stats = {
      totalTargets: campaign.totalTargets,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      optOutCount: campaign.optOutCount,
      pendingCount: campaign.targets.filter(t => t.status === 'pending').length,
      successRate: campaign.totalTargets > 0 ? (campaign.sentCount / campaign.totalTargets) * 100 : 0,
      failureRate: campaign.totalTargets > 0 ? (campaign.failedCount / campaign.totalTargets) * 100 : 0,
      averageAttempts: campaign.targets.length > 0 
        ? campaign.targets.reduce((sum, t) => sum + t.attempts, 0) / campaign.targets.length 
        : 0,
      runs: campaign.runs.length,
      lastRun: campaign.runs.length > 0 ? campaign.runs[0] : null,
    };

    return stats;
  }
}
