import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { EntitlementsService } from './entitlements.service';
import { PrismaService } from '../prisma/prisma.service';
import { BillingRolloverWorker } from './workers/billing-rollover.worker';
import { BillingQuotaNotifyWorker } from './workers/billing-quota-notify.worker';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'billing',
    }),
    WebSocketModule,
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    EntitlementsService,
    PrismaService,
    BillingRolloverWorker,
    BillingQuotaNotifyWorker,
  ],
  exports: [EntitlementsService, BillingService],
})
export class BillingModule {}
