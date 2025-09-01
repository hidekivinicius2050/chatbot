import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PluginsService } from './plugins.service';

// Decorator para definir scopes necessários
export const RequireScopes = (scopes: string[]) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('scopes', scopes, descriptor?.value || target);
  };
};

@Injectable()
export class AppTokenGuard implements CanActivate {
  constructor(
    private pluginsService: PluginsService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de app necessário');
    }

    try {
      const payload = await this.pluginsService.validateAppToken(token);
      if (!payload) {
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar scopes se definidos
      const requiredScopes = this.reflector.get<string[]>('scopes', context.getHandler());
      if (requiredScopes && requiredScopes.length > 0) {
        const hasAllScopes = requiredScopes.every(scope => payload.scopes.includes(scope as any));
        if (!hasAllScopes) {
          throw new UnauthorizedException(`Scopes insuficientes. Necessário: ${requiredScopes.join(', ')}`);
        }
      }

      // Anexar dados do app ao request
      request.app = payload;
      request.user = {
        companyId: payload.companyId,
        type: 'app',
        appId: payload.installationId,
        scopes: payload.scopes,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException((error instanceof Error ? error.message : String(error)) || 'Falha na autenticação do app');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
