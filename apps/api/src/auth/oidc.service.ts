import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

export interface OidcUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  hd?: string; // Google domain
  tenantId?: string; // Microsoft tenant
}

export interface OidcConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  getProviderConfig(provider: string): OidcConfig {
    switch (provider) {
      case 'google':
        return {
          issuer: process.env.OIDC_ISSUER_GOOGLE || 'https://accounts.google.com',
          clientId: process.env.OIDC_CLIENT_ID_GOOGLE || '',
          clientSecret: process.env.OIDC_CLIENT_SECRET_GOOGLE || '',
          redirectUrl: process.env.OIDC_REDIRECT_URL || 'http://localhost:8080/api/v1/auth/oidc/callback',
        };
      case 'microsoft':
        return {
          issuer: process.env.OIDC_ISSUER_MICROSOFT || 'https://login.microsoftonline.com/common/v2.0',
          clientId: process.env.OIDC_CLIENT_ID_MICROSOFT || '',
          clientSecret: process.env.OIDC_CLIENT_SECRET_MICROSOFT || '',
          redirectUrl: process.env.OIDC_REDIRECT_URL || 'http://localhost:8080/api/v1/auth/oidc/callback',
        };
      case 'generic':
        return {
          issuer: process.env.OIDC_GENERIC_ISSUER || '',
          clientId: process.env.OIDC_GENERIC_CLIENT_ID || '',
          clientSecret: process.env.OIDC_GENERIC_CLIENT_SECRET || '',
          redirectUrl: process.env.OIDC_REDIRECT_URL || 'http://localhost:8080/api/v1/auth/oidc/callback',
        };
      default:
        throw new BadRequestException('Provider OIDC não suportado');
    }
  }

  generateLoginUrl(provider: string, state?: string): string {
    const config = this.getProviderConfig(provider);
    
    if (!config.clientId) {
      throw new BadRequestException(`Configuração OIDC para ${provider} não encontrada`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state: state || this.generateState(),
    });

    return `${config.issuer}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async handleCallback(provider: string, code: string, state?: string): Promise<any> {
    try {
      // Em produção, aqui você faria a troca do código por tokens
      // e validaria o ID token com o JWKS do provider
      
      // Mock para desenvolvimento
      const userInfo = await this.mockOidcUserInfo(provider, code);
      
      // Validar email verificado
      if (!userInfo.email_verified) {
        throw new UnauthorizedException('Email não verificado');
      }

      // Validar domínio permitido
      if (!this.isDomainAllowed(userInfo.email)) {
        throw new UnauthorizedException('Domínio não permitido');
      }

      // Buscar ou criar usuário
      const user = await this.findOrCreateUser(userInfo, provider);

      // Gerar tokens
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
      };
    } catch (error) {
      this.logger.error(`Erro no callback OIDC ${provider}:`, error);
      throw error;
    }
  }

  private async mockOidcUserInfo(provider: string, code: string): Promise<OidcUserInfo> {
    // Mock para desenvolvimento - em produção seria uma chamada real
    const mockUsers = {
      google: {
        sub: 'google-123',
        email: 'user@gmail.com',
        email_verified: true,
        name: 'Usuário Google',
        picture: 'https://example.com/avatar.jpg',
      },
      microsoft: {
        sub: 'microsoft-456',
        email: 'user@company.com',
        email_verified: true,
        name: 'Usuário Microsoft',
        tenantId: 'tenant-123',
      },
      generic: {
        sub: 'generic-789',
        email: 'user@generic.com',
        email_verified: true,
        name: 'Usuário Genérico',
      },
    };

    return mockUsers[provider as keyof typeof mockUsers] || mockUsers.generic;
  }

  private isDomainAllowed(email: string): boolean {
    const allowedDomains = process.env.OIDC_ALLOWED_DOMAINS;
    if (!allowedDomains) {
      return true; // Sem restrição
    }

    const domain = email.split('@')[1];
    if (!domain) {
      return false;
    }
    
    const domains = allowedDomains.split(',').map(d => d.trim());
    
    return domains.includes(domain);
  }

  private async findOrCreateUser(userInfo: OidcUserInfo, provider: string): Promise<any> {
    // Buscar identidade OIDC existente
    const existingIdentity = await this.prisma.userIdentity.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId: userInfo.sub,
        },
      },
      include: { user: true },
    });

    if (existingIdentity) {
      return existingIdentity.user;
    }

    // Buscar usuário por email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (existingUser) {
      // Criar identidade OIDC para usuário existente
      await this.prisma.userIdentity.create({
        data: {
          userId: existingUser.id,
          provider,
          providerId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || null,
          picture: userInfo.picture || null,
          emailVerified: userInfo.email_verified,
          claims: userInfo as any,
        },
      });

      return existingUser;
    }

    // Auto-provisionamento
    if (process.env.SSO_AUTO_PROVISION !== 'true') {
      throw new UnauthorizedException('Auto-provisionamento desabilitado');
    }

    // Criar nova empresa (ou usar uma existente)
    const company = await this.prisma.company.create({
      data: {
        name: `${userInfo.name || 'Nova Empresa'}`,
      },
    });

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email: userInfo.email,
        name: userInfo.name || 'Usuário OIDC',
        passwordHash: await argon2.hash(this.generateSecurePassword()),
        role: Role.OWNER,
        companyId: company.id,
      },
    });

    // Criar identidade OIDC
    await this.prisma.userIdentity.create({
      data: {
        userId: user.id,
        provider,
        providerId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name || null,
        picture: userInfo.picture || null,
        emailVerified: userInfo.email_verified,
        claims: userInfo as any,
      },
    });

    return user;
  }

  private async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      expiresIn: process.env.ACCESS_TOKEN_TTL || '15m',
    });
  }

  private async generateRefreshToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      jti: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
      expiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
    });

    // Salvar refresh token no banco
    await this.prisma.refreshToken.create({
      data: {
        id: payload.jti,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });

    return token;
  }

  private generateState(): string {
    return Math.random().toString(36).substr(2, 15);
  }

  private generateSecurePassword(): string {
    return Math.random().toString(36).substr(2, 20);
  }
}
