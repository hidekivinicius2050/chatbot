import { Injectable, OnModuleInit, OnModuleDestroy, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

// Contexto para multitenancy
export interface TenantContext {
  companyId: string;
  userId: string;
  role: string;
}

// AsyncLocalStorage para manter contexto por request
export const tenantStorage = new AsyncLocalStorage<TenantContext>();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private static instance: PrismaService;
  private static isConnected = false;

  constructor() {
    // Singleton pattern para evitar múltiplas instâncias
    if (PrismaService.instance && PrismaService.isConnected) {
      return PrismaService.instance;
    }

    super({
      log: [
        { emit: 'event', level: 'error' }, // Apenas erros para reduzir logs
      ],
      errorFormat: 'pretty',
      // Configurações para Neon + pgbouncer
      datasources: {
        db: {
          url: process.env.DATABASE_URL!,
        },
      },
    });

    PrismaService.instance = this;

    // Middleware para multitenancy automático
    this.$use(async (params: any, next: any) => {
      const context = tenantStorage.getStore();
      
      // Se o modelo tem companyId e temos contexto, aplica filtro automático
      if (params.model && this.shouldApplyTenantFilter(params.model) && context?.companyId) {
        if (params.action === 'findMany' || params.action === 'findFirst') {
          params.args = params.args || {};
          params.args.where = {
            ...params.args.where,
            companyId: context.companyId,
          };
        } else if (params.action === 'create') {
          params.args = params.args || {};
          params.args.data = {
            ...params.args.data,
            companyId: context.companyId,
          };
        } else if (params.action === 'update' || params.action === 'delete') {
          params.args = params.args || {};
          params.args.where = {
            ...params.args.where,
            companyId: context.companyId,
          };
        }
      }

      return next(params);
    });
  }

  async onModuleInit() {
    // Evitar múltiplas conexões
    if (PrismaService.isConnected) {
      return;
    }

    try {
      await this.$connect();
      PrismaService.isConnected = true;
      this.logger.log('✅ Prisma conectado ao banco de dados Neon');
      
      // Teste de conexão
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Teste de conexão ao banco realizado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`❌ Erro ao conectar ao banco: ${errorMessage}`);
      PrismaService.isConnected = false;
      // Em desenvolvimento, não falha a aplicação
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma desconectado do banco de dados');
    PrismaService.instance = null as any;
    PrismaService.isConnected = false;
  }

  // Método para limpar conexões em caso de erro
  async cleanup() {
    try {
      await this.$disconnect();
      this.logger.log('Conexões do Prisma limpas');
    } catch (error) {
      this.logger.error('Erro ao limpar conexões do Prisma:', error);
    }
  }

  private shouldApplyTenantFilter(model: string): boolean {
    const tenantModels = [
      'User',
      'Contact',
      'Channel',
      'Ticket',
      'Message',
      'Outbox',
    ];
    return tenantModels.includes(model);
  }

  // Método para obter o contexto atual
  getTenantContext(): TenantContext | undefined {
    return tenantStorage.getStore();
  }
}
