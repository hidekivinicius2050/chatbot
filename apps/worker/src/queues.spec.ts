import { createQueues } from './queues'

// Mock BullMQ
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
}))

// Mock config
jest.mock('@atendechat/config', () => ({
  config: {
    redis: {
      host: 'localhost',
      port: 6379,
      password: '',
    },
  },
}))

// Mock logger
jest.mock('./logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Queues', () => {
  it('should create all required queues', async () => {
    const queues = await createQueues()
    
    expect(queues).toHaveLength(3)
    expect(queues.map(q => q.name)).toEqual(['messages', 'uploads', 'channel-sync'])
  })
})
