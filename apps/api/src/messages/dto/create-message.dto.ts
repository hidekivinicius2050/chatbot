import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

export class CreateMessageDto {
  @ApiProperty({ 
    description: 'ID do ticket',
    example: 'clh1234567890'
  })
  @IsString()
  ticketId: string;

  @ApiProperty({ 
    description: 'Conteúdo da mensagem',
    example: 'Olá! Como posso ajudar?',
    required: false
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ 
    description: 'Tipo da mensagem',
    enum: MessageType,
    default: MessageType.TEXT
  })
  @IsEnum(MessageType)
  type: MessageType = MessageType.TEXT;

  @ApiProperty({ 
    description: 'URL da mídia (para imagens e arquivos)',
    required: false
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({ 
    description: 'ID do usuário que enviou a mensagem',
    required: false
  })
  @IsOptional()
  @IsString()
  senderId?: string;
}
