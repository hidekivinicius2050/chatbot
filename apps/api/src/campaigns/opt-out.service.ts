import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OptOutDto } from './dto';

@Injectable()
export class OptOutService {
  private readonly logger = new Logger(OptOutService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Adiciona um opt-out
   *
   * FRONTEND: Deve mostrar:
   * - Formulário de opt-out
   * - Confirmação de cancelamento
   * - Opção de reativar posteriormente
   * - Histórico de opt-outs
   */
  async addOptOut(optOutDto: OptOutDto, companyId: string) {
    // Verificar se o contato existe
    const contact = await this.prisma.contact.findFirst({
      where: { id: optOutDto.contactId, companyId },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    // Verificar se o canal existe
    const channel = await this.prisma.channel.findFirst({
      where: { id: optOutDto.channelId, companyId },
    });

    if (!channel) {
      throw new NotFoundException('Canal não encontrado');
    }

    // Verificar se já existe opt-out
    const existingOptOut = await this.prisma.optOut.findUnique({
      where: {
        contactId_channelId: {
          contactId: optOutDto.contactId,
          channelId: optOutDto.channelId,
        },
      },
    });

    if (existingOptOut) {
      throw new BadRequestException('Opt-out já existe para este contato e canal');
    }

    // Criar opt-out
    const optOut = await this.prisma.optOut.create({
      data: {
        ...optOutDto,
        companyId,
        source: optOutDto.source || 'manual',
      },
      include: {
        contact: {
          select: { id: true, name: true, phone: true },
        },
        channel: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    // Atualizar contadores de campanhas ativas
    await this.updateCampaignOptOutCount(optOutDto.contactId, optOutDto.channelId, companyId);

    this.logger.log(`Opt-out criado: ${optOut.id} para contato ${optOutDto.contactId}`);
    return optOut;
  }

  /**
   * Remove um opt-out (reativa o contato)
   *
   * FRONTEND: Deve mostrar:
   * - Confirmação de reativação
   * - Impacto nas campanhas futuras
   * - Histórico de alterações
   */
  async removeOptOut(contactId: string, channelId: string, companyId: string) {
    const optOut = await this.prisma.optOut.findUnique({
      where: {
        contactId_channelId: {
          contactId,
          channelId,
        },
      },
    });

    if (!optOut) {
      throw new NotFoundException('Opt-out não encontrado');
    }

    if (optOut.companyId !== companyId) {
      throw new BadRequestException('Opt-out não pertence à empresa');
    }

    await this.prisma.optOut.delete({
      where: {
        contactId_channelId: {
          contactId,
          channelId,
        },
      },
    });

    // Atualizar contadores de campanhas
    await this.updateCampaignOptOutCount(contactId, channelId, companyId);

    this.logger.log(`Opt-out removido: contato ${contactId}, canal ${channelId}`);
    return { message: 'Opt-out removido com sucesso' };
  }

  /**
   * Lista opt-outs com filtros
   *
   * FRONTEND: Deve mostrar:
   * - Lista de opt-outs
   * - Filtros por contato, canal, fonte
   * - Ações disponíveis
   * - Estatísticas
   */
  async listOptOuts(companyId: string, filters?: {
    contactId?: string;
    channelId?: string;
    source?: string;
  }) {
    const where: any = { companyId };

    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.channelId) where.channelId = filters.channelId;
    if (filters?.source) where.source = filters.source;

    const optOuts = await this.prisma.optOut.findMany({
      where,
      include: {
        contact: {
          select: { id: true, name: true, phone: true },
        },
        channel: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return optOuts;
  }

  /**
   * Verifica se um contato fez opt-out de um canal
   *
   * FRONTEND: Não exposto diretamente, usado internamente
   */
  async hasOptOut(contactId: string, channelId: string, companyId: string): Promise<boolean> {
    const optOut = await this.prisma.optOut.findUnique({
      where: {
        contactId_channelId: {
          contactId,
          channelId,
        },
      },
    });

    return !!optOut && optOut.companyId === companyId;
  }

  /**
   * Atualiza contadores de opt-out nas campanhas
   *
   * FRONTEND: Não exposto diretamente, usado internamente
   */
  private async updateCampaignOptOutCount(contactId: string, channelId: string, companyId: string) {
    // Buscar campanhas ativas que têm este contato como alvo
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        companyId,
        channelId,
        status: { in: ['draft', 'scheduled', 'running', 'paused'] },
        targets: {
          some: { contactId },
        },
      },
      select: { id: true },
    });

    // Atualizar contadores de opt-out para cada campanha
    for (const campaign of campaigns) {
      const optOutCount = await this.prisma.optOut.count({
        where: {
          companyId,
          channelId,
          contactId: {
            in: await this.prisma.campaignTarget
              .findMany({
                where: { campaignId: campaign.id },
                select: { contactId: true },
              })
              .then(targets => targets.map(t => t.contactId)),
          },
        },
      });

      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { optOutCount },
      });
    }
  }

  /**
   * Processa opt-out via webhook (para providers externos)
   *
   * FRONTEND: Não exposto diretamente, usado por webhooks
   */
  async processWebhookOptOut(phoneNumber: string, channelId: string, companyId: string, reason?: string) {
    // Buscar contato por número de telefone
    const contact = await this.prisma.contact.findFirst({
      where: {
        phone: phoneNumber,
        companyId,
      },
    });

    if (!contact) {
      this.logger.warn(`Contato não encontrado para opt-out: ${phoneNumber}`);
      return;
    }

    // Verificar se já existe opt-out
    const existingOptOut = await this.prisma.optOut.findUnique({
      where: {
        contactId_channelId: {
          contactId: contact.id,
          channelId,
        },
      },
    });

    if (existingOptOut) {
      this.logger.log(`Opt-out já existe para contato ${contact.id}`);
      return;
    }

    // Criar opt-out
    await this.addOptOut({
      contactId: contact.id,
      channelId,
      reason: reason || '',
      source: 'webhook',
    }, companyId);

    this.logger.log(`Opt-out processado via webhook: contato ${contact.id}, canal ${channelId}`);
  }
}
