import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SlosService } from './slos.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private slosService: SlosService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Registrar métrica de performance
        this.slosService.recordHttpRequest(method, route, statusCode, durationMs);

        // Log de performance para rotas lentas
        if (durationMs > this.slosService.getApiP95Target()) {
          console.warn(`Slow API call: ${method} ${route} took ${durationMs}ms (P95 target: ${this.slosService.getApiP95Target()}ms)`);
        }
      }),
    );
  }
}
