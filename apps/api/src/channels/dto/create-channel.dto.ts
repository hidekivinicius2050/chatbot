import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({ description: 'Nome amigável do canal' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tipo do canal', enum: ['whatsapp-cloud', 'whatsapp-baileys'] })
  @IsString()
  @IsNotEmpty()
  type: 'whatsapp-cloud' | 'whatsapp-baileys';

  @ApiProperty({ description: 'ID externo do provider (ex: phone number ID)', required: false })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiProperty({ description: 'Configuração específica do provider', required: false })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
