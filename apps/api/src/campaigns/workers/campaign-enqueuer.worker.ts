import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job, Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';

export interface EnqueueCampaignJob {
  campaignId: string;
  batchSize?: number;
  delayBetweenBatches?: number;
}

@Processor('campaigns:enqueuer')
export class CampaignEnqueuerWorker {
  private readonly logger = new Logger(CampaignEnqueuerWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('campaigns:sender') private readonly senderQueue: Queue,
  ) {}

  @Process('enqueue-campaign')
  async handleEnqueueCampaign(job: Job<EnqueueCampaignJob>) {
    const { campaignId, batchSize = 50, delayBetweenBatches = 1000 } = job.data;
    
    this.logger.log(`Starting to enqueue campaign ${campaignId}`);

    try {
      // Fetch pending targets for this campaign
      const pendingTargets = await this.prisma.campaignTarget.findMany({
        where: {
          campaignId,
          status: 'pending',
        },
        include: {
          contact: true,
          campaign: {
            include: {
              channel: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (pendingTargets.length === 0) {
        this.logger.log(`No pending targets found for campaign ${campaignId}`);
        return;
      }

      this.logger.log(`Found ${pendingTargets.length} pending targets for campaign ${campaignId}`);

      // Process targets in batches
      const batches = this.chunkArray(pendingTargets, batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        if (!batch) continue;
        
        // Add delay between batches for rate limiting
        if (i > 0) {
          await this.delay(delayBetweenBatches);
        }

        // Add jobs to the sender queue
        const jobs = batch.map((target: any) => ({
          name: 'send-message',
          data: {
            targetId: target.id,
            campaignId: target.campaignId,
            contactId: target.contactId,
            channelId: target.campaign.channelId,
            message: target.campaign.message,
            mediaUrl: target.campaign.mediaUrl,
            mediaType: target.campaign.mediaType,
            provider: target.campaign.channel.type,
            externalId: target.campaign.channel.externalId || '',
          },
          opts: {
            delay: i * delayBetweenBatches, // Stagger jobs within batch
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: 100,
            removeOnFail: 50,
          },
        }));

        // Add all jobs in the batch
        await this.senderQueue.addBulk(jobs);
        
        this.logger.log(`Added batch ${i + 1}/${batches.length} with ${batch.length} jobs for campaign ${campaignId}`);
      }

      // Update campaign status to running
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { 
          status: 'running',
          startedAt: new Date(),
        },
      });

      this.logger.log(`Successfully enqueued campaign ${campaignId} with ${pendingTargets.length} targets`);

    } catch (error) {
      this.logger.error(`Failed to enqueue campaign ${campaignId}:`, error);
      
      // Mark campaign as failed (without error field)
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { 
          status: 'failed',
        },
      });

      throw error;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
