import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OidcService } from './oidc.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard, Roles } from './guards/roles.guard';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oidcService: OidcService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            companyId: { type: 'string' },
          },
        },
      },
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de login' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens de acesso' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens renovados com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    }
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({ status: 204, description: 'Logout realizado com sucesso' })
  async logout(@Body() logoutDto: LogoutDto): Promise<void> {
    return this.authService.logout(logoutDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('admin/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rota de exemplo só para ADMIN/OWNER' })
  @ApiResponse({ status: 200, description: 'Pong! Acesso permitido' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  async adminPing() {
    return { message: 'Pong! Acesso ADMIN permitido', timestamp: new Date().toISOString() };
  }

  @Post('forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar reset de senha' })
  @ApiResponse({ status: 200, description: 'Email de reset enviado (se existir)' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha com token' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Convidar usuário para a empresa' })
  @ApiResponse({ status: 200, description: 'Convite enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário já existe ou convite já enviado' })
  async inviteUser(@Body() inviteUserDto: InviteUserDto, @Request() req: any): Promise<void> {
    return this.authService.inviteUser(inviteUserDto, req.user);
  }

  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceitar convite e criar conta' })
  @ApiResponse({ status: 200, description: 'Convite aceito e conta criada' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto) {
    return this.authService.acceptInvite(acceptInviteDto);
  }

  @Get('oidc/:provider/login')
  @ApiOperation({ summary: 'Iniciar login SSO/OIDC' })
  @ApiResponse({ status: 302, description: 'Redirecionamento para provider OIDC' })
  async oidcLogin(@Param('provider') provider: string, @Res() res: Response, @Query('state') state?: string) {
    const loginUrl = this.oidcService.generateLoginUrl(provider, state);
    res.redirect(loginUrl);
  }

  @Get('oidc/callback')
  @ApiOperation({ summary: 'Callback OIDC' })
  @ApiResponse({ status: 200, description: 'Login OIDC realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Falha na autenticação OIDC' })
  async oidcCallback(@Query('code') code: string, @Query('state') state?: string) {
    return this.oidcService.handleCallback('google', code, state); // TODO: detectar provider do state
  }
}
