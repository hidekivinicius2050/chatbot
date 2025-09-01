import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const originalData = 'sensitive data to encrypt';
      const encrypted = service.encrypt(originalData);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalData);
      expect(encrypted).toContain(':');
      
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('should handle empty string', () => {
      const originalData = '';
      const encrypted = service.encrypt(originalData);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('should handle special characters', () => {
      const originalData = 'sensitive data with special chars: !@#$%^&*()';
      const encrypted = service.encrypt(originalData);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => service.decrypt('invalid-data')).toThrow('Formato de dados criptografados inválido');
    });

    it('should throw error for malformed encrypted data', () => {
      expect(() => service.decrypt('iv:invalid')).toThrow('Falha na descriptografia');
    });
  });

  describe('maskSecret', () => {
    it('should mask secret correctly', () => {
      const secret = 'mysecretpassword123';
      const masked = service.maskSecret(secret);
      
      expect(masked).toBe('***************d123');
      expect(masked.length).toBe(secret.length);
    });

    it('should handle short secrets', () => {
      const secret = 'abc';
      const masked = service.maskSecret(secret, 2);
      expect(masked).toBe('*bc');
    });

    it('should handle empty string', () => {
      const masked = service.maskSecret('');
      expect(masked).toBe('');
    });

    it('should handle null/undefined', () => {
      const masked = service.maskSecret(null as any);
      expect(masked).toBe('');
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token with default length', () => {
      const token = service.generateSecureToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate token with custom length', () => {
      const token = service.generateSecureToken(16);
      expect(token).toBeDefined();
      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should generate different tokens', () => {
      const token1 = service.generateSecureToken();
      const token2 = service.generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });
});
