import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DevAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Em desenvolvimento, sempre permite acesso
    if (process.env.NODE_ENV === 'development') {
      // Simular um usuário para desenvolvimento
      const request = context.switchToHttp().getRequest();
      request.user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        companyId: 'demo-company',
        role: 'ADMIN',
      };
      return true;
    }
    
    // Em produção, usar autenticação real
    return false;
  }
}


