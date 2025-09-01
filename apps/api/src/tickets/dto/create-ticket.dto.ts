import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTicketDto {
  @ApiProperty({ description: 'ID do contato' })
  @IsString()
  contactId: string;

  @ApiProperty({ 
    description: 'Prioridade do ticket',
    enum: TicketPriority,
    required: false,
    default: TicketPriority.MEDIUM
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}
