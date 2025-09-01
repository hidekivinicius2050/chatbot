module.exports = {
  projects: [
    {
      displayName: 'API',
      testMatch: ['<rootDir>/apps/api/**/*.spec.ts'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/api/src/$1',
        '^@atendechat/core$': '<rootDir>/packages/core/src',
        '^@atendechat/providers$': '<rootDir>/packages/providers/src',
        '^@atendechat/config$': '<rootDir>/packages/config/src',
      },
      collectCoverageFrom: [
        'apps/api/src/**/*.(t|j)s',
        '!apps/api/src/**/*.module.ts',
        '!apps/api/src/main.ts',
      ],
      coverageDirectory: '<rootDir>/coverage/api',
    },
    {
      displayName: 'Web',
      testMatch: ['<rootDir>/apps/web/**/*.spec.ts', '<rootDir>/apps/web/**/*.test.tsx'],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/web/src/$1',
        '^@atendechat/core$': '<rootDir>/packages/core/src',
        '^@atendechat/config$': '<rootDir>/packages/config/src',
      },
      collectCoverageFrom: [
        'apps/web/src/**/*.(t|j)sx?',
        '!apps/web/src/**/*.d.ts',
        '!apps/web/src/app/layout.tsx',
        '!apps/web/src/app/page.tsx',
      ],
      coverageDirectory: '<rootDir>/coverage/web',
    },
    {
      displayName: 'Worker',
      testMatch: ['<rootDir>/apps/worker/**/*.spec.ts'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@atendechat/core$': '<rootDir>/packages/core/src',
        '^@atendechat/config$': '<rootDir>/packages/config/src',
        '^@atendechat/providers$': '<rootDir>/packages/providers/src',
      },
      collectCoverageFrom: [
        'apps/worker/src/**/*.(t|j)s',
        '!apps/worker/src/**/*.d.ts',
        '!apps/worker/src/index.ts',
      ],
      coverageDirectory: '<rootDir>/coverage/worker',
    },
    {
      displayName: 'Core',
      testMatch: ['<rootDir>/packages/core/**/*.spec.ts'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'packages/core/src/**/*.(t|j)s',
      ],
      coverageDirectory: '<rootDir>/coverage/core',
    },
    {
      displayName: 'Providers',
      testMatch: ['<rootDir>/packages/providers/**/*.spec.ts'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@atendechat/core$': '<rootDir>/packages/core/src',
      },
      collectCoverageFrom: [
        'packages/providers/src/**/*.(t|j)s',
      ],
      coverageDirectory: '<rootDir>/coverage/providers',
    },
    {
      displayName: 'Config',
      testMatch: ['<rootDir>/packages/config/**/*.spec.ts'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'packages/config/src/**/*.(t|j)s',
      ],
      coverageDirectory: '<rootDir>/coverage/config',
    },
  ],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
};

