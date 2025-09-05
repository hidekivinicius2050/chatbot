import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { IPTVController } from './iptv.controller';
import { IPTVService } from './iptv.service';
import { IPTVWebhookController } from './iptv-webhook.controller';
import { IPTVWebhookService } from './iptv-webhook.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [IPTVController, IPTVWebhookController],
  providers: [IPTVService, IPTVWebhookService],
  exports: [IPTVService, IPTVWebhookService],
})
export class IPTVModule {}
