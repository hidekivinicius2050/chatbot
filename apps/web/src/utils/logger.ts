// Sistema de logs para o frontend

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  data?: any
  source?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private currentLevel = LogLevel.INFO

  constructor() {
    // Em produção, enviar logs para servidor
    if (process.env.NODE_ENV === 'production') {
      this.setupProductionLogging()
    }
  }

  private setupProductionLogging() {
    // Enviar logs para servidor a cada 30 segundos
    setInterval(() => {
      this.flushLogs()
    }, 30000)

    // Enviar logs quando a página for fechada
    window.addEventListener('beforeunload', () => {
      this.flushLogs()
    })
  }

  private addLog(level: LogLevel, message: string, data?: any, source?: string) {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      source
    }

    this.logs.push(logEntry)

    // Manter apenas os últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR']
      const levelName = levelNames[level]
      const prefix = `[${levelName}] ${source ? `[${source}]` : ''}`
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data)
          break
        case LogLevel.INFO:
          console.info(prefix, message, data)
          break
        case LogLevel.WARN:
          console.warn(prefix, message, data)
          break
        case LogLevel.ERROR:
          console.error(prefix, message, data)
          break
      }
    }
  }

  public debug(message: string, data?: any, source?: string) {
    if (this.currentLevel <= LogLevel.DEBUG) {
      this.addLog(LogLevel.DEBUG, message, data, source)
    }
  }

  public info(message: string, data?: any, source?: string) {
    if (this.currentLevel <= LogLevel.INFO) {
      this.addLog(LogLevel.INFO, message, data, source)
    }
  }

  public warn(message: string, data?: any, source?: string) {
    if (this.currentLevel <= LogLevel.WARN) {
      this.addLog(LogLevel.WARN, message, data, source)
    }
  }

  public error(message: string, data?: any, source?: string) {
    if (this.currentLevel <= LogLevel.ERROR) {
      this.addLog(LogLevel.ERROR, message, data, source)
    }
  }

  public setLevel(level: LogLevel) {
    this.currentLevel = level
  }

  public getLogs(): LogEntry[] {
    return [...this.logs]
  }

  public clearLogs() {
    this.logs = []
  }

  private async flushLogs() {
    if (this.logs.length === 0) return

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logs: this.logs
        })
      })
      
      this.clearLogs()
    } catch (error) {
      console.error('Erro ao enviar logs:', error)
    }
  }
}

// Instância global
export const logger = new Logger()

// Hook para usar logger
export function useLogger(source?: string) {
  return {
    debug: (message: string, data?: any) => logger.debug(message, data, source),
    info: (message: string, data?: any) => logger.info(message, data, source),
    warn: (message: string, data?: any) => logger.warn(message, data, source),
    error: (message: string, data?: any) => logger.error(message, data, source)
  }
}
