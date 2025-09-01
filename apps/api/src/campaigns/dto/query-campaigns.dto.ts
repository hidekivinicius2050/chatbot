import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { CampaignStatus, CampaignType } from './create-campaign.dto';

export class QueryCampaignsDto {
  @ApiProperty({
    description: 'Status da campanha',
    enum: CampaignStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiProperty({
    description: 'Tipo da campanha',
    enum: CampaignType,
    required: false
  })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiProperty({
    description: 'ID do canal',
    required: false
  })
  @IsOptional()
  @IsString()
  channelId?: string;

  @ApiProperty({
    description: 'Data de início para filtro',
    example: '2024-01-01T00:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data de fim para filtro',
    example: '2024-12-31T23:59:59Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Cursor para paginação',
    required: false
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: 'Limite de resultados por página',
    default: 20,
    required: false
  })
  @IsOptional()
  limit?: number = 20;
}
