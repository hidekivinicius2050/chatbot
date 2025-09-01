import { Module } from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { AutomationsController } from './automations.controller';
import { AutomationEngine } from './automation-engine.service';
import { AutomationEventsWorker } from './workers/automation-events.worker';
import { SlaMonitorWorker } from './workers/sla-monitor.worker';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';
import { TicketsModule } from '../tickets/tickets.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    PrismaModule,
    MessagingModule,
    TicketsModule,
    MessagesModule,
  ],
  controllers: [AutomationsController],
  providers: [
    AutomationsService,
    AutomationEngine,
    AutomationEventsWorker,
    SlaMonitorWorker,
  ],
  exports: [
    AutomationsService,
    AutomationEngine,
    AutomationEventsWorker,
    SlaMonitorWorker,
  ],
})
export class AutomationsModule {}
