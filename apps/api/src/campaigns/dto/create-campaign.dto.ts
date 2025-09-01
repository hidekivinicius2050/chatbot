import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';

export enum CampaignType {
  BROADCAST = 'broadcast',
  SEGMENTED = 'segmented',
  SCHEDULED = 'scheduled',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Nome da campanha',
    example: 'Promoção Black Friday'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição da campanha',
    example: 'Campanha promocional para Black Friday',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tipo da campanha',
    enum: CampaignType,
    example: CampaignType.BROADCAST
  })
  @IsEnum(CampaignType)
  @IsNotEmpty()
  type: CampaignType;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Aproveite nossas ofertas especiais! 🎉'
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'URL da mídia (opcional)',
    example: 'https://example.com/image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({
    description: 'Tipo da mídia',
    example: 'image/jpeg',
    required: false
  })
  @IsOptional()
  @IsString()
  mediaType?: string;

  @ApiProperty({
    description: 'ID do canal para envio',
    example: 'clh1234567890'
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({
    description: 'Data/hora agendada (para campanhas agendadas)',
    example: '2024-12-25T10:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: 'Configurações específicas da campanha',
    example: { rateLimit: 10, retryAttempts: 3 },
    required: false
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
