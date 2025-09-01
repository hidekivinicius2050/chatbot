import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumberString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryMessagesDto {
  @ApiProperty({ 
    description: 'Cursor para paginação (ID da última mensagem)',
    required: false
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ 
    description: 'Limite de mensagens por página',
    minimum: 1,
    maximum: 100,
    default: 50,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
