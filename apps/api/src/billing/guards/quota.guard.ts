import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementsService } from '../entitlements.service';

interface QuotaConfig {
  key: 'messages.monthly' | 'campaigns.daily';
  increment?: number;
}

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const quotaConfig = this.reflector.get<QuotaConfig>('quota', context.getHandler());
    
    if (!quotaConfig) {
      return true; // Nenhuma quota requerida
    }

    const request = context.switchToHttp().getRequest();
    const companyId = request.companyId;

    if (!companyId) {
      throw new ForbiddenException('Company ID not found');
    }

    try {
      await this.entitlementsService.enforceQuota(
        companyId,
        quotaConfig.key,
        quotaConfig.increment || 1,
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Quota check failed');
    }
  }
}
