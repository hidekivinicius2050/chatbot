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

@Injectable({ scope: Scope.REQUEST })
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'pretty',
      // Configurações para Neon + pgbouncer
      datasources: {
        db: {
          url: process.env.DATABASE_URL!,
        },
      },
    });

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
    try {
      await this.$connect();
      this.logger.log('✅ Prisma conectado ao banco de dados Neon');
      
      // Teste de conexão
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Teste de conexão ao banco realizado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`❌ Erro ao conectar ao banco: ${errorMessage}`);
      // Em desenvolvimento, não falha a aplicação
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma desconectado do banco de dados');
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
