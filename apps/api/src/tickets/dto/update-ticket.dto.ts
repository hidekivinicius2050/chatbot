import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum TicketStatus {
  OPEN = 'open',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class UpdateTicketDto {
  @ApiProperty({ 
    description: 'Status do ticket',
    enum: TicketStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiProperty({ 
    description: 'Prioridade do ticket',
    enum: TicketPriority,
    required: false
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({ 
    description: 'ID do usuário atribuído ao ticket',
    required: false
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
