import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { EventsService } from '../webhooks/events.service';
import { WebhooksProcessor } from '../webhooks/webhooks.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'webhooks',
    }),
  ],
  controllers: [PluginsController],
  providers: [
    PluginsService,
    EventsService,
    WebhooksProcessor,
  ],
  exports: [
    PluginsService,
    EventsService,
  ],
})
export class PluginsModule {}
