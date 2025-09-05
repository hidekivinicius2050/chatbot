import { Module } from '@nestjs/common';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { IPTVAutomationService } from '../automations/iptv-automation.service';
import { IPTVService } from '../iptv/iptv.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppWebhookController],
  providers: [IPTVAutomationService, IPTVService],
  exports: [IPTVAutomationService],
})
export class WebhooksModule {}