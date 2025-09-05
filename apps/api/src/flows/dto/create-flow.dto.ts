import { IsString, IsEnum, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlowDto {
  @ApiProperty({ example: 'Fluxo de Boas-vindas', description: 'Nome do fluxo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fluxo para receber novos usuários', description: 'Descrição do fluxo' })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: 'draft', 
    description: 'Status do fluxo',
    enum: ['draft', 'active', 'paused']
  })
  @IsEnum(['draft', 'active', 'paused'])
  status: 'draft' | 'active' | 'paused';

  @ApiProperty({ 
    example: 'support', 
    description: 'Tipo do fluxo',
    enum: ['support', 'sales', 'appointment', 'marketing']
  })
  @IsEnum(['support', 'sales', 'appointment', 'marketing'])
  type: 'support' | 'sales' | 'appointment' | 'marketing';

  @ApiProperty({ 
    description: 'Passos do fluxo',
    type: 'object'
  })
  @IsObject()
  steps: any;
}


