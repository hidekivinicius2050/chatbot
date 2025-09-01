import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { ComplianceService, ConsentData, DsrRequestData } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../common/guards/company.guard';

@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(private readonly complianceService: ComplianceService) {}

  // ===== Consentimento =====

  @Post('consent')
  async recordConsent(
    @Body() consentData: any,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    const userId = req.user.id;

    // Adicionar informações do request
    const enrichedData: ConsentData = {
      ...consentData,
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    const consent = await this.complianceService.recordConsent(companyId, enrichedData);
    
    // Log de auditoria
    await this.complianceService.logComplianceEvent(companyId, 'CONSENT_RECORDED', {
      kind: consentData.kind,
      accepted: consentData.accepted,
      userId,
      ip: req.ip,
    });

    return { success: true, consent };
  }

  @Get('consent')
  async getConsentHistory(@Request() req: any) {
    const companyId = req.user.companyId;
    const userId = req.user.id;

    return this.complianceService.getConsentHistory(companyId, userId);
  }

  @Get('consent/:kind')
  async checkConsent(
    @Param('kind') kind: string,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    const userId = req.user.id;

    const hasConsent = await this.complianceService.hasValidConsent(
      companyId,
      kind as any,
      userId,
    );

    return { hasConsent, kind };
  }

  // ===== DSR (Data Subject Rights) =====

  @Post('dsr')
  async createDsrRequest(
    @Body() dsrData: any,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;

    const dsrRequest = await this.complianceService.createDsrRequest(companyId, dsrData);
    
    // Log de auditoria
    await this.complianceService.logComplianceEvent(companyId, 'DSR_REQUESTED', {
      kind: dsrData.kind,
      requesterEmail: dsrData.requesterEmail,
      reason: dsrData.reason,
    });

    return { success: true, dsrRequest };
  }

  @Get('dsr')
  async getDsrRequests(@Request() req: any) {
    const companyId = req.user.companyId;
    return this.complianceService.getDsrRequests(companyId);
  }

  @Get('dsr/:id')
  async getDsrRequest(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.complianceService.getDsrRequest(companyId, id);
  }

  // ===== Retenção e Limpeza =====

  @Get('retention')
  async getRetentionPolicy(@Request() req: any) {
    const companyId = req.user.companyId;
    const retentionDays = await this.complianceService.getRetentionPolicy(companyId);
    
    return {
      retentionDays,
      cutoffDate: new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000),
    };
  }

  @Post('retention/cleanup')
  async triggerCleanup(@Request() req: any) {
    const companyId = req.user.companyId;
    
    // Verificar se é ADMIN/OWNER
    if (!['ADMIN', 'OWNER'].includes(req.user.role)) {
      return { error: 'Insufficient permissions' };
    }

    const result = await this.complianceService.cleanupExpiredData(companyId);
    
    // Log de auditoria
    await this.complianceService.logComplianceEvent(companyId, 'RETENTION_CLEANUP', {
      result,
      triggeredBy: req.user.id,
    });

    return { success: true, result };
  }

  // ===== Resumo de Conformidade =====

  @Get('summary')
  async getComplianceSummary(@Request() req: any) {
    const companyId = req.user.companyId;
    return this.complianceService.getComplianceSummary(companyId);
  }

  // ===== Endpoints Públicos (sem autenticação) =====

  @Post('public/consent')
  async recordPublicConsent(
    @Body() consentData: any,
    @Request() req: any,
  ) {
    // Para consentimentos públicos (ex: cookie banner)
    // Usar companyId do corpo ou header
    const companyId = consentData.companyId || req.headers['x-company-id'] as string;
    
    if (!companyId) {
      return { error: 'Company ID required' };
    }

    const enrichedData: ConsentData = {
      ...consentData,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    const consent = await this.complianceService.recordConsent(companyId, enrichedData);
    
    return { success: true, consent };
  }

  @Post('public/dsr')
  async createPublicDsrRequest(
    @Body() dsrData: any,
    @Request() req: any,
  ) {
    // Para DSR públicos (ex: usuários não autenticados)
    const companyId = dsrData.companyId || req.headers['x-company-id'] as string;
    
    if (!companyId) {
      return { error: 'Company ID required' };
    }

    const dsrRequest = await this.complianceService.createDsrRequest(companyId, dsrData);
    
    return { success: true, dsrRequest };
  }
}
