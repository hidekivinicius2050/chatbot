import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';
import { ChannelsModule } from './channels/channels.module';
import { UploadModule } from './upload/upload.module';
import { WebSocketModule } from './websocket/websocket.module';
import { HealthModule } from './health/health.module';
// import { WebhooksModule } from './webhooks/webhooks.module';
import { MessagingModule } from './messaging/messaging.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AutomationsModule } from './automations/automations.module';
import { SettingsModule } from './settings/settings.module';
import { AuditModule } from './audit/audit.module';
// import { ReportsModule } from './reports/reports.module';
import { BillingModule } from './billing/billing.module';
import { ComplianceModule } from './compliance/compliance.module';
import { PluginsModule } from './plugins/plugins.module';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
  imports: [
    // Configuração do ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requisições por minuto
      },
    ]),

    // Agendamento de tarefas
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot(),

    // Filas BullMQ
    BullModule.forRoot({
      redis: process.env.REDIS_URL || 'redis://localhost:6379',
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),

    // Módulos da aplicação
    PrismaModule,
    AuthModule,
    DashboardModule,
    TicketsModule,
    MessagesModule,
    ChannelsModule,
    UploadModule,
    WebSocketModule,
    HealthModule,
    // WebhooksModule, // Comentado temporariamente devido a problemas de decorators
    MessagingModule,
    CampaignsModule,
    AutomationsModule,
    SettingsModule,
    AuditModule,
    // ReportsModule, // Comentado temporariamente devido a dependências faltantes
    BillingModule,
    ComplianceModule,
    PluginsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
