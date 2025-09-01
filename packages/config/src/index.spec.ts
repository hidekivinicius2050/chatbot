import { envSchema, databaseConfig, redisConfig, jwtConfig, uploadConfig, rateLimitConfig, loggingConfig } from './index';

describe('Config Package', () => {
  describe('envSchema', () => {
    it('should validate valid environment variables', () => {
      const validEnv = {
        NODE_ENV: 'development',
        PORT: '3001',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'super-secret-key-min-32-chars-long-12345',
        JWT_EXPIRES_IN: '2h',
        CORS_ORIGIN: 'http://localhost:3000',
      };

      const result = envSchema.parse(validEnv);
      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3001); // Deve ser convertido para número
      expect(result.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
      expect(result.REDIS_URL).toBe('redis://localhost:6379');
      expect(result.JWT_SECRET).toBe('super-secret-key-min-32-chars-long-12345');
      expect(result.JWT_EXPIRES_IN).toBe('2h');
      expect(result.CORS_ORIGIN).toBe('http://localhost:3000');
    });

    it('should use default values when not provided', () => {
      const minimalEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'super-secret-key-min-32-chars-long-12345',
      };

      const result = envSchema.parse(minimalEnv);
      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3000);
      expect(result.REDIS_URL).toBe('redis://localhost:6379');
      expect(result.JWT_EXPIRES_IN).toBe('1h');
      expect(result.CORS_ORIGIN).toBe('http://localhost:3000');
    });

    it('should throw error for invalid NODE_ENV', () => {
      const invalidEnv = {
        NODE_ENV: 'invalid',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'super-secret-key-min-32-chars-long-12345',
      };

      expect(() => envSchema.parse(invalidEnv)).toThrow();
    });

    it('should throw error for JWT_SECRET too short', () => {
      const invalidEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'short',
      };

      expect(() => envSchema.parse(invalidEnv)).toThrow();
    });

    it('should convert PORT to number', () => {
      const env = {
        PORT: '8080',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'super-secret-key-min-32-chars-long-12345',
      };

      const result = envSchema.parse(env);
      expect(result.PORT).toBe(8080);
      expect(typeof result.PORT).toBe('number');
    });
  });

  describe('databaseConfig', () => {
    it('should have correct structure', () => {
      expect(databaseConfig).toHaveProperty('url');
      expect(databaseConfig).toHaveProperty('pool');
      expect(databaseConfig.pool).toHaveProperty('min');
      expect(databaseConfig.pool).toHaveProperty('max');
    });

    it('should have default values', () => {
      expect(databaseConfig.url).toBe('postgresql://postgres:postgres@localhost:5432/atendechat');
      expect(databaseConfig.pool.min).toBe(2);
      expect(databaseConfig.pool.max).toBe(10);
    });
  });

  describe('redisConfig', () => {
    it('should have correct structure', () => {
      expect(redisConfig).toHaveProperty('url');
      expect(redisConfig).toHaveProperty('retryDelayOnFailover');
      expect(redisConfig).toHaveProperty('maxRetriesPerRequest');
    });

    it('should have default values', () => {
      expect(redisConfig.url).toBe('redis://localhost:6379');
      expect(redisConfig.retryDelayOnFailover).toBe(100);
      expect(redisConfig.maxRetriesPerRequest).toBe(3);
    });
  });

  describe('jwtConfig', () => {
    it('should have correct structure', () => {
      expect(jwtConfig).toHaveProperty('secret');
      expect(jwtConfig).toHaveProperty('expiresIn');
      expect(jwtConfig).toHaveProperty('refreshExpiresIn');
    });

    it('should have default values', () => {
      expect(jwtConfig.secret).toBe('your-super-secret-jwt-key-min-32-chars-long');
      expect(jwtConfig.expiresIn).toBe('1h');
      expect(jwtConfig.refreshExpiresIn).toBe('7d');
    });
  });

  describe('uploadConfig', () => {
    it('should have correct structure', () => {
      expect(uploadConfig).toHaveProperty('maxFileSize');
      expect(uploadConfig).toHaveProperty('allowedMimeTypes');
      expect(uploadConfig).toHaveProperty('uploadDir');
    });

    it('should have correct values', () => {
      expect(uploadConfig.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
      expect(uploadConfig.uploadDir).toBe('uploads');
      expect(Array.isArray(uploadConfig.allowedMimeTypes)).toBe(true);
    });

    it('should include common MIME types', () => {
      expect(uploadConfig.allowedMimeTypes).toContain('image/jpeg');
      expect(uploadConfig.allowedMimeTypes).toContain('image/png');
      expect(uploadConfig.allowedMimeTypes).toContain('application/pdf');
      expect(uploadConfig.allowedMimeTypes).toContain('text/plain');
    });
  });

  describe('rateLimitConfig', () => {
    it('should have correct structure', () => {
      expect(rateLimitConfig).toHaveProperty('windowMs');
      expect(rateLimitConfig).toHaveProperty('max');
      expect(rateLimitConfig).toHaveProperty('message');
    });

    it('should have correct values', () => {
      expect(rateLimitConfig.windowMs).toBe(15 * 60 * 1000); // 15 minutos
      expect(rateLimitConfig.max).toBe(100);
      expect(rateLimitConfig.message).toContain('Muitas requisições');
    });
  });

  describe('loggingConfig', () => {
    it('should have correct structure', () => {
      expect(loggingConfig).toHaveProperty('level');
      expect(loggingConfig).toHaveProperty('pretty');
    });

    it('should have default values', () => {
      expect(loggingConfig.level).toBe('info');
      expect(typeof loggingConfig.pretty).toBe('boolean');
    });
  });
});
