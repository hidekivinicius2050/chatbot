import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PluginsService } from './plugins.service';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../auth/crypto.service';

describe('PluginsService', () => {
  let service: PluginsService;
  let prismaService: PrismaService;
  let cryptoService: CryptoService;

  const mockPrismaService = {
    plugin: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    appInstallation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    appToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCryptoService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    maskSecret: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PluginsService>(PluginsService);
    prismaService = module.get<PrismaService>(PrismaService);
    cryptoService = module.get<CryptoService>(CryptoService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('getMarketplacePlugins', () => {
    it('deve retornar lista de plugins', async () => {
      const mockPlugins = [
        {
          id: '1',
          slug: 'slack-notifier',
          name: 'Slack Notifier',
          publisher: 'Atendechat',
          description: 'Notifica o Slack',
          website: 'https://slack.com',
          appUrl: null,
          features: {},
          requiredScopes: ['read_tickets'],
          createdAt: new Date(),
          updatedAt: new Date(),
          versions: [{ version: '1.0.0' }],
          _count: { installations: 5 },
        },
      ];

      mockPrismaService.plugin.findMany.mockResolvedValue(mockPlugins);

      const result = await service.getMarketplacePlugins();

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.slug).toBe('slack-notifier');
      expect(result.items[0]?.installCount).toBe(5);
    });
  });

  describe('validateAppToken', () => {
    it('deve retornar null para token inválido', async () => {
      const result = await service.validateAppToken('invalid-token');
      expect(result).toBeNull();
    });

    it('deve validar token correto', async () => {
      const mockToken = 'atk_validtoken';
      mockConfigService.get.mockReturnValue('atk_');
      
      const mockTokenRecord = {
        id: '1',
        tokenHash: 'hashed',
        companyId: 'company1',
        installationId: 'install1',
        scopes: ['read_tickets'],
        installation: {
          plugin: { name: 'Test Plugin' },
        },
        company: { name: 'Test Company' },
      };

      mockPrismaService.appToken.findMany.mockResolvedValue([mockTokenRecord]);
      mockPrismaService.appToken.update.mockResolvedValue({});

      // Mock argon2.verify to return true
      jest.doMock('argon2', () => ({
        verify: jest.fn().mockResolvedValue(true),
      }));

      const argon2 = require('argon2');
      argon2.verify.mockResolvedValue(true);

      const result = await service.validateAppToken(mockToken);
      expect(result).toBeTruthy();
    });
  });

  describe('maskUrl', () => {
    it('deve mascarar URL corretamente', () => {
      const service_: any = service;
      const maskedUrl = service_.maskUrl('https://api.example.com/webhook?secret=123');
      expect(maskedUrl).toBe('https://api.example.com/webhook***');
    });
  });
});
