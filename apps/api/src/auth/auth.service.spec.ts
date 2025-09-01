import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { CryptoService } from './crypto.service';

// Mock argon2
jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user1',
    email: 'admin@test.com',
    name: 'Admin Test',
    passwordHash: 'hashed_password',
    role: 'ADMIN',
    companyId: 'company1',
    company: { name: 'Test Company' },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
            sendInviteEmail: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            generateSecureToken: jest.fn().mockReturnValue('mock-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens and user data on successful login', async () => {
      const loginDto = { email: 'admin@test.com', password: '123456' };
      const mockTokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const { verify } = require('argon2');
      verify.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = { email: 'nonexistent@test.com', password: '123456' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { email: 'admin@test.com', password: 'wrong_password' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const { verify } = require('argon2');
      verify.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh', async () => {
      const refreshDto = { refreshToken: 'valid_refresh_token' };
      const mockPayload = { jti: 'token_id', sub: 'user1' };
      const mockStoredToken = {
        id: 'token_id',
        user: mockUser,
        revoked: false,
        expiresAt: new Date(Date.now() + 86400000), // 1 day from now
      };
      const mockNewTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaService.refreshToken.findFirst.mockResolvedValue(mockStoredToken);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockNewTokens.accessToken)
        .mockResolvedValueOnce(mockNewTokens.refreshToken);

      const result = await service.refresh(refreshDto);

      expect(result.accessToken).toBe(mockNewTokens.accessToken);
      expect(result.refreshToken).toBe(mockNewTokens.refreshToken);
      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockPayload.jti },
        data: { revoked: true },
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshDto = { refreshToken: 'invalid_token' };

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke refresh token on logout', async () => {
      const logoutDto = { refreshToken: 'valid_token' };
      const mockPayload = { jti: 'token_id' };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.logout(logoutDto);

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: mockPayload.jti },
        data: { revoked: true },
      });
    });

    it('should handle logout with invalid token gracefully', async () => {
      const logoutDto = { refreshToken: 'invalid_token' };

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Should not throw error
      await expect(service.logout(logoutDto)).resolves.toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid user ID', async () => {
      const userId = 'user1';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { company: true },
      });
    });

    it('should return null for non-existent user', async () => {
      const userId = 'nonexistent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(userId);

      expect(result).toBeNull();
    });
  });
});
