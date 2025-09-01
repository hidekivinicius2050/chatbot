// Setup de teste para o worker
import { config } from '@atendechat/config'

// Mock das configurações para teste
jest.mock('@atendechat/config', () => ({
  config: {
    redis: {
      host: 'localhost',
      port: 6379,
      password: '',
    },
    logging: {
      level: 'silent',
    },
  },
}))

// Configurações globais de teste
beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.resetAllMocks()
})
