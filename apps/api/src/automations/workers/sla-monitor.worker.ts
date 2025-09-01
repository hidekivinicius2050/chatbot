import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SlaMonitorWorker {
  private readonly logger = new Logger(SlaMonitorWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkSlaBreaches() {
    this.logger.log('Checking SLA breaches...');

    try {
      // Buscar tickets com SLA vencido
      const breachedTickets = await this.prisma.ticketSla.findMany({
        where: {
          OR: [
            {
              breachedFirstResp: false,
              firstResponseDueAt: {
                lte: new Date(),
              },
            },
            {
              breachedResolution: false,
              resolutionDueAt: {
                lte: new Date(),
              },
            },
          ],
        },
        include: {
          ticket: {
            select: {
              id: true,
              status: true,
              companyId: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (breachedTickets.length === 0) {
        this.logger.log('No SLA breaches found');
        return;
      }

      this.logger.log(`Found ${breachedTickets.length} SLA breaches`);

      // Processar cada breach
      for (const ticketSla of breachedTickets) {
        await this.processSlaBreach(ticketSla);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking SLA breaches: ${errorMessage}`);
    }
  }

  private async processSlaBreach(ticketSla: any) {
    try {
      const updates: any = {};
      const breachTypes: string[] = [];

      // Verificar primeira resposta
      if (!ticketSla.breachedFirstResp && ticketSla.firstResponseDueAt <= new Date()) {
        updates.breachedFirstResp = true;
        breachTypes.push('first_response');
        this.logger.warn(`First response SLA breached for ticket ${ticketSla.ticketId}`);
      }

      // Verificar resolução
      if (!ticketSla.breachedResolution && ticketSla.resolutionDueAt <= new Date()) {
        updates.breachedResolution = true;
        breachTypes.push('resolution');
        this.logger.warn(`Resolution SLA breached for ticket ${ticketSla.ticketId}`);
      }

      if (Object.keys(updates).length > 0) {
        // Atualizar SLA
        await this.prisma.ticketSla.update({
          where: { id: ticketSla.id },
          data: updates,
        });

        // Emitir eventos WebSocket
        for (const breachType of breachTypes) {
          await this.emitSlaBreachEvent(ticketSla, breachType);
        }

        // TODO: Enviar notificação por email/Slack
        await this.sendSlaBreachNotification(ticketSla, breachTypes);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing SLA breach for ticket ${ticketSla.ticketId}: ${errorMessage}`);
    }
  }

  private async emitSlaBreachEvent(ticketSla: any, breachType: string) {
    try {
      // Emitir para sala da empresa
      const companyRoom = `company:${ticketSla.companyId}`;
      const ticketRoom = `ticket:${ticketSla.ticketId}`;

      const eventData = {
        ticketId: ticketSla.ticketId,
        type: breachType,
        dueAt: breachType === 'first_response' ? ticketSla.firstResponseDueAt : ticketSla.resolutionDueAt,
        companyId: ticketSla.companyId,
        ticket: {
          id: ticketSla.ticket.id,
          status: ticketSla.ticket.status,
        },
      };

      // Emitir para ambas as salas
      this.emitToRoom(companyRoom, 'ticket.sla.breached', eventData);
      this.emitToRoom(ticketRoom, 'ticket.sla.breached', eventData);

      this.logger.log(`SLA breach event emitted for ticket ${ticketSla.ticketId}, type: ${breachType}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error emitting SLA breach event: ${errorMessage}`);
    }
  }

  private async sendSlaBreachNotification(ticketSla: any, breachTypes: string[]) {
    // TODO: Implementar notificações por email/Slack
    this.logger.log(`SLA breach notification should be sent for ticket ${ticketSla.ticketId}, types: ${breachTypes.join(', ')}`);
  }

  private emitToRoom(room: string, event: string, data: any) {
    // Implementação básica - em produção usar Socket.IO server
    this.logger.log(`Would emit ${event} to room ${room} with data:`, data);
  }

  // Método para calcular dueAt quando um ticket é criado
  async calculateSlaDueAt(ticketId: string, companyId: string) {
    try {
      // Buscar configuração de SLA da empresa
      const slaPolicy = await this.prisma.slaPolicy.findUnique({
        where: { companyId },
      });

      if (!slaPolicy) {
        this.logger.log(`No SLA policy found for company ${companyId}`);
        return;
      }

      // Buscar configuração de horário comercial
      const businessHours = await this.prisma.businessHours.findUnique({
        where: { companyId },
      });

      const now = new Date();
      const timezone = businessHours?.timezone || 'America/Sao_Paulo';

      // Calcular dueAt para primeira resposta
      const firstResponseDueAt = this.calculateDueAt(
        now,
        slaPolicy.firstResponseMins,
        businessHours?.weeklyJson,
        timezone,
      );

      // Calcular dueAt para resolução
      const resolutionDueAt = this.calculateDueAt(
        now,
        slaPolicy.resolutionMins,
        businessHours?.weeklyJson,
        timezone,
      );

      // Criar ou atualizar TicketSla
      await this.prisma.ticketSla.upsert({
        where: { ticketId },
        update: {
          firstResponseDueAt,
          resolutionDueAt,
        },
        create: {
          ticketId,
          companyId,
          firstResponseDueAt,
          resolutionDueAt,
        },
      });

      this.logger.log(`SLA dueAt calculated for ticket ${ticketId}: firstResponse=${firstResponseDueAt}, resolution=${resolutionDueAt}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error calculating SLA dueAt for ticket ${ticketId}: ${errorMessage}`);
    }
  }

  // Método para atualizar firstRespondedAt quando agente responde
  async updateFirstRespondedAt(ticketId: string) {
    try {
      const ticketSla = await this.prisma.ticketSla.findUnique({
        where: { ticketId },
      });

      if (ticketSla && !ticketSla.firstRespondedAt) {
        await this.prisma.ticketSla.update({
          where: { ticketId },
          data: {
            firstRespondedAt: new Date(),
          },
        });

        this.logger.log(`First response time updated for ticket ${ticketId}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating firstRespondedAt for ticket ${ticketId}: ${errorMessage}`);
    }
  }

  // Método para atualizar resolvedAt quando ticket é fechado
  async updateResolvedAt(ticketId: string) {
    try {
      const ticketSla = await this.prisma.ticketSla.findUnique({
        where: { ticketId },
      });

      if (ticketSla && !ticketSla.resolvedAt) {
        await this.prisma.ticketSla.update({
          where: { ticketId },
          data: {
            resolvedAt: new Date(),
          },
        });

        this.logger.log(`Resolution time updated for ticket ${ticketId}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating resolvedAt for ticket ${ticketId}: ${errorMessage}`);
    }
  }

  private calculateDueAt(
    startDate: Date,
    minutes: number,
    weeklySchedule: any,
    timezone: string,
  ): Date {
    if (!weeklySchedule) {
      // Se não há horário comercial configurado, adicionar minutos diretamente
      return new Date(startDate.getTime() + minutes * 60 * 1000);
    }

    // Implementação simplificada - em produção considerar horário comercial
    // Por enquanto, adicionar minutos diretamente
    return new Date(startDate.getTime() + minutes * 60 * 1000);
  }
}
