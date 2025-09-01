import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { EmailService } from './email.service';
import { CryptoService } from './crypto.service';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    companyId: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly cryptoService: CryptoService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      this.logger.warn(`Tentativa de login com email inexistente: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      this.logger.warn(`Tentativa de login com senha incorreta para: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    this.logger.log(`Login bem-sucedido para: ${email} (${user.role})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  async refresh(refreshDto: RefreshDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshDto;

    try {
      // Verificar refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
      });

      // Buscar refresh token no banco
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          id: payload.jti,
          revoked: false,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      // Revogar token atual
      await this.prisma.refreshToken.update({
        where: { id: payload.jti },
        data: { revoked: true },
      });

      // Gerar novos tokens
      const newAccessToken = await this.generateAccessToken(storedToken.user);
      const newRefreshToken = await this.generateRefreshToken(storedToken.user);

      this.logger.log(`Token renovado para: ${storedToken.user.email}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.warn('Tentativa de refresh com token inválido');
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    const { refreshToken } = logoutDto;

    try {
      // Verificar refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
      });

      // Revogar token
      await this.prisma.refreshToken.updateMany({
        where: { id: payload.jti },
        data: { revoked: true },
      });

      this.logger.log('Logout realizado com sucesso');
    } catch (error) {
      // Mesmo com erro, consideramos logout válido
      this.logger.warn('Logout com token inválido, mas processado');
    }
  }

  private async generateAccessToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      expiresIn: process.env.ACCESS_TOKEN_TTL || '15m',
    });
  }

  private async generateRefreshToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      jti: `rt_${user.id}_${Date.now()}`,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
      expiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
    });

    // Salvar refresh token no banco
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await this.prisma.refreshToken.create({
      data: {
        id: payload.jti,
        userId: user.id,
        expiresAt,
      },
    });

    return token;
  }

  async validateUser(userId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    // Sempre retornar 200 para não vazar se o email existe
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Gerar token de reset
      const token = this.cryptoService.generateSecureToken(32);
      const tokenHash = await argon2.hash(token);

      // Salvar no banco
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(process.env.RESET_TOKEN_TTL_MIN || '30'));

      await this.prisma.passwordReset.create({
        data: {
          email,
          tokenHash,
          expiresAt,
        },
      });

      // Enviar email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await this.emailService.sendPasswordResetEmail(email, resetUrl);

      this.logger.log(`Solicitação de reset de senha para: ${email}`);
    } else {
      this.logger.warn(`Tentativa de reset de senha para email inexistente: ${email}`);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    // Buscar reset válido
    const reset = await this.prisma.passwordReset.findFirst({
      where: {
        tokenHash: { not: '' },
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!reset) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Verificar token
    const isValidToken = await argon2.verify(reset.tokenHash, token);
    if (!isValidToken) {
      throw new BadRequestException('Token inválido');
    }

    // Atualizar senha
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { email: reset.email },
      data: { passwordHash },
    });

    // Marcar token como usado
    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    });

    // Revogar todos os refresh tokens do usuário
    await this.prisma.refreshToken.updateMany({
      where: { userId: reset.email },
      data: { revoked: true },
    });

    this.logger.log(`Senha redefinida para: ${reset.email}`);
  }

  async inviteUser(inviteUserDto: InviteUserDto, currentUser: any): Promise<void> {
    const { email, role } = inviteUserDto;

    // Verificar se usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Usuário já existe');
    }

    // Verificar se já existe convite pendente
    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email,
        companyId: currentUser.companyId,
        accepted: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new BadRequestException('Convite já enviado para este email');
    }

    // Gerar token de convite
    const token = this.cryptoService.generateSecureToken(32);
    const tokenHash = await argon2.hash(token);

    // Salvar convite
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.INVITE_TOKEN_TTL_H || '72'));

    await this.prisma.invite.create({
      data: {
        email,
        role,
        tokenHash,
        expiresAt,
        companyId: currentUser.companyId,
        invitedBy: currentUser.id,
      },
    });

    // Enviar email
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
    await this.emailService.sendInviteEmail(email, inviteUrl, currentUser.name, role);

    this.logger.log(`Convite enviado para: ${email} (${role})`);
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto): Promise<AuthResponse> {
    const { token, name, password } = acceptInviteDto;

    // Buscar convite válido
    const invite = await this.prisma.invite.findFirst({
      where: {
        tokenHash: { not: '' },
        accepted: false,
        expiresAt: { gt: new Date() },
      },
      include: { company: true },
    });

    if (!invite) {
      throw new BadRequestException('Convite inválido ou expirado');
    }

    // Verificar token
    const isValidToken = await argon2.verify(invite.tokenHash, token);
    if (!isValidToken) {
      throw new BadRequestException('Token inválido');
    }

    // Criar usuário
    const passwordHash = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: {
        email: invite.email,
        name,
        passwordHash,
        role: invite.role,
        companyId: invite.companyId,
      },
    });

    // Marcar convite como aceito
    await this.prisma.invite.update({
      where: { id: invite.id },
      data: {
        accepted: true,
        acceptedAt: new Date(),
        acceptedBy: user.id,
      },
    });

    // Gerar tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    this.logger.log(`Convite aceito por: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }
}
