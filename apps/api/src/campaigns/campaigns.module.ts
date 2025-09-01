import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { OptOutService } from './opt-out.service';
import { ReportsService } from './reports.service';
import { CampaignSchedulerService } from './scheduler.service';
import { CampaignEnqueuerWorker } from './workers/campaign-enqueuer.worker';
import { CampaignSenderWorker } from './workers/campaign-sender.worker';
import { CampaignsGateway } from './campaigns.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    MessagingModule,
    BillingModule,
    BullModule.registerQueue(
      {
        name: 'campaigns:enqueuer',
      },
      {
        name: 'campaigns:sender',
      },
    ),
  ],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    OptOutService,
    ReportsService,
    CampaignSchedulerService,
    CampaignEnqueuerWorker,
    CampaignSenderWorker,
    CampaignsGateway,
  ],
  exports: [CampaignsService, OptOutService, ReportsService, CampaignsGateway],
})
export class CampaignsModule {}
