import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export enum ReportType {
  DAILY = 'daily',
  CAMPAIGN = 'campaign',
  SUMMARY = 'summary',
}

export class ReportsQueryDto {
  @ApiProperty({
    description: 'Tipo de relatório',
    enum: ReportType,
    default: ReportType.DAILY
  })
  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType = ReportType.DAILY;

  @ApiProperty({
    description: 'ID da campanha (para relatórios específicos)',
    required: false
  })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiProperty({
    description: 'Data de início',
    example: '2024-01-01T00:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data de fim',
    example: '2024-12-31T23:59:59Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'ID do canal para filtrar',
    required: false
  })
  @IsOptional()
  @IsString()
  channelId?: string;
}
