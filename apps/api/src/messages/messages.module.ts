import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PluginsModule } from '../plugins/plugins.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [PrismaModule, PluginsModule, BillingModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
