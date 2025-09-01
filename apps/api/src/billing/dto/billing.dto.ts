import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
  CUSTOM = 'CUSTOM',
}

export type EntitlementKey =
  | 'users.max'
  | 'channels.max'
  | 'messages.monthly.max'
  | 'campaigns.daily.max'
  | 'retention.days'
  | 'feature.campaigns'
  | 'feature.automations'
  | 'feature.reports.advanced';

export class CheckoutDto {
  @ApiProperty({ enum: PlanTier, description: 'Tier do plano' })
  @IsEnum(PlanTier)
  tier: PlanTier;
}

export class MockUpgradeDto {
  @ApiProperty({ enum: PlanTier, description: 'Tier do plano' })
  @IsEnum(PlanTier)
  tier: PlanTier;
}

export class EntitlementOverrideDto {
  @ApiProperty({ required: false, description: 'Limite máximo de usuários' })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiProperty({ required: false, description: 'Limite máximo de canais' })
  @IsOptional()
  @IsNumber()
  maxChannels?: number;

  @ApiProperty({ required: false, description: 'Limite máximo de mensagens mensais' })
  @IsOptional()
  @IsNumber()
  maxMessagesMonthly?: number;

  @ApiProperty({ required: false, description: 'Limite máximo de campanhas diárias' })
  @IsOptional()
  @IsNumber()
  maxCampaignsDaily?: number;

  @ApiProperty({ required: false, description: 'Dias de retenção' })
  @IsOptional()
  @IsNumber()
  retentionDays?: number;

  @ApiProperty({ required: false, description: 'Features habilitadas' })
  @IsOptional()
  features?: Record<string, any>;
}

export interface Entitlements {
  'users.max': number;
  'channels.max': number;
  'messages.monthly.max': number;
  'campaigns.daily.max': number;
  'retention.days': number;
  'feature.campaigns': boolean;
  'feature.automations': boolean;
  'feature.reports.advanced': boolean;
}

export interface UsageData {
  key: string;
  used: number;
  max: number;
  percentage: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface QuotaCheckResult {
  ok: boolean;
  remaining: number;
  used: number;
  max: number;
  percentage: number;
}
