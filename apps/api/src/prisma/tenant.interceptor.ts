import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage, TenantContext } from './prisma.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.companyId) {
      const tenantContext: TenantContext = {
        companyId: user.companyId,
        userId: user.id,
        role: user.role,
      };

      // Usar run para executar o handler dentro do contexto do tenant
      return new Observable(observer => {
        tenantStorage.run(tenantContext, () => {
          next.handle().subscribe({
            next: (value) => observer.next(value),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });
        });
      });
    }

    return next.handle();
  }
}
