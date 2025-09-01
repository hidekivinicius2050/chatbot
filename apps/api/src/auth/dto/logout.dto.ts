import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ description: 'Refresh token para revogar' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
