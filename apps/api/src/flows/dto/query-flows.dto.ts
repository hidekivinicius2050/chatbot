import { IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryFlowsDto {
  @ApiProperty({ 
    required: false, 
    example: 'active', 
    description: 'Filtrar por status',
    enum: ['draft', 'active', 'paused']
  })
  @IsOptional()
  @IsEnum(['draft', 'active', 'paused'])
  status?: 'draft' | 'active' | 'paused';

  @ApiProperty({ 
    required: false, 
    example: 'support', 
    description: 'Filtrar por tipo',
    enum: ['support', 'sales', 'appointment', 'marketing']
  })
  @IsOptional()
  @IsEnum(['support', 'sales', 'appointment', 'marketing'])
  type?: 'support' | 'sales' | 'appointment' | 'marketing';

  @ApiProperty({ required: false, description: 'Cursor para paginação' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false, example: 20, description: 'Limite de resultados', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}


