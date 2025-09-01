import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../auth/crypto.service';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

export interface InstallPluginDto {
  pluginId: string;
  settings?: any;
  secret?: string;
  events?: string[];
  url?: string;
}

export interface CreateTokenDto {
  scopes: string[];
}

@Injectable()
export class PluginsService {
  private readonly logger = new Logger(PluginsService.name);

  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private configService: ConfigService,
  ) {}

  // Marketplace - listar plugins públicos
  async getMarketplacePlugins(cursor?: string, limit = 20, q?: string) {
    const where: any = {};
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { publisher: { contains: q, mode: 'insensitive' } },
      ];
    }

    const plugins = await this.prisma.plugin.findMany({
      where,
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { installations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasNextPage = plugins.length > limit;
    const items = hasNextPage ? plugins.slice(0, -1) : plugins;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    return {
      items: items.map(plugin => ({
        id: plugin.id,
        slug: plugin.slug,
        name: plugin.name,
        publisher: plugin.publisher,
        description: plugin.description,
        website: plugin.website,
        appUrl: plugin.appUrl,
        features: plugin.features,
        requiredScopes: plugin.requiredScopes,
        latestVersion: plugin.versions[0]?.version,
        installCount: plugin._count.installations,
        createdAt: plugin.createdAt,
      })),
      nextCursor,
    };
  }

  // Detalhes de um plugin
  async getPluginBySlug(slug: string) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { slug },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { installations: true },
        },
      },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin não encontrado');
    }

    return {
      ...plugin,
      installCount: plugin._count.installations,
    };
  }

  // Listar instalações do tenant
  async getInstallations(companyId: string) {
    const installations = await this.prisma.appInstallation.findMany({
      where: { companyId },
      include: {
        plugin: true,
        tokens: {
          select: {
            id: true,
            scopes: true,
            createdAt: true,
            lastUsedAt: true,
          },
        },
        webhooks: {
          select: {
            id: true,
            url: true,
            description: true,
            enabled: true,
            events: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return installations.map(installation => ({
      ...installation,
      // Mascarar dados sensíveis
      secretsEnc: undefined,
      webhooks: installation.webhooks.map(webhook => ({
        ...webhook,
        url: this.maskUrl(webhook.url),
      })),
    }));
  }

  // Instalar plugin
  async installPlugin(companyId: string, data: InstallPluginDto) {
    const plugin = await this.prisma.plugin.findUnique({
      where: { id: data.pluginId },
    });

    if (!plugin) {
      throw new NotFoundException('Plugin não encontrado');
    }

    // Verificar se já está instalado
    const existing = await this.prisma.appInstallation.findFirst({
      where: {
        companyId,
        pluginId: data.pluginId,
      },
    });

    if (existing) {
      throw new BadRequestException('Plugin já instalado');
    }

    // Criptografar secrets se fornecidos
    let secretsEnc: string | undefined;
    if (data.secret) {
      secretsEnc = this.cryptoService.encrypt(data.secret);
    }

    // Criar instalação
    const installation = await this.prisma.appInstallation.create({
      data: {
        companyId,
        pluginId: data.pluginId,
        settings: data.settings || {},
        secretsEnc: secretsEnc || null,
      },
      include: {
        plugin: true,
      },
    });

    // Criar webhook endpoint se fornecido
    if (data.url && data.events) {
      await this.createWebhookEndpoint(installation.id, {
        url: data.url,
        events: data.events,
        secret: data.secret || '',
      });
    }

    this.logger.log(`Plugin ${plugin.name} instalado para company ${companyId}`);

    return installation;
  }

  // Desinstalar plugin
  async uninstallPlugin(companyId: string, installationId: string) {
    const installation = await this.prisma.appInstallation.findFirst({
      where: {
        id: installationId,
        companyId,
      },
    });

    if (!installation) {
      throw new NotFoundException('Instalação não encontrada');
    }

    // Deletar em cascata (tokens e webhooks)
    await this.prisma.appInstallation.delete({
      where: { id: installationId },
    });

    this.logger.log(`Plugin desinstalado: ${installationId}`);
  }

  // Criar webhook endpoint
  async createWebhookEndpoint(installationId: string, data: {
    url: string;
    events: string[];
    secret?: string;
    description?: string;
  }) {
    const installation = await this.prisma.appInstallation.findUnique({
      where: { id: installationId },
    });

    if (!installation) {
      throw new NotFoundException('Instalação não encontrada');
    }

    let secretEnc: string | undefined;
    if (data.secret) {
      secretEnc = this.cryptoService.encrypt(data.secret);
    }

    const webhook = await this.prisma.webhookEndpoint.create({
      data: {
        companyId: installation.companyId,
        installationId,
        url: data.url,
        description: data.description || null,
        events: data.events,
        secretEnc: secretEnc || null,
      },
    });

    return {
      ...webhook,
      url: this.maskUrl(webhook.url),
      secretEnc: undefined,
    };
  }

  // Criar App Token
  async createAppToken(companyId: string, installationId: string, data: CreateTokenDto) {
    const installation = await this.prisma.appInstallation.findFirst({
      where: {
        id: installationId,
        companyId,
      },
      include: {
        plugin: true,
      },
    });

    if (!installation) {
      throw new NotFoundException('Instalação não encontrada');
    }

    // Verificar se os scopes são permitidos pelo plugin
    const invalidScopes = data.scopes.filter(
      scope => !installation.plugin.requiredScopes.includes(scope as any)
    );

    if (invalidScopes.length > 0) {
      throw new BadRequestException(`Scopes não permitidos: ${invalidScopes.join(', ')}`);
    }

    // Gerar token
    const prefix = this.configService.get('APP_TOKEN_PREFIX', 'atk_');
    const randomPart = randomBytes(32).toString('hex');
    const plainToken = `${prefix}${randomPart}`;

    // Hash do token
    const tokenHash = await argon2.hash(plainToken);

    const token = await this.prisma.appToken.create({
      data: {
        companyId,
        installationId,
        tokenHash,
        scopes: data.scopes as any,
      },
    });

    this.logger.log(`Token criado para instalação ${installationId} com scopes: ${data.scopes.join(', ')}`);

    // Retornar token plaintext apenas uma vez
    return {
      id: token.id,
      token: plainToken, // APENAS UMA VEZ
      scopes: token.scopes,
      createdAt: token.createdAt,
    };
  }

  // Listar tokens (mascarados)
  async getAppTokens(companyId: string, installationId: string) {
    const tokens = await this.prisma.appToken.findMany({
      where: {
        companyId,
        installationId,
      },
      select: {
        id: true,
        scopes: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tokens;
  }

  // Revogar token
  async revokeAppToken(companyId: string, tokenId: string) {
    const token = await this.prisma.appToken.findFirst({
      where: {
        id: tokenId,
        companyId,
      },
    });

    if (!token) {
      throw new NotFoundException('Token não encontrado');
    }

    await this.prisma.appToken.delete({
      where: { id: tokenId },
    });

    this.logger.log(`Token revogado: ${tokenId}`);
  }

  // Validar App Token para autenticação
  async validateAppToken(token: string) {
    if (!token.startsWith(this.configService.get('APP_TOKEN_PREFIX', 'atk_'))) {
      return null;
    }

    // Buscar todos os tokens e verificar hash
    const tokens = await this.prisma.appToken.findMany({
      include: {
        installation: {
          include: {
            plugin: true,
          },
        },
        company: true,
      },
    });

    for (const tokenRecord of tokens) {
      try {
        if (await argon2.verify(tokenRecord.tokenHash, token)) {
          // Atualizar lastUsedAt
          await this.prisma.appToken.update({
            where: { id: tokenRecord.id },
            data: { lastUsedAt: new Date() },
          });

          return {
            tokenId: tokenRecord.id,
            companyId: tokenRecord.companyId,
            installationId: tokenRecord.installationId,
            scopes: tokenRecord.scopes,
            company: tokenRecord.company,
            plugin: tokenRecord.installation.plugin,
          };
        }
      } catch (error) {
        // Ignorar erros de verificação
      }
    }

    return null;
  }

  // Utilitário para mascarar URL
  private maskUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}***`;
    } catch {
      return url.substring(0, 20) + '***';
    }
  }
}
