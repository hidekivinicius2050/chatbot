import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly rateLimiters = new Map<string, any>();

  use(req: Request, res: Response, next: NextFunction) {
    // Rate limiting global
    this.applyGlobalRateLimit(req, res, next);
  }

  private applyGlobalRateLimit(req: Request, res: Response, next: NextFunction) {
    const globalLimit = parseInt(process.env.RATE_LIMIT_GLOBAL || '200');
    const windowMs = 60 * 1000; // 1 minuto

    if (!this.rateLimiters.has('global')) {
      const limiter = rateLimit({
        windowMs,
        max: globalLimit,
        message: {
          error: 'Muitas requisições. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil(windowMs / 1000),
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: any) => {
          // Usar IP real se estiver atrás de proxy
          if (process.env.TRUST_PROXY === 'true') {
            return req.headers['x-forwarded-for'] as string || req.ip;
          }
          return req.ip;
        },
      });
      this.rateLimiters.set('global', limiter);
    }

    this.rateLimiters.get('global')(req, res, next);
  }

  static applyLoginRateLimit() {
    const loginLimit = parseInt(process.env.RATE_LIMIT_LOGIN || '10');
    const windowMs = 60 * 1000; // 1 minuto

    return rateLimit({
      windowMs,
      max: loginLimit,
      message: {
        error: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(windowMs / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
              keyGenerator: (req: any) => {
          if (process.env.TRUST_PROXY === 'true') {
            return req.headers['x-forwarded-for'] as string || req.ip;
          }
          return req.ip;
        },
      skipSuccessfulRequests: true,
    });
  }

  static applySecurityHeaders() {
    const securityHeadersEnabled = process.env.SECURITY_HEADERS_ENABLED === 'true';
    
    if (!securityHeadersEnabled) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return helmet({
      contentSecurityPolicy: SecurityMiddleware.getCSPConfig(),
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    });
  }

  private static getCSPConfig() {
    const cspEnabled = process.env.CSP_ENABLED === 'true';
    const cspReportOnly = process.env.CSP_REPORT_ONLY === 'true';
    const cspReportUri = process.env.CSP_REPORT_URI;

    if (!cspEnabled) {
      return false;
    }

    const directives = {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Necessário para SPA
      styleSrc: ["'self'", "'unsafe-inline'"], // Necessário para SPA
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"], // Para WebSocket
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      prefetchSrc: ["'self'"],
    };

    if (cspReportUri) {
      (directives as any).reportUri = [cspReportUri];
    }

    return {
      directives,
      reportOnly: cspReportOnly,
    };
  }

  static validatePayloadSize(req: Request, res: Response, next: NextFunction) {
    const maxSize = parseInt(process.env.MAX_PAYLOAD_SIZE_MB || '5') * 1024 * 1024; // MB to bytes
    
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length']);
      if (contentLength > maxSize) {
        throw new HttpException(
          `Payload muito grande. Máximo permitido: ${process.env.MAX_PAYLOAD_SIZE_MB || '5'}MB`,
          HttpStatus.PAYLOAD_TOO_LARGE
        );
      }
    }

    next();
  }

  static sanitizeInput(req: Request, res: Response, next: NextFunction) {
    // Sanitizar body
    if (req.body) {
      req.body = SecurityMiddleware.sanitizeObject(req.body);
    }

    // Sanitizar query params
    if (req.query) {
      req.query = SecurityMiddleware.sanitizeObject(req.query);
    }

    // Sanitizar params
    if (req.params) {
      req.params = SecurityMiddleware.sanitizeObject(req.params);
    }

    next();
  }

  private static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return SecurityMiddleware.sanitizeValue(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => SecurityMiddleware.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = SecurityMiddleware.sanitizeObject(value);
    }

    return sanitized;
  }

  private static sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remover caracteres nulos
      value = value.replace(/\u0000/g, '');
      
      // Trim
      value = value.trim();
      
      // Limitar comprimento
      const maxLength = 10000; // 10KB
      if (value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
    }

    return value;
  }
}
