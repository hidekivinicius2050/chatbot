import { Queue, Worker, QueueScheduler } from "bullmq";
import { redis } from "./redis";
import { logger } from './logger'

export interface QueueConfig {
  name: string
  queue: Queue
  close: () => Promise<void>
}

export async function createQueues(): Promise<QueueConfig[]> {
  const queues: QueueConfig[] = []
  
  try {
    // Fila para processamento de mensagens
    const messageQueue = new Queue('messages', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    })
    
    queues.push({
      name: 'messages',
      queue: messageQueue,
      close: () => messageQueue.close(),
    })
    
    // Fila para processamento de uploads
    const uploadQueue = new Queue('uploads', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    })
    
    queues.push({
      name: 'uploads',
      queue: uploadQueue,
      close: () => uploadQueue.close(),
    })
    
    // Fila para sincronização de canais
    const channelSyncQueue = new Queue('channel-sync', {
      connection: redis,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 25,
      },
    })
    
    queues.push({
      name: 'channel-sync',
      queue: channelSyncQueue,
      close: () => channelSyncQueue.close(),
    })
    
    // Schedulers ajudam com jobs atrasados/retries
    new QueueScheduler("messages", { connection: redis });
    new QueueScheduler("uploads", { connection: redis });
    
    // Exemplo de worker (mantenha/adeque aos seus handlers)
    new Worker(
      "messages",
      async (job) => {
        // TODO: implementar processamento real
        return { ok: true, at: new Date().toISOString() };
      },
      { connection: redis }
    );
    
    logger.info(`Criadas ${queues.length} filas: ${queues.map(q => q.name).join(', ')}`)
    
  } catch (error) {
    logger.error('Erro ao criar filas:', error)
    throw error
  }
  
  return queues
}
