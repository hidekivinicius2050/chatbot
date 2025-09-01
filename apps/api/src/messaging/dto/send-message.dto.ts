import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../../messages/dto/create-message.dto';

export class SendMessageDto {
  @ApiProperty({ description: 'ID do ticket' })
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({ description: 'Conteúdo da mensagem', required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: 'Tipo da mensagem', enum: MessageType })
  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @ApiProperty({ description: 'URL da mídia (para imagens e arquivos)', required: false })
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @ApiProperty({ description: 'Tipo de mídia', required: false })
  @IsString()
  @IsOptional()
  mediaType?: string;
}
