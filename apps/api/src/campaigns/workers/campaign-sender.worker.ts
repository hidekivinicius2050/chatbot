import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingService } from '../../messaging/messaging.service';
import { CampaignsGateway } from '../campaigns.gateway';

export interface CampaignProgressEvent {
  campaignId: string;
  companyId: string;
  totalTargets: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  optOutCount: number;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // in seconds
}

export interface CampaignFinishedEvent {
  campaignId: string;
  companyId: string;
  status: 'completed' | 'failed' | 'cancelled';
  totalTargets: number;
  successCount: number;
  failureCount: number;
  optOutCount: number;
  duration: number; // in seconds
  error?: string;
}

export interface SendMessageJob {
  targetId: string;
  campaignId: string;
  contactId: string;
  channelId: string;
  message: string;
  mediaUrl?: string;
  mediaType?: string;
  provider: string;
  externalId: string;
}

@Processor('campaigns:sender')
export class CampaignSenderWorker {
  private readonly logger = new Logger(CampaignSenderWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
    private readonly campaignsGateway: CampaignsGateway,
  ) {}

  @Process('send-message')
  async handleSendMessage(job: Job<SendMessageJob>) {
    const { targetId, campaignId, contactId, channelId, message, mediaUrl, mediaType } = job.data;
    
    this.logger.log(`Processing send-message job for target ${targetId} in campaign ${campaignId}`);

    try {
      // Check if contact has opted out
      const optOut = await this.prisma.optOut.findFirst({
        where: {
          contactId,
          channelId,
        },
      });

      if (optOut) {
        this.logger.log(`Contact ${contactId} has opted out from channel ${channelId}`);
        await this.updateTargetStatus(targetId, 'opt_out', 'Contact opted out');
        await this.updateCampaignCounters(campaignId);
        await this.emitProgressEvent(campaignId);
        return;
      }

      // Validate campaign is still running
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true, companyId: true },
      });

      if (!campaign || campaign.status !== 'running') {
        this.logger.log(`Campaign ${campaignId} is not running (status: ${campaign?.status})`);
        await this.updateTargetStatus(targetId, 'failed', 'Campaign not running');
        await this.updateCampaignCounters(campaignId);
        await this.emitProgressEvent(campaignId);
        return;
      }

      // Send message via messaging service
      const result = await this.messagingService.sendMessage({
        ticketId: `campaign_${campaignId}_${contactId}`, // Ticket virtual para campanhas
        body: message,
        type: mediaUrl ? 'file' : 'text' as any,
        ...(mediaUrl && { mediaUrl }),
        ...(mediaType && { mediaType }),
      }, campaign.companyId);

      if (result.success) {
        // Update target status to sent
        await this.updateTargetStatus(targetId, 'sent', undefined, result.messageId);
        this.logger.log(`Message sent successfully for target ${targetId}`);
      } else {
        // Update target status to failed
        await this.updateTargetStatus(targetId, 'failed', result.error);
        this.logger.error(`Failed to send message for target ${targetId}: ${result.error}`);
      }

      // Update campaign counters
      await this.updateCampaignCounters(campaignId);
      
      // Emit progress event
      await this.emitProgressEvent(campaignId);

      // Check if campaign is completed
      await this.checkCampaignCompletion(campaignId, campaign.companyId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing send-message job for target ${targetId}: ${errorMessage}`);
      
      // Update target status to failed
      await this.updateTargetStatus(targetId, 'failed', errorMessage);
      
      // Update campaign counters
      await this.updateCampaignCounters(campaignId);
      
      // Emit progress event
      await this.emitProgressEvent(campaignId);

      // Retry logic is handled by BullMQ
      throw error;
    }
  }

  private async updateTargetStatus(
    targetId: string, 
    status: 'sent' | 'failed' | 'opt_out', 
    error?: string, 
    providerMessageId?: string
  ) {
    const updateData: any = {
      status,
      lastAttemptAt: new Date(),
    };

    if (error !== undefined) {
      updateData.error = error;
    }

    if (providerMessageId !== undefined) {
      updateData.providerMessageId = providerMessageId;
    }

    await this.prisma.campaignTarget.update({
      where: { id: targetId },
      data: updateData,
    });
  }

  private async updateCampaignCounters(campaignId: string) {
    const stats = await this.prisma.campaignTarget.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: { status: true },
    });

    const counters = {
      pending: 0,
      sent: 0,
      failed: 0,
      opt_out: 0,
    };

    stats.forEach((stat: { status: string; _count: { status: number } }) => {
      counters[stat.status as keyof typeof counters] = stat._count.status;
    });

    // Update campaign with current stats
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        sentCount: counters.sent,
        failedCount: counters.failed,
        optOutCount: counters.opt_out,
      },
    });
  }

  private async emitProgressEvent(campaignId: string) {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          companyId: true,
          totalTargets: true,
          sentCount: true,
          failedCount: true,
          optOutCount: true,
        },
      });

      if (!campaign) return;

      const processedCount = campaign.sentCount + campaign.failedCount + campaign.optOutCount;
      const progress = Math.round((processedCount / campaign.totalTargets) * 100);
      const estimatedTimeRemaining = this.calculateEstimatedTimeRemaining(
        processedCount,
        campaign.totalTargets,
        progress
      );
      
      const progressEvent: CampaignProgressEvent = {
        campaignId,
        companyId: campaign.companyId,
        totalTargets: campaign.totalTargets,
        processedCount,
        successCount: campaign.sentCount,
        failureCount: campaign.failedCount,
        optOutCount: campaign.optOutCount,
        progress,
        ...(estimatedTimeRemaining !== undefined && { estimatedTimeRemaining }),
      };

      this.campaignsGateway.emitCampaignProgress(campaignId, progressEvent);
    } catch (error) {
      this.logger.error('Failed to emit progress event:', error);
    }
  }

  private async checkCampaignCompletion(campaignId: string, companyId: string) {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          totalTargets: true,
          sentCount: true,
          failedCount: true,
          optOutCount: true,
          startedAt: true,
        },
      });

      if (!campaign) return;

      const processedCount = campaign.sentCount + campaign.failedCount + campaign.optOutCount;
      if (processedCount < campaign.totalTargets) {
        return; // Campaign not completed yet
      }

      // Campaign is completed
      const duration = campaign.startedAt 
        ? Math.round((Date.now() - campaign.startedAt.getTime()) / 1000)
        : 0;

      const finishedEvent: CampaignFinishedEvent = {
        campaignId,
        companyId,
        status: 'completed',
        totalTargets: campaign.totalTargets,
        successCount: campaign.sentCount,
        failureCount: campaign.failedCount,
        optOutCount: campaign.optOutCount,
        duration,
      };

      // Update campaign status
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Emit finished event
      this.campaignsGateway.emitCampaignUpdate(campaignId, finishedEvent);
      
      this.logger.log(`Campaign ${campaignId} completed successfully`);

    } catch (error) {
      this.logger.error('Failed to check campaign completion:', error);
    }
  }

  private calculateEstimatedTimeRemaining(
    processed: number, 
    total: number, 
    progress: number
  ): number | undefined {
    if (progress === 0 || progress === 100) return undefined;
    
    // Simple estimation based on current progress and rate
    const remaining = total - processed;
    const estimatedSeconds = Math.round((remaining / processed) * 60); // Rough estimate
    
    return Math.max(estimatedSeconds, 0);
  }
}
