import { IsString, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DaySchedule {
  @ApiProperty({ example: '08:00', description: 'Hora de início (HH:mm)' })
  @IsString()
  start: string;

  @ApiProperty({ example: '18:00', description: 'Hora de fim (HH:mm)' })
  @IsString()
  end: string;
}

export class WeeklySchedule {
  @ApiProperty({ required: false, description: 'Segunda-feira' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DaySchedule)
  mon?: DaySchedule | null;

  @ApiProperty({ required: false, description: 'Terça-feira' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DaySchedule)
  tue?: DaySchedule | null;

  @ApiProperty({ required: false, description: 'Quarta-feira' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DaySchedule)
  wed?: DaySchedule | null;

  @ApiProperty({ required: false, description: 'Quinta-feira' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DaySchedule)
  thu?: DaySchedule | null;

  @ApiProperty({ required: false, description: 'Sexta-feira' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DaySchedule)
  fri?: DaySchedule | null;

  @ApiProperty({ required: false, description: 'Sábado' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DaySchedule)
  sat?: DaySchedule | null;

  @ApiProperty({ required: false, description: 'Domingo' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DaySchedule)
  sun?: DaySchedule | null;

  [key: string]: any;
}

export class UpdateBusinessHoursDto {
  @ApiProperty({ example: 'America/Sao_Paulo', description: 'Timezone da empresa' })
  @IsString()
  timezone: string;

  @ApiProperty({ 
    description: 'Horários semanais',
    example: {
      mon: { start: '08:00', end: '18:00' },
      tue: { start: '08:00', end: '18:00' },
      wed: { start: '08:00', end: '18:00' },
      thu: { start: '08:00', end: '18:00' },
      fri: { start: '08:00', end: '18:00' },
      sat: null,
      sun: null
    }
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WeeklySchedule)
  weeklyJson: WeeklySchedule;
}
