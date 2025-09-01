import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    const companyId = (request as any).companyId;

    if (!user || !companyId) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logSuccess(request, user, companyId, startTime, data);
        },
        error: (error) => {
          this.logError(request, user, companyId, startTime, error);
        },
      }),
    );
  }

  private logSuccess(
    request: Request,
    user: any,
    companyId: string,
    startTime: number,
    data: any,
  ) {
    const action = this.determineAction(request);
    if (!action) return;

    const auditData: any = {
      companyId,
      actorId: user.id,
      actorRole: user.role,
      action,
      targetType: this.determineTargetType(request),
      success: true,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      meta: {
        method: request.method,
        url: request.url,
        duration: Date.now() - startTime,
        statusCode: 200,
      },
    };

    const targetId = this.extractTargetId(request, data);
    if (targetId) {
      auditData.targetId = targetId;
    }

    this.auditService.log(auditData);
  }

  private logError(
    request: Request,
    user: any,
    companyId: string,
    startTime: number,
    error: any,
  ) {
    const action = this.determineAction(request);
    if (!action) return;

    const auditData: any = {
      companyId,
      actorId: user.id,
      actorRole: user.role,
      action,
      targetType: this.determineTargetType(request),
      success: false,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      meta: {
        method: request.method,
        url: request.url,
        duration: Date.now() - startTime,
        error: error.message,
        statusCode: error.status || 500,
      },
    };

    const targetId = this.extractTargetId(request);
    if (targetId) {
      auditData.targetId = targetId;
    }

    this.auditService.log(auditData);
  }

  private determineAction(request: Request): string | null {
    const { method, url } = request;

    // Auth actions
    if (url.includes('/auth/login')) return 'LOGIN';
    if (url.includes('/auth/logout')) return 'LOGOUT';

    // CRUD actions
    if (method === 'POST') return 'CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';

    // Specific actions
    if (url.includes('/messages') && method === 'POST') return 'SEND_MESSAGE';
    if (url.includes('/campaigns') && url.includes('/start')) return 'START_CAMPAIGN';
    if (url.includes('/campaigns') && url.includes('/pause')) return 'PAUSE_CAMPAIGN';
    if (url.includes('/campaigns') && url.includes('/resume')) return 'RESUME_CAMPAIGN';
    if (url.includes('/campaigns') && url.includes('/finish')) return 'FINISH_CAMPAIGN';
    if (url.includes('/settings')) return 'CHANGE_SETTINGS';
    if (url.includes('/tickets') && method === 'PATCH') return 'ASSIGN_TICKET';

    return null;
  }

  private determineTargetType(request: Request): string {
    const { url } = request;

    if (url.includes('/tickets')) return 'ticket';
    if (url.includes('/messages')) return 'message';
    if (url.includes('/campaigns')) return 'campaign';
    if (url.includes('/channels')) return 'channel';
    if (url.includes('/settings')) return 'settings';
    if (url.includes('/automations')) return 'automation';
    if (url.includes('/contacts')) return 'contact';
    if (url.includes('/users')) return 'user';

    return 'unknown';
  }

  private extractTargetId(request: Request, data?: any): string | undefined {
    // From URL params
    const urlParams = request.params;
    if (urlParams.id) return urlParams.id;

    // From response data
    if (data?.id) return data.id;

    return undefined;
  }
}
