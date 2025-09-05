import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests = process.env.NODE_ENV === 'development' ? 100 : 10; // Mais permissivo em desenvolvimento
  private readonly windowMs = 60000; // Por minuto

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Em desenvolvimento, não aplicar rate limiting
    if (process.env.NODE_ENV === 'development') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const clientId = request.ip || 'unknown';
    const now = Date.now();

    // Limpar contadores expirados
    this.cleanupExpiredCounters(now);

    // Verificar limite de taxa
    const clientData = this.requestCounts.get(clientId);
    
    if (clientData) {
      if (now < clientData.resetTime) {
        if (clientData.count >= this.maxRequests) {
          throw new HttpException(
            'Muitas requisições. Tente novamente em alguns segundos.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        clientData.count++;
      } else {
        // Reset do contador
        clientData.count = 1;
        clientData.resetTime = now + this.windowMs;
      }
    } else {
      // Primeira requisição do cliente
      this.requestCounts.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    }

    return next.handle().pipe(
      tap(() => {
        // Log de requisições para debug
        console.log(`Requisição de ${clientId}: ${clientData?.count || 1}/${this.maxRequests}`);
      }),
    );
  }

  private cleanupExpiredCounters(now: number): void {
    for (const [clientId, data] of this.requestCounts.entries()) {
      if (now >= data.resetTime) {
        this.requestCounts.delete(clientId);
      }
    }
  }
}
