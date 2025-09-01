import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum ReportScope {
  CHAT = 'chat',
  CAMPAIGN = 'campaign',
  SLA = 'sla',
  CHANNEL = 'channel',
  AGENT = 'agent',
}

export class ReportQueryDto {
  @ApiProperty({ required: false, description: 'Data inicial (ISO)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ required: false, description: 'Data final (ISO)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiProperty({ required: false, description: 'Limite de registros', default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class DailyReportQueryDto extends ReportQueryDto {
  @ApiProperty({ required: false, enum: ReportScope, description: 'Escopo do relatório' })
  @IsOptional()
  @IsEnum(ReportScope)
  scope?: ReportScope;

  @ApiProperty({ required: false, description: 'Chave específica (ex: channelId, agentId)' })
  @IsOptional()
  @IsString()
  key?: string;
}

export interface OverviewStats {
  tickets: {
    opened: number;
    closed: number;
    avgFirstResponseTime: number;
    avgResolutionTime: number;
  };
  messages: {
    sent: number;
    received: number;
    delivered: number;
    failed: number;
  };
  campaigns: {
    sent: number;
    delivered: number;
    failed: number;
    optOuts: number;
  };
  sla: {
    firstResponseCompliance: number;
    resolutionCompliance: number;
    breaches: number;
  };
}

export interface AgentStats {
  agentId: string;
  agentName: string;
  ticketsHandled: number;
  avgFirstResponseTime: number;
  avgResolutionTime: number;
  messagesSent: number;
  slaCompliance: number;
}

export interface ChannelStats {
  channelId: string;
  channelName: string;
  channelType: string;
  messagesSent: number;
  messagesDelivered: number;
  messagesFailed: number;
  deliveryRate: number;
  avgCps: number;
}

export interface DailyMetric {
  date: string;
  value: number;
  scope: string;
  key: string;
  metric: string;
}
