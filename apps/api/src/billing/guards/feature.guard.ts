import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementsService } from '../entitlements.service';
import { EntitlementKey } from '../dto/billing.dto';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<EntitlementKey>('feature', context.getHandler());
    
    if (!requiredFeature) {
      return true; // Nenhuma feature requerida
    }

    const request = context.switchToHttp().getRequest();
    const companyId = request.companyId;

    if (!companyId) {
      throw new ForbiddenException('Company ID not found');
    }

    const hasFeature = await this.entitlementsService.can(companyId, requiredFeature);
    
    if (!hasFeature) {
      throw new ForbiddenException({
        code: 'FEATURE_NOT_AVAILABLE',
        message: `Feature ${requiredFeature} is not available in your plan`,
      });
    }

    return true;
  }
}
