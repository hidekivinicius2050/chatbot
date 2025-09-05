// Utilitários para testes de conectividade
import React from 'react'
import { shouldSkipConnectivityCheck } from '@/config/environment'

export interface ConnectivityStatus {
  isOnline: boolean
  lastCheck: Date
  responseTime?: number
  error?: string
}

class ConnectivityManager {
  private status: ConnectivityStatus = {
    isOnline: false,
    lastCheck: new Date()
  }

  private listeners: ((status: ConnectivityStatus) => void)[] = []

  constructor() {
    this.startMonitoring()
  }

  private async checkConnectivity(): Promise<ConnectivityStatus> {
    const startTime = Date.now()
    
    // Pular verificação de conectividade em ambiente local
    if (shouldSkipConnectivityCheck()) {
      const status: ConnectivityStatus = {
        isOnline: true,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime
      }
      
      this.status = status
      this.notifyListeners()
      
      return status
    }
    
    try {
      // Teste básico de conectividade
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      const responseTime = Date.now() - startTime
      
      const status: ConnectivityStatus = {
        isOnline: response.ok,
        lastCheck: new Date(),
        responseTime
      }
      
      this.status = status
      this.notifyListeners()
      
      return status
    } catch (error) {
      const status: ConnectivityStatus = {
        isOnline: false,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
      
      this.status = status
      this.notifyListeners()
      
      return status
    }
  }

  private startMonitoring() {
    // Verificar conectividade a cada 30 segundos
    setInterval(() => {
      this.checkConnectivity()
    }, 30000)

    // Verificar conectividade quando a página ganha foco
    window.addEventListener('focus', () => {
      this.checkConnectivity()
    })

    // Verificar conectividade quando volta online
    window.addEventListener('online', () => {
      this.checkConnectivity()
    })

    // Verificar conectividade quando fica offline
    window.addEventListener('offline', () => {
      this.status = {
        isOnline: false,
        lastCheck: new Date(),
        error: 'Conexão perdida'
      }
      this.notifyListeners()
    })

    // Verificação inicial
    this.checkConnectivity()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.status))
  }

  public getStatus(): ConnectivityStatus {
    return { ...this.status }
  }

  public subscribe(listener: (status: ConnectivityStatus) => void): () => void {
    this.listeners.push(listener)
    
    // Retorna função para cancelar a inscrição
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public async testApiEndpoint(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: 'HEAD',
        cache: 'no-cache'
      })
      return response.ok
    } catch {
      return false
    }
  }

  public async testBackendConnectivity(): Promise<boolean> {
    return this.testApiEndpoint('/api/health')
  }
}

// Instância global
export const connectivityManager = new ConnectivityManager()

// Hook para usar conectividade
export function useConnectivity() {
  const [status, setStatus] = React.useState<ConnectivityStatus>(
    connectivityManager.getStatus()
  )

  React.useEffect(() => {
    const unsubscribe = connectivityManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  return status
}

// Hook para testar conectividade manualmente
export function useConnectivityTest() {
  const [isTesting, setIsTesting] = React.useState(false)
  const [lastTest, setLastTest] = React.useState<ConnectivityStatus | null>(null)

  const testConnectivity = async () => {
    setIsTesting(true)
    try {
      const status = await connectivityManager.checkConnectivity()
      setLastTest(status)
      return status
    } finally {
      setIsTesting(false)
    }
  }

  return {
    isTesting,
    lastTest,
    testConnectivity
  }
}
