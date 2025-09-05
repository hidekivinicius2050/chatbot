import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevAuthGuard } from './guards/dev-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
// import { RefreshTokenDto } from './dto/refresh-token.dto';
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';
// import { InviteUserDto } from './dto/invite-user.dto';
// import { AcceptInviteDto } from './dto/accept-invite.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async refresh(@Body() refreshTokenDto: any) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(DevAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer logout' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  @Get('profile')
  @UseGuards(DevAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil obtido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('admin/ping')
  @UseGuards(DevAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar acesso de administrador' })
  @ApiResponse({ status: 200, description: 'Acesso confirmado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async adminPing(@Request() req: any) {
    return { message: 'Admin access confirmed', user: req.user };
  }

  @Post('forgot')
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  @ApiResponse({ status: 200, description: 'Email de redefinição enviado' })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  async forgotPassword(@Body() forgotPasswordDto: any) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Redefinir senha' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  async resetPassword(@Body() resetPasswordDto: any) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('invite')
  @UseGuards(DevAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Convidar usuário' })
  @ApiResponse({ status: 201, description: 'Convite enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async inviteUser(@Body() inviteUserDto: any, @Request() req: any) {
    return this.authService.inviteUser(inviteUserDto, req.user);
  }

  @Post('accept-invite')
  @ApiOperation({ summary: 'Aceitar convite' })
  @ApiResponse({ status: 200, description: 'Convite aceito com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  async acceptInvite(@Body() acceptInviteDto: any) {
    return this.authService.acceptInvite(acceptInviteDto);
  }

  @Get('oidc/:provider/login')
  @ApiOperation({ summary: 'Iniciar login OIDC' })
  @ApiResponse({ status: 200, description: 'Redirecionamento para provedor' })
  async oidcLogin(@Request() req: any) {
    return { message: 'OIDC login not implemented' };
  }

  @Get('oidc/callback')
  @ApiOperation({ summary: 'Callback OIDC' })
  @ApiResponse({ status: 200, description: 'Login OIDC realizado' })
  async oidcCallback(@Request() req: any) {
    return { message: 'OIDC callback not implemented' };
  }
}
