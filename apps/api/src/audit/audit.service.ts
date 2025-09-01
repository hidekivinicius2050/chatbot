import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PiiRedactorService } from './pii-redactor.service';
import { AuditLogData, AuditQueryDto } from './dto/audit.dto';
import { Prisma } from '@prisma/client';
import { config } from '@atendechat/config';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly piiRedactor: PiiRedactorService,
  ) {}

  async log(data: AuditLogData): Promise<void> {
    if (!config.audit.enabled) {
      return;
    }

    try {
      let meta = data.meta;
      
      // Redação de PII se habilitada
      if (config.audit.redactPii && meta) {
        meta = this.piiRedactor.redactObject(meta);
      }

      const createData: any = {
        companyId: data.companyId,
        actorId: data.actorId || null,
        actorRole: data.actorRole || null,
        action: data.action as any,
        targetType: data.targetType,
        targetId: data.targetId || null,
        success: data.success,
        ip: data.ip || null,
        userAgent: data.userAgent || null,
      };

      if (meta) {
        createData.meta = meta;
      }

      await this.prisma.auditLog.create({
        data: createData,
      });

      this.logger.debug(`Audit log created: ${data.action} on ${data.targetType}`, {
        companyId: data.companyId,
        actorId: data.actorId,
        targetId: data.targetId,
        success: data.success,
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Não falhar a operação principal por erro de auditoria
    }
  }

  async findMany(companyId: string, query: AuditQueryDto) {
    const limit = parseInt(query.limit || '20', 10);
    const where: any = { companyId };

    // Filtros
    if (query.action) {
      where.action = query.action;
    }
    if (query.actorId) {
      where.actorId = query.actorId;
    }
    if (query.targetType) {
      where.targetType = query.targetType;
    }
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }

    const cursor = query.cursor ? { id: query.cursor } : undefined;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: limit + 1, // +1 para verificar se há mais páginas
        ...(cursor && { cursor }),
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { name: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const hasNextPage = logs.length > limit;
    const items = hasNextPage ? logs.slice(0, limit) : logs;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    return {
      items,
      pagination: {
        total,
        hasNextPage,
        nextCursor,
      },
    };
  }

  async getStats(companyId: string, from?: string, to?: string) {
    const where: any = { companyId };
    
    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const [totalActions, actionsByType, topActors] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      this.prisma.auditLog.groupBy({
        by: ['actorId', 'actorRole'],
        where,
        _count: { actorId: true },
        orderBy: { _count: { actorId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalActions,
      actionsByType: actionsByType.map((item: any) => ({
        action: item.action,
        count: item._count.action,
      })),
      topActors: topActors.map((item: any) => ({
        actorId: item.actorId,
        actorRole: item.actorRole,
        count: item._count.actorId,
      })),
    };
  }

  async cleanupOldLogs(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.audit.retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old audit logs`);
    return result.count;
  }
}
