import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumberString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TicketStatus {
  OPEN = 'open',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export class QueryTicketsDto {
  @ApiProperty({ 
    description: 'Status do ticket para filtrar',
    enum: TicketStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiProperty({ 
    description: 'Termo de busca (nome do contato ou telefone)',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Cursor para paginação (ID do último ticket)',
    required: false
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ 
    description: 'Limite de tickets por página',
    minimum: 1,
    maximum: 100,
    default: 30,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(100)
  limit?: number = 30;
}
