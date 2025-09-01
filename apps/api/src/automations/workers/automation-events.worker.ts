import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationEngine } from '../automation-engine.service';

export interface AutomationEvent {
  id: string;
  type: string;
  companyId: string;
  ticketId?: string;
  contactId?: string;
  channelId?: string;
  channelType?: string;
  text?: string;
  data?: any;
  timestamp: Date;
}

@Injectable()
export class AutomationEventsWorker {
  private readonly logger = new Logger(AutomationEventsWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationEngine: AutomationEngine,
  ) {}

  async process(job: Job<AutomationEvent>) {
    const event = job.data;
    this.logger.log(`Processing automation event ${event.id} of type ${event.type} for company ${event.companyId}`);

    try {
      // Buscar automações habilitadas para a empresa
      const automations = await this.prisma.automation.findMany({
        where: {
          companyId: event.companyId,
          enabled: true,
        },
      });

      if (automations.length === 0) {
        this.logger.log(`No enabled automations found for company ${event.companyId}`);
        return;
      }

      // Processar cada automação
      const results = await Promise.allSettled(
        automations.map(automation => this.processAutomation(automation, event))
      );

      // Log dos resultados
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Automation event ${event.id} processed: ${successful} successful, ${failed} failed`);

      // Log de erros específicos
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
          this.logger.error(`Automation ${automations[index]?.id} failed: ${errorMessage}`);
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing automation event ${event.id}: ${errorMessage}`);
      throw error;
    }
  }

  private async processAutomation(automation: any, event: AutomationEvent) {
    // Verificar se já foi processado (idempotência)
    const existingRun = await this.prisma.automationRun.findFirst({
      where: {
        automationId: automation.id,
        companyId: event.companyId,
        context: {
          path: ['eventId'],
          equals: event.id,
        },
      },
    });

    if (existingRun) {
      this.logger.log(`Automation ${automation.id} already processed for event ${event.id}`);
      return;
    }

    // Criar registro de execução
    const run = await this.prisma.automationRun.create({
      data: {
        automationId: automation.id,
        companyId: event.companyId,
        ticketId: event.ticketId || null,
        contactId: event.contactId || null,
        status: 'running',
        context: {
          eventId: event.id,
          eventType: event.type,
          timestamp: event.timestamp,
        },
      },
    });

    try {
      // Avaliar automação
      const result = await this.automationEngine.evaluateAutomation(
        automation,
        {
          type: event.type,
          ticketId: event.ticketId,
          contactId: event.contactId,
          channelId: event.channelId,
          channelType: event.channelType,
          text: event.text,
          ...event.data,
        },
        event.companyId,
        false, // não é dry-run
      );

      // Atualizar registro de execução
      await this.prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
          context: {
            ...result.context,
            actionsExecuted: result.actionsToExecute.length,
            triggered: result.triggered,
            conditionsMet: result.conditionsMet,
          },
        },
      });

      this.logger.log(`Automation ${automation.id} completed successfully for event ${event.id}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Atualizar registro de execução com erro
      await this.prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          error: errorMessage,
        },
      });

      this.logger.error(`Automation ${automation.id} failed for event ${event.id}: ${errorMessage}`);
      throw error;
    }
  }
}
