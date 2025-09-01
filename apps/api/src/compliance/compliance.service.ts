import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsentKind, DsrKind, DsrStatus } from '@prisma/client';

// Configuração temporária até resolver o problema de importação
const config = {
  compliance: {
    retention: {
      freeDays: parseInt(process.env.COMPLIANCE_FREE_RETENTION_DAYS || '30', 10),
      proDays: parseInt(process.env.COMPLIANCE_PRO_RETENTION_DAYS || '90', 10),
      businessDays: parseInt(process.env.COMPLIANCE_BUSINESS_RETENTION_DAYS || '365', 10),
    },
  },
};

export interface ConsentData {
  kind: ConsentKind;
  accepted: boolean;
  userId?: string;
  companyId?: string;
  ip?: string;
  userAgent?: string;
}

export interface DsrRequestData {
  kind: DsrKind;
  requesterEmail: string;
  companyId?: string;
  reason?: string;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===== Consentimento =====

  async recordConsent(companyId: string, consentData: ConsentData) {
    const consent = await this.prisma.consentEvent.create({
      data: {
        companyId,
        ...consentData,
      },
    });

    this.logger.log(`Consent recorded for company ${companyId}: ${consentData.kind} = ${consentData.accepted}`);
    return consent;
  }

  async getConsentHistory(companyId: string, userId?: string) {
    const where: any = { companyId };
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.consentEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async hasValidConsent(companyId: string, kind: ConsentKind, userId?: string): Promise<boolean> {
    const latestConsent = await this.prisma.consentEvent.findFirst({
      where: {
        companyId,
        kind,
        accepted: true,
        ...(userId && { userId }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return !!latestConsent;
  }

  // ===== DSR (Data Subject Rights) =====

  async createDsrRequest(companyId: string, dsrData: DsrRequestData) {
    // Verificar se já existe uma solicitação pendente do mesmo tipo
    const existingRequest = await this.prisma.dsrRequest.findFirst({
      where: {
        companyId,
        kind: dsrData.kind,
        status: { in: ['REQUESTED', 'IN_PROGRESS'] },
      },
    });

    if (existingRequest) {
      throw new ForbiddenException({
        code: 'DSR_REQUEST_EXISTS',
        message: `A ${dsrData.kind.toLowerCase()} request is already in progress`,
      });
    }

    const dsrRequest = await this.prisma.dsrRequest.create({
      data: {
        companyId,
        ...dsrData,
      },
    });

    this.logger.log(`DSR request created for company ${companyId}: ${dsrData.kind}`);
    
    // Enfileirar job para processar DSR
    // await this.queueDsrJob(dsrRequest.id, dsrData.kind);
    
    return dsrRequest;
  }

  async getDsrRequests(companyId: string) {
    return this.prisma.dsrRequest.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDsrRequest(companyId: string, requestId: string) {
    const request = await this.prisma.dsrRequest.findFirst({
      where: {
        id: requestId,
        companyId,
      },
    });

    if (!request) {
      throw new NotFoundException('DSR request not found');
    }

    return request;
  }

  async updateDsrStatus(requestId: string, status: DsrStatus, resultPath?: string) {
    const request = await this.prisma.dsrRequest.update({
      where: { id: requestId },
      data: {
        status,
        ...(resultPath && { resultPath }),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`DSR request ${requestId} status updated to ${status}`);
    return request;
  }

  // ===== Retenção de Dados =====

  async getRetentionPolicy(companyId: string): Promise<number> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (subscription?.plan) {
      return subscription.plan.retentionDays;
    }

    // Fallback para plano FREE
    return config.compliance.retention.freeDays;
  }

  async cleanupExpiredData(companyId: string): Promise<{ deleted: number; anonymized: number }> {
    const retentionDays = await this.getRetentionPolicy(companyId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    this.logger.log(`Starting data cleanup for company ${companyId}, retention: ${retentionDays} days`);

    let deleted = 0;
    let anonymized = 0;

    // Anonimizar mensagens antigas (manter estrutura, remover conteúdo PII)
    const oldMessages = await this.prisma.message.findMany({
      where: {
        companyId,
        createdAt: { lt: cutoffDate },
        // Não limpar mensagens de tickets em disputa
        ticket: {
          status: { not: 'disputed' },
        },
      },
      select: { id: true },
    });

    if (oldMessages.length > 0) {
      await this.prisma.message.updateMany({
        where: {
          id: { in: oldMessages.map(m => m.id) },
        },
        data: {
          body: '[Conteúdo removido por política de retenção]',
          // Manter metadados para auditoria
        },
      });
      anonymized += oldMessages.length;
    }

    // Remover anexos antigos (se implementado)
    // const oldAttachments = await this.prisma.attachment.findMany({
    //   where: {
    //     companyId,
    //     createdAt: { lt: cutoffDate },
    //   },
    // });

    // if (oldAttachments.length > 0) {
    //   await this.prisma.attachment.deleteMany({
    //     where: {
    //       id: { in: oldAttachments.map(a => a.id) },
    //     },
    //   });
    //   deleted += oldAttachments.length;
    // }

    this.logger.log(`Data cleanup completed for company ${companyId}: ${deleted} deleted, ${anonymized} anonymized`);

    return { deleted, anonymized };
  }

  // ===== Auditoria e Logs =====

  async logComplianceEvent(companyId: string, action: string, details: any) {
    await this.prisma.auditLog.create({
      data: {
        companyId,
        action: action as any, // Cast para AuditAction
        targetType: 'compliance',
        targetId: null,
        success: true,
        meta: details,
        ip: details.ip,
        userAgent: details.userAgent,
      },
    });
  }

  // ===== Utilitários =====

  async getComplianceSummary(companyId: string) {
    const [consentCount, dsrCount, retentionDays] = await Promise.all([
      this.prisma.consentEvent.count({ where: { companyId } }),
      this.prisma.dsrRequest.count({ where: { companyId } }),
      this.getRetentionPolicy(companyId),
    ]);

    const pendingDsr = await this.prisma.dsrRequest.count({
      where: {
        companyId,
        status: { in: ['REQUESTED', 'IN_PROGRESS'] },
      },
    });

    return {
      consentEvents: consentCount,
      dsrRequests: dsrCount,
      pendingDsr,
      retentionDays,
      lastCleanup: null, // TODO: implementar tracking
    };
  }
}
