import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';
import { TicketsService } from '../tickets/tickets.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class AutomationEngine {
  private readonly logger = new Logger(AutomationEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
    private readonly ticketsService: TicketsService,
    private readonly messagesService: MessagesService,
  ) {}

  async evaluateAutomation(
    automation: any,
    event: any,
    companyId: string,
    dryRun = false,
  ) {
    this.logger.log(`Evaluating automation ${automation.id} for event ${event.type}`);

    const context = {
      event,
      automation,
      companyId,
      ticketId: event.ticketId,
      contactId: event.contactId,
      channelId: event.channelId,
    };

    // Verificar triggers
    const triggered = this.evaluateTriggers(automation.dsl.triggers, event);
    if (!triggered) {
      return {
        triggered: false,
        conditionsMet: false,
        actionsToExecute: [],
        context,
      };
    }

    // Verificar condições
    const conditionsMet = await this.evaluateConditions(automation.dsl.conditions, event, context);
    if (!conditionsMet) {
      return {
        triggered: true,
        conditionsMet: false,
        actionsToExecute: [],
        context,
      };
    }

    // Determinar ações a executar
    const actionsToExecute = await this.determineActions(automation.dsl, event, context);

    if (!dryRun) {
      // Executar ações
      await this.executeActions(actionsToExecute, context);
    }

    return {
      triggered: true,
      conditionsMet: true,
      actionsToExecute,
      context,
    };
  }

  private evaluateTriggers(triggers: any[], event: any): boolean {
    return triggers.some(trigger => {
      if (trigger.type === event.type) {
        // Verificar filtros se existirem
        if (trigger.filters) {
          return this.evaluateFilters(trigger.filters, event);
        }
        return true;
      }
      return false;
    });
  }

  private evaluateFilters(filters: any, event: any): boolean {
    for (const [key, value] of Object.entries(filters)) {
      if (event[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private async evaluateConditions(conditions: any[], event: any, context: any): Promise<boolean> {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    const results = await Promise.all(conditions.map(condition => {
      return this.evaluateCondition(condition.if, event, context);
    }));

    return results.every(result => result);
  }

  private async evaluateCondition(condition: any, event: any, context: any): Promise<boolean> {
    for (const [operator, value] of Object.entries(condition)) {
      switch (operator) {
        case 'keywordAny':
          return this.evaluateKeywordAny(value as string[], event.text || '');
        case 'keywordAll':
          return this.evaluateKeywordAll(value as string[], event.text || '');
        case 'channelType':
          return this.evaluateChannelType(value as string, event.channelType);
        case 'firstContact':
          return await this.evaluateFirstContact(value as boolean, context);
        case 'outsideBusinessHours':
          return await this.evaluateOutsideBusinessHours(value as boolean, context);
        case 'contactTagIncludes':
          return await this.evaluateContactTagIncludes(value as string, context);
        default:
          this.logger.warn(`Unknown condition operator: ${operator}`);
          return false;
      }
    }
    return false;
  }

  private evaluateKeywordAny(keywords: string[], text: string): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  private evaluateKeywordAll(keywords: string[], text: string): boolean {
    const lowerText = text.toLowerCase();
    return keywords.every(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  private evaluateChannelType(expectedType: string, actualType: string): boolean {
    if (expectedType.endsWith('*')) {
      const prefix = expectedType.slice(0, -1);
      return actualType.startsWith(prefix);
    }
    return actualType === expectedType;
  }

  private async evaluateFirstContact(expected: boolean, context: any): Promise<boolean> {
    if (!context.contactId) return false;

    // Buscar mensagens através do ticket
    const messageCount = await this.prisma.message.count({
      where: {
        ticket: {
          contactId: context.contactId,
          companyId: context.companyId,
        },
      },
    });

    return expected ? messageCount === 1 : messageCount > 1;
  }

  private async evaluateOutsideBusinessHours(expected: boolean, context: any): Promise<boolean> {
    const businessHours = await this.prisma.businessHours.findUnique({
      where: { companyId: context.companyId },
    });

    if (!businessHours) {
      // Se não há configuração, considerar sempre dentro do horário
      return !expected;
    }

    const now = new Date();
    const timezone = businessHours.timezone || 'America/Sao_Paulo';
    
    // Converter para o timezone da empresa
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const dayOfWeek = localTime.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const time = localTime.toTimeString().slice(0, 5); // HH:MM

    const weeklySchedule = businessHours.weeklyJson as any;
    const daySchedule = weeklySchedule[dayOfWeek];

    if (!daySchedule) {
      // Dia não configurado = fora do horário
      return expected;
    }

    const isWithinHours = time >= daySchedule.start && time <= daySchedule.end;
    return expected ? !isWithinHours : isWithinHours;
  }

  private async evaluateContactTagIncludes(tag: string, context: any): Promise<boolean> {
    if (!context.contactId) return false;

    const contact = await this.prisma.contact.findFirst({
      where: {
        id: context.contactId,
        companyId: context.companyId,
      },
      select: { tags: true },
    });

    if (!contact) return false;

    const tags = contact.tags as string[] || [];
    return tags.includes(tag);
  }

  private async determineActions(dsl: any, event: any, context: any): Promise<any[]> {
    let actions = [...dsl.actions];

    // Verificar edges se existirem
    if (dsl.edges && dsl.edges.length > 0) {
      for (const edge of dsl.edges) {
        if (await this.evaluateCondition(edge.condition, event, context)) {
          actions = [...actions, ...edge.actions];
          break;
        }
      }
    }

    return actions;
  }

  private async executeActions(actions: any[], context: any) {
    for (const action of actions) {
      try {
        await this.executeAction(action, context);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error executing action ${action.type}: ${errorMessage}`);
        // Continuar com as próximas ações
      }
    }
  }

  private async executeAction(action: any, context: any) {
    switch (action.type) {
      case 'send.autoReply':
        await this.executeSendAutoReply(action, context);
        break;
      case 'assign.agent':
        await this.executeAssignAgent(action, context);
        break;
      case 'ticket.setStatus':
        await this.executeTicketSetStatus(action, context);
        break;
      case 'add.tag':
        await this.executeAddTag(action, context);
        break;
      case 'webhook.call':
        await this.executeWebhookCall(action, context);
        break;
      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async executeSendAutoReply(action: any, context: any) {
    if (!context.ticketId || !context.channelId) {
      throw new Error('send.autoReply requires ticketId and channelId');
    }

    const channel = await this.prisma.channel.findFirst({
      where: {
        id: context.channelId,
        companyId: context.companyId,
      },
    });

    if (!channel) {
      throw new Error('Channel not found');
    }

    await this.messagingService.sendMessage({
      body: action.template,
      type: 'text' as any,
      ticketId: context.ticketId,
    }, context.companyId);
  }

  private async executeAssignAgent(action: any, context: any) {
    if (!context.ticketId) {
      throw new Error('assign.agent requires ticketId');
    }

    const strategy = action.strategy || 'round_robin';
    const assignedUserId = await this.getAgentByStrategy(strategy, context.companyId);

    if (assignedUserId) {
      await this.prisma.ticket.update({
        where: { id: context.ticketId },
        data: { assignedUserId },
      });
    }
  }

  private async executeTicketSetStatus(action: any, context: any) {
    if (!context.ticketId) {
      throw new Error('ticket.setStatus requires ticketId');
    }

    await this.prisma.ticket.update({
      where: { id: context.ticketId },
      data: { status: action.status },
    });
  }

  private async executeAddTag(action: any, context: any) {
    if (!context.contactId) {
      throw new Error('add.tag requires contactId');
    }

    const contact = await this.prisma.contact.findFirst({
      where: {
        id: context.contactId,
        companyId: context.companyId,
      },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const currentTags = (contact.tags as string[]) || [];
    if (!currentTags.includes(action.tag)) {
      await this.prisma.contact.update({
        where: { id: context.contactId },
        data: {
          tags: [...currentTags, action.tag],
        },
      });
    }
  }

  private async executeWebhookCall(action: any, context: any) {
    // Implementação básica - em produção usar uma biblioteca HTTP
    this.logger.log(`Webhook call to ${action.url} with method ${action.method || 'POST'}`);
    // TODO: Implementar chamada HTTP real
  }

  private async getAgentByStrategy(strategy: string, companyId: string): Promise<string | null> {
    const agents = await this.prisma.user.findMany({
      where: {
        companyId,
        role: { in: ['AGENT', 'ADMIN'] },
        isActive: true,
      },
      select: {
        id: true,
        _count: {
          select: {
            assignedTickets: {
              where: { status: 'open' },
            },
          },
        },
      },
    });

    if (agents.length === 0) {
      return null;
    }

    switch (strategy) {
      case 'round_robin':
        // Implementação simples - em produção usar Redis para distribuição
        const randomIndex = Math.floor(Math.random() * agents.length);
        return agents[randomIndex]?.id || null;

      case 'least_loaded':
        const leastLoaded = agents.reduce((min, agent) => {
          return agent._count.assignedTickets < min._count.assignedTickets ? agent : min;
        });
        return leastLoaded.id;

      default:
        return agents[0]?.id || null;
    }
  }
}
