import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddTargetsDto {
  @ApiProperty({
    description: 'IDs dos contatos para adicionar como alvos',
    example: ['clh1234567890', 'clh0987654321'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  contactIds: string[];

  @ApiProperty({
    description: 'Configurações específicas para estes alvos',
    example: { priority: 'high', customMessage: 'Cliente VIP' },
    required: false
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
