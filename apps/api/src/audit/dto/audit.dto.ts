import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class AuditQueryDto {
  @ApiProperty({ required: false, description: 'Cursor para paginação' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false, description: 'Limite de registros', default: 20 })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ required: false, enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'SEND_MESSAGE', 'START_CAMPAIGN', 'PAUSE_CAMPAIGN', 'RESUME_CAMPAIGN', 'FINISH_CAMPAIGN', 'CHANGE_SETTINGS', 'SET_SLA', 'SET_BUSINESS_HOURS', 'ASSIGN_TICKET', 'AUTOMATION_RUN'], description: 'Filtrar por ação' })
  @IsOptional()
  @IsEnum(['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'SEND_MESSAGE', 'START_CAMPAIGN', 'PAUSE_CAMPAIGN', 'RESUME_CAMPAIGN', 'FINISH_CAMPAIGN', 'CHANGE_SETTINGS', 'SET_SLA', 'SET_BUSINESS_HOURS', 'ASSIGN_TICKET', 'AUTOMATION_RUN'])
  action?: string;

  @ApiProperty({ required: false, description: 'Filtrar por ID do ator' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiProperty({ required: false, description: 'Filtrar por tipo de alvo' })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiProperty({ required: false, description: 'Data inicial (ISO)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ required: false, description: 'Data final (ISO)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export interface AuditLogData {
  companyId: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  targetType: string;
  targetId?: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any>;
}

export interface PiiRedactor {
  redactPhone: (phone: string) => string;
  redactEmail: (email: string) => string;
  redactName: (name: string) => string;
  redactText: (text: string) => string;
}
