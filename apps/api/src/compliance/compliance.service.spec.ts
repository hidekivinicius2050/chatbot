import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceService } from './compliance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        {
          provide: PrismaService,
          useValue: {
            consentEvent: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
            dsrRequest: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            subscription: {
              findUnique: jest.fn(),
            },
            message: {
              findMany: jest.fn(),
              updateMany: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordConsent', () => {
    it('should record consent successfully', async () => {
      const mockConsent = { id: '1', kind: 'TERMS', accepted: true };
      jest.spyOn(prismaService.consentEvent, 'create').mockResolvedValue(mockConsent as any);

      const result = await service.recordConsent('company1', {
        kind: 'TERMS',
        accepted: true,
      });

      expect(result).toEqual(mockConsent);
      expect(prismaService.consentEvent.create).toHaveBeenCalledWith({
        data: {
          companyId: 'company1',
          kind: 'TERMS',
          accepted: true,
        },
      });
    });
  });

  describe('hasValidConsent', () => {
    it('should return true when valid consent exists', async () => {
      const mockConsent = { id: '1', kind: 'TERMS', accepted: true };
      jest.spyOn(prismaService.consentEvent, 'findFirst').mockResolvedValue(mockConsent as any);

      const result = await service.hasValidConsent('company1', 'TERMS');

      expect(result).toBe(true);
    });

    it('should return false when no valid consent exists', async () => {
      jest.spyOn(prismaService.consentEvent, 'findFirst').mockResolvedValue(null);

      const result = await service.hasValidConsent('company1', 'TERMS');

      expect(result).toBe(false);
    });
  });
});
