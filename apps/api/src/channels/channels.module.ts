import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingService } from '../messaging/messaging.service';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [PrismaModule, MessagesModule],
  controllers: [ChannelsController],
  providers: [ChannelsService, MessagingService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
