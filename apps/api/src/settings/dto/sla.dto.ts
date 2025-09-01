import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlaDto {
  @ApiProperty({ 
    example: 15, 
    description: 'Tempo máximo para primeira resposta (minutos)',
    minimum: 1,
    maximum: 1440
  })
  @IsInt()
  @Min(1)
  @Max(1440)
  firstResponseMins: number;

  @ApiProperty({ 
    example: 480, 
    description: 'Tempo máximo para resolução (minutos)',
    minimum: 1,
    maximum: 10080
  })
  @IsInt()
  @Min(1)
  @Max(10080)
  resolutionMins: number;
}
