import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatGPTService, ChatGPTMessage } from './chatgpt.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

class SendMessageDto {
  profileId: string;
  message: string;
  conversationHistory?: ChatGPTMessage[];
}

class CreateProfileDto {
  name: string;
  description?: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

class UpdateProfileDto {
  name?: string;
  description?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
}

@ApiTags('ChatGPT')
@Controller('chatgpt')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatGPTController {
  constructor(private readonly chatgptService: ChatGPTService) {}

  @Post('send-message')
  @ApiOperation({ summary: 'Envia mensagem para ChatGPT usando um perfil específico' })
  @ApiResponse({ status: 200, description: 'Mensagem processada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sendMessage(@Body() body: SendMessageDto) {
    const { profileId, message, conversationHistory } = body;
    const response = await this.chatgptService.sendMessage(profileId, message, conversationHistory);
    return {
      success: true,
      data: response
    };
  }

  @Get('profiles')
  @ApiOperation({ summary: 'Lista todos os perfis de ChatGPT ativos' })
  @ApiResponse({ status: 200, description: 'Lista de perfis retornada com sucesso' })
  async getProfiles() {
    const profiles = await this.chatgptService.getActiveProfiles();
    return {
      success: true,
      data: profiles
    };
  }

  @Get('profiles/:name')
  @ApiOperation({ summary: 'Busca perfil por nome' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async getProfileByName(@Param('name') name: string) {
    const profile = await this.chatgptService.getProfileByName(name);
    if (!profile) {
      return {
        success: false,
        message: 'Perfil não encontrado'
      };
    }
    return {
      success: true,
      data: profile
    };
  }

  @Post('profiles')
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Cria novo perfil de ChatGPT' })
  @ApiResponse({ status: 201, description: 'Perfil criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createProfile(@Body() body: CreateProfileDto) {
    const profile = await this.chatgptService.createProfile(body);
    return {
      success: true,
      message: 'Perfil criado com sucesso',
      data: profile
    };
  }

  @Put('profiles/:id')
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Atualiza perfil de ChatGPT' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async updateProfile(@Param('id') id: string, @Body() body: UpdateProfileDto) {
    const profile = await this.chatgptService.updateProfile(id, body);
    return {
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: profile
    };
  }

  @Delete('profiles/:id')
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Remove perfil de ChatGPT' })
  @ApiResponse({ status: 200, description: 'Perfil removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async deleteProfile(@Param('id') id: string) {
    await this.chatgptService.deleteProfile(id);
    return {
      success: true,
      message: 'Perfil removido com sucesso'
    };
  }

  @Post('setup-default-profiles')
  @Roles('admin', 'owner')
  @ApiOperation({ summary: 'Cria perfis padrão do sistema' })
  @ApiResponse({ status: 200, description: 'Perfis padrão criados com sucesso' })
  async setupDefaultProfiles() {
    await this.chatgptService.createDefaultProfiles();
    return {
      success: true,
      message: 'Perfis padrão criados com sucesso'
    };
  }
}
