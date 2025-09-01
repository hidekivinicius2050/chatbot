import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!user.companyId) {
      throw new ForbiddenException('Usuário não tem empresa associada');
    }

    // Verificar se o usuário tem acesso à empresa
    // Aqui você pode adicionar lógica adicional de verificação se necessário
    return true;
  }
}

