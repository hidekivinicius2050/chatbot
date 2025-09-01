import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessHoursDto, UpdateSlaDto } from './dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Business Hours
  async getBusinessHours(companyId: string) {
    const businessHours = await this.prisma.businessHours.findUnique({
      where: { companyId },
    });

    if (!businessHours) {
      // Retornar configuração padrão
      return {
        timezone: 'America/Sao_Paulo',
        weeklyJson: {
          mon: { start: '08:00', end: '18:00' },
          tue: { start: '08:00', end: '18:00' },
          wed: { start: '08:00', end: '18:00' },
          thu: { start: '08:00', end: '18:00' },
          fri: { start: '08:00', end: '18:00' },
          sat: null,
          sun: null,
        },
      };
    }

    return {
      timezone: businessHours.timezone,
      weeklyJson: businessHours.weeklyJson as any,
    };
  }

  async updateBusinessHours(updateBusinessHoursDto: UpdateBusinessHoursDto, companyId: string) {
    this.logger.log(`Updating business hours for company ${companyId}`);

    const businessHours = await this.prisma.businessHours.upsert({
      where: { companyId },
      update: {
        timezone: updateBusinessHoursDto.timezone,
        weeklyJson: updateBusinessHoursDto.weeklyJson,
      },
      create: {
        companyId,
        timezone: updateBusinessHoursDto.timezone,
        weeklyJson: updateBusinessHoursDto.weeklyJson,
      },
    });

    this.logger.log(`Business hours updated for company ${companyId}`);
    return {
      timezone: businessHours.timezone,
      weeklyJson: businessHours.weeklyJson as any,
    };
  }

  // SLA
  async getSla(companyId: string) {
    const sla = await this.prisma.slaPolicy.findUnique({
      where: { companyId },
    });

    if (!sla) {
      // Retornar configuração padrão
      return {
        firstResponseMins: 15,
        resolutionMins: 480,
      };
    }

    return {
      firstResponseMins: sla.firstResponseMins,
      resolutionMins: sla.resolutionMins,
    };
  }

  async updateSla(updateSlaDto: UpdateSlaDto, companyId: string) {
    this.logger.log(`Updating SLA for company ${companyId}`);

    const sla = await this.prisma.slaPolicy.upsert({
      where: { companyId },
      update: {
        firstResponseMins: updateSlaDto.firstResponseMins,
        resolutionMins: updateSlaDto.resolutionMins,
      },
      create: {
        companyId,
        firstResponseMins: updateSlaDto.firstResponseMins,
        resolutionMins: updateSlaDto.resolutionMins,
      },
    });

    this.logger.log(`SLA updated for company ${companyId}`);
    return {
      firstResponseMins: sla.firstResponseMins,
      resolutionMins: sla.resolutionMins,
    };
  }

  // SLA Reports
  async getSlaDailyReport(companyId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const breaches = await this.prisma.ticketSla.findMany({
      where: {
        companyId,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
        OR: [
          { breachedFirstResp: true },
          { breachedResolution: true },
        ],
      },
              include: {
          ticket: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular estatísticas
    const totalBreaches = breaches.length;
    const firstResponseBreaches = breaches.filter(b => b.breachedFirstResp).length;
    const resolutionBreaches = breaches.filter(b => b.breachedResolution).length;

    // Calcular tempo médio de primeira resposta e resolução
    const respondedTickets = breaches.filter(b => b.firstRespondedAt);
    const resolvedTickets = breaches.filter(b => b.resolvedAt);

    const avgFirstResponseTime = respondedTickets.length > 0
      ? respondedTickets.reduce((sum, ticket) => {
          const responseTime = ticket.firstRespondedAt!.getTime() - ticket.createdAt.getTime();
          return sum + responseTime;
        }, 0) / respondedTickets.length / (1000 * 60) // Converter para minutos
      : 0;

    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, ticket) => {
          const resolutionTime = ticket.resolvedAt!.getTime() - ticket.createdAt.getTime();
          return sum + resolutionTime;
        }, 0) / resolvedTickets.length / (1000 * 60) // Converter para minutos
      : 0;

    return {
      period: { from: fromDate, to: toDate },
      totalBreaches,
      firstResponseBreaches,
      resolutionBreaches,
      avgFirstResponseTime: Math.round(avgFirstResponseTime),
      avgResolutionTime: Math.round(avgResolutionTime),
      breaches: breaches.map(b => ({
        ticketId: b.ticketId,
        status: b.ticket.status,
        breachedFirstResp: b.breachedFirstResp,
        breachedResolution: b.breachedResolution,
        createdAt: b.ticket.createdAt,
      })),
    };
  }

  async getSlaSummary(companyId: string) {
    // Buscar configuração de SLA
    const slaConfig = await this.getSla(companyId);

    // Calcular estatísticas dos últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalTickets, firstResponseBreaches, resolutionBreaches, respondedTickets, resolvedTickets] = await Promise.all([
      this.prisma.ticketSla.count({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.ticketSla.count({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
          breachedFirstResp: true,
        },
      }),
      this.prisma.ticketSla.count({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
          breachedResolution: true,
        },
      }),
      this.prisma.ticketSla.findMany({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
          firstRespondedAt: { not: null },
        },
        select: {
          firstRespondedAt: true,
          ticket: {
            select: { createdAt: true },
          },
        },
      }),
      this.prisma.ticketSla.findMany({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
          resolvedAt: { not: null },
        },
        select: {
          resolvedAt: true,
          ticket: {
            select: { createdAt: true },
          },
        },
      }),
    ]);

    // Calcular percentuais de cumprimento
    const firstResponseCompliance = totalTickets > 0
      ? ((totalTickets - firstResponseBreaches) / totalTickets) * 100
      : 100;

    const resolutionCompliance = totalTickets > 0
      ? ((totalTickets - resolutionBreaches) / totalTickets) * 100
      : 100;

    // Calcular tempo médio
    const avgFirstResponseTime = respondedTickets.length > 0
      ? respondedTickets.reduce((sum, ticket) => {
          const responseTime = ticket.firstRespondedAt!.getTime() - ticket.ticket.createdAt.getTime();
          return sum + responseTime;
        }, 0) / respondedTickets.length / (1000 * 60)
      : 0;

    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, ticket) => {
          const resolutionTime = ticket.resolvedAt!.getTime() - ticket.ticket.createdAt.getTime();
          return sum + resolutionTime;
        }, 0) / resolvedTickets.length / (1000 * 60)
      : 0;

    return {
      period: 'last_30_days',
      slaConfig,
      totalTickets,
      firstResponseCompliance: Math.round(firstResponseCompliance * 100) / 100,
      resolutionCompliance: Math.round(resolutionCompliance * 100) / 100,
      avgFirstResponseTime: Math.round(avgFirstResponseTime),
      avgResolutionTime: Math.round(avgResolutionTime),
      firstResponseBreaches,
      resolutionBreaches,
    };
  }
}
