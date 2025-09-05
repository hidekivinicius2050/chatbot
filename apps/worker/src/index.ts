import { config } from '@chatbot/config'
import { logger } from './logger'
import { createQueues } from './queues'
import { startWorkers } from './workers'

async function main() {
  try {
    logger.info('Iniciando ChatBot Worker...')
    
    // Configurar filas
    const queues = await createQueues()
    logger.info('Filas configuradas com sucesso')
    
    // Iniciar workers
    await startWorkers(queues)
    logger.info('Workers iniciados com sucesso')
    
    logger.info('Worker ChatBot rodando!')
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('Recebido SIGTERM, encerrando workers...')
      await Promise.all(queues.map(queue => queue.close()))
      process.exit(0)
    })
    
    process.on('SIGINT', async () => {
      logger.info('Recebido SIGINT, encerrando workers...')
      await Promise.all(queues.map(queue => queue.close()))
      process.exit(0)
    })
    
  } catch (error) {
    logger.error('Erro ao iniciar worker:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  logger.error('Erro fatal no worker:', error)
  process.exit(1)
})
