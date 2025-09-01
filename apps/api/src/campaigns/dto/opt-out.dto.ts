import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OptOutDto {
  @ApiProperty({
    description: 'ID do contato',
    example: 'clh1234567890'
  })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiProperty({
    description: 'ID do canal',
    example: 'clh0987654321'
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({
    description: 'Motivo do opt-out',
    example: 'Não quero receber mais mensagens',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Fonte do opt-out',
    example: 'webhook',
    required: false
  })
  @IsOptional()
  @IsString()
  source?: string;
}
