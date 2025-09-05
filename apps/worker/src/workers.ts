import { Worker } from 'bullmq'
import { config } from '@chatbot/config'
import { logger } from './logger'
import { QueueConfig } from './queues'

export async function startWorkers(queues: QueueConfig[]): Promise<void> {
  const workers: Worker[] = []
  
  try {
    // Worker para processamento de mensagens
    const messageWorker = new Worker(
      'messages',
      async (job) => {
        logger.info(`Processando job de mensagem ${job.id}`)
        
        const { messageId, channelId, content } = job.data
        
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        logger.info(`Mensagem ${messageId} processada com sucesso`)
        
        return { success: true, messageId }
      },
      {
        connection: config.redis.url,
        concurrency: 5,
      }
    )
    
    messageWorker.on('completed', (job) => {
      logger.info(`Job ${job.id} completado com sucesso`)
    })
    
    messageWorker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} falhou:`, err)
    })
    
    workers.push(messageWorker)
    
    // Worker para processamento de uploads
    const uploadWorker = new Worker(
      'uploads',
      async (job) => {
        logger.info(`Processando job de upload ${job.id}`)
        
        const { fileId, fileName, fileType } = job.data
        
        // Simular processamento de arquivo
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        logger.info(`Upload ${fileId} processado com sucesso`)
        
        return { success: true, fileId, processedAt: new Date() }
      },
      {
        connection: config.redis.url,
        concurrency: 3,
      }
    )
    
    uploadWorker.on('completed', (job) => {
      logger.info(`Job de upload ${job.id} completado com sucesso`)
    })
    
    uploadWorker.on('failed', (job, err) => {
      logger.error(`Job de upload ${job?.id} falhou:`, err)
    })
    
    workers.push(uploadWorker)
    
    // Worker para sincronização de canais
    const channelSyncWorker = new Worker(
      'channel-sync',
      async (job) => {
        logger.info(`Processando job de sincronização ${job.id}`)
        
        const { channelId, provider } = job.data
        
        // Simular sincronização
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        logger.info(`Canal ${channelId} sincronizado com sucesso`)
        
        return { success: true, channelId, syncedAt: new Date() }
      },
      {
        connection: config.redis.url,
        concurrency: 2,
      }
    )
    
    channelSyncWorker.on('completed', (job) => {
      logger.info(`Job de sincronização ${job.id} completado com sucesso`)
    })
    
    channelSyncWorker.on('failed', (job, err) => {
      logger.error(`Job de sincronização ${job?.id} falhou:`, err)
    })
    
    workers.push(channelSyncWorker)
    
    logger.info(`Iniciados ${workers.length} workers`)
    
    // Graceful shutdown para workers
    process.on('SIGTERM', async () => {
      logger.info('Encerrando workers...')
      await Promise.all(workers.map(worker => worker.close()))
    })
    
    process.on('SIGINT', async () => {
      logger.info('Encerrando workers...')
      await Promise.all(workers.map(worker => worker.close()))
    })
    
  } catch (error) {
    logger.error('Erro ao iniciar workers:', error)
    throw error
  }
}
