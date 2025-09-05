import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IPTVService, CreateIPTVUserDto, IPTVResponse } from './iptv.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';

export class GenerateTestCredentialsDto {
  phoneNumber: string;
  name?: string;
}

export class UpdateIPTVUserDto {
  connections?: number;
  expirationDays?: number;
  status?: 'active' | 'inactive';
}

@ApiTags('IPTV Integration')
@Controller('iptv')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IPTVController {
  constructor(private readonly iptvService: IPTVService) {}

  @Post('test-user')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Criar usuário de teste no IPTV' })
  @ApiResponse({ status: 201, description: 'Usuário de teste criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async createTestUser(@Body() createUserDto: CreateIPTVUserDto): Promise<IPTVResponse> {
    return this.iptvService.createTestUser(createUserDto);
  }

  @Post('request-test-credentials')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Solicitar credenciais de teste para cliente' })
  @ApiResponse({ status: 201, description: 'Solicitação de credenciais enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async requestTestCredentials(@Body() generateDto: GenerateTestCredentialsDto): Promise<IPTVResponse> {
    // Primeiro, consulta se o usuário já tem um teste ativo
    const existingTestUser = await this.iptvService.queryTestUser(generateDto.phoneNumber);
    if (existingTestUser.success && existingTestUser.data) {
      return { 
        success: false, 
        message: 'Este número já possui um teste IPTV ativo.', 
        data: existingTestUser.data 
      };
    }
    
    // Se não tiver, solicita criação no sistema IPTV
    return this.iptvService.requestTestUser({
      phone: generateDto.phoneNumber,
      name: generateDto.name,
      expirationDays: 7
    });
  }

  @Get('user/:username')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Buscar informações de usuário' })
  @ApiResponse({ status: 200, description: 'Informações do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserInfo(@Param('username') username: string): Promise<IPTVResponse> {
    return this.iptvService.getUserInfo(username);
  }

  @Put('user/:username')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('username') username: string,
    @Body() updateDto: UpdateIPTVUserDto
  ): Promise<IPTVResponse> {
    return this.iptvService.updateUser(username, updateDto);
  }

  @Delete('user/:username')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Remover usuário de teste' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deleteTestUser(@Param('username') username: string): Promise<IPTVResponse> {
    return this.iptvService.deleteTestUser(username);
  }

  @Get('test-users')
  @Roles('ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Listar usuários de teste' })
  @ApiResponse({ status: 200, description: 'Lista de usuários de teste' })
  async listTestUsers(): Promise<IPTVResponse> {
    return this.iptvService.listTestUsers();
  }
}
