import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class InviteUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsEnum(Role, { message: 'Função inválida' })
  @IsNotEmpty({ message: 'Função é obrigatória' })
  role: Role;
}
