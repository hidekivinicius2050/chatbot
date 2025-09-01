import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationDto, UpdateAutomationDto, QueryAutomationsDto, TestAutomationDto } from './dto/automation.dto';
import { AutomationEngine } from './automation-engine.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationEngine: AutomationEngine,
    private readonly configService: ConfigService,
  ) {}

  async create(createAutomationDto: CreateAutomationDto, companyId: string, userId: string) {
    this.logger.log(`Creating automation for company ${companyId}`);

    // Validar DSL
    this.validateDsl(createAutomationDto.dsl);

    const automation = await this.prisma.automation.create({
      data: {
        ...createAutomationDto,
        companyId,
        createdBy: userId,
      },
    });

    this.logger.log(`Automation ${automation.id} created successfully`);
    return automation;
  }

  async findAll(query: QueryAutomationsDto, companyId: string) {
    const { enabled, cursor, limit = 20 } = query;

    const where: any = { companyId };
    if (enabled !== undefined) {
      where.enabled = enabled;
    }

    const automations = await this.prisma.automation.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
    });

    const hasNextPage = automations.length > limit;
    const results = hasNextPage ? automations.slice(0, -1) : automations;
    const nextCursor = hasNextPage && results[results.length - 1] ? results[results.length - 1]?.id : null;

    return {
      data: results,
      pagination: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const automation = await this.prisma.automation.findFirst({
      where: { id, companyId },
    });

    if (!automation) {
      throw new NotFoundException('Automation not found');
    }

    return automation;
  }

  async update(id: string, updateAutomationDto: UpdateAutomationDto, companyId: string) {
    this.logger.log(`Updating automation ${id} for company ${companyId}`);

    const automation = await this.findOne(id, companyId);

    // Validar DSL se fornecido
    if (updateAutomationDto.dsl) {
      this.validateDsl(updateAutomationDto.dsl);
    }

    const updated = await this.prisma.automation.update({
      where: { id },
      data: updateAutomationDto,
    });

    this.logger.log(`Automation ${id} updated successfully`);
    return updated;
  }

  async remove(id: string, companyId: string) {
    this.logger.log(`Removing automation ${id} for company ${companyId}`);

    await this.findOne(id, companyId);

    await this.prisma.automation.delete({
      where: { id },
    });

    this.logger.log(`Automation ${id} removed successfully`);
  }

  async test(id: string, testAutomationDto: TestAutomationDto, companyId: string) {
    this.logger.log(`Testing automation ${id} for company ${companyId}`);

    const automation = await this.findOne(id, companyId);

    try {
      const result = await this.automationEngine.evaluateAutomation(
        automation,
        testAutomationDto.eventMock,
        companyId,
        true, // dry-run
      );

      return {
        automationId: id,
        eventMock: testAutomationDto.eventMock,
        triggered: result.triggered,
        conditionsMet: result.conditionsMet,
        actionsToExecute: result.actionsToExecute,
        context: result.context,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error testing automation ${id}: ${errorMessage}`);
      throw new BadRequestException(`Error testing automation: ${errorMessage}`);
    }
  }

  async getStats(companyId: string) {
    const [total, enabled, disabled] = await Promise.all([
      this.prisma.automation.count({ where: { companyId } }),
      this.prisma.automation.count({ where: { companyId, enabled: true } }),
      this.prisma.automation.count({ where: { companyId, enabled: false } }),
    ]);

    const recentRuns = await this.prisma.automationRun.count({
      where: {
        companyId,
        startedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
    });

    return {
      total,
      enabled,
      disabled,
      recentRuns,
    };
  }

  private validateDsl(dsl: any) {
    if (!dsl || typeof dsl !== 'object') {
      throw new BadRequestException('DSL must be a valid object');
    }

    if (!Array.isArray(dsl.triggers) || dsl.triggers.length === 0) {
      throw new BadRequestException('DSL must have at least one trigger');
    }

    if (!Array.isArray(dsl.actions) || dsl.actions.length === 0) {
      throw new BadRequestException('DSL must have at least one action');
    }

    // Validar triggers
    for (const trigger of dsl.triggers) {
      if (!trigger.type || typeof trigger.type !== 'string') {
        throw new BadRequestException('Each trigger must have a valid type');
      }
    }

    // Validar actions
    for (const action of dsl.actions) {
      if (!action.type || typeof action.type !== 'string') {
        throw new BadRequestException('Each action must have a valid type');
      }

      // Validar tipos de ação suportados
      const supportedActions = [
        'send.autoReply',
        'assign.agent',
        'ticket.setStatus',
        'add.tag',
        'webhook.call',
      ];

      if (!supportedActions.includes(action.type)) {
        throw new BadRequestException(`Unsupported action type: ${action.type}`);
      }

      // Validações específicas por tipo
      switch (action.type) {
        case 'send.autoReply':
          if (!action.template || typeof action.template !== 'string') {
            throw new BadRequestException('send.autoReply action must have a template');
          }
          break;
        case 'assign.agent':
          if (action.strategy && !['round_robin', 'least_loaded'].includes(action.strategy)) {
            throw new BadRequestException('assign.agent strategy must be round_robin or least_loaded');
          }
          break;
        case 'ticket.setStatus':
          if (!action.status || typeof action.status !== 'string') {
            throw new BadRequestException('ticket.setStatus action must have a status');
          }
          break;
        case 'add.tag':
          if (!action.tag || typeof action.tag !== 'string') {
            throw new BadRequestException('add.tag action must have a tag');
          }
          break;
        case 'webhook.call':
          if (!action.url || typeof action.url !== 'string') {
            throw new BadRequestException('webhook.call action must have a url');
          }
          // Validar URL
          try {
            new URL(action.url);
          } catch {
            throw new BadRequestException('webhook.call action must have a valid URL');
          }
          break;
      }
    }

    // Validar conditions se existirem
    if (dsl.conditions && Array.isArray(dsl.conditions)) {
      for (const condition of dsl.conditions) {
        if (!condition.if || typeof condition.if !== 'object') {
          throw new BadRequestException('Each condition must have a valid if clause');
        }
      }
    }

    // Validar edges se existirem
    if (dsl.edges && Array.isArray(dsl.edges)) {
      for (const edge of dsl.edges) {
        if (!edge.condition || typeof edge.condition !== 'object') {
          throw new BadRequestException('Each edge must have a valid condition');
        }
        if (!Array.isArray(edge.actions) || edge.actions.length === 0) {
          throw new BadRequestException('Each edge must have at least one action');
        }
      }
    }
  }
}
