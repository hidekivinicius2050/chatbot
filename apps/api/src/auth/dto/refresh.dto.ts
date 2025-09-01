import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token para renovar acesso' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
