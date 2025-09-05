import { config } from '@/config/env'

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private config: WebSocketConfig
  private isConnecting = false

  constructor(config: WebSocketConfig) {
    this.config = config
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'))
        return
      }

      this.isConnecting = true

      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.config.onConnect?.()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.config.onMessage?.(message)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnecting = false
          this.config.onDisconnect?.()
          
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          this.config.onError?.(error)
          reject(error)
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(console.error)
    }, delay)
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getReadyState(): number | null {
    return this.ws?.readyState ?? null
  }
}

// Instância global do WebSocket
export const globalWebSocket = new WebSocketService({
  url: config.wsUrl,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  onConnect: () => {
    console.log('Global WebSocket connected')
  },
  onDisconnect: () => {
    console.log('Global WebSocket disconnected')
  },
  onError: (error) => {
    console.error('Global WebSocket error:', error)
  },
})

import React from 'react'

// Hook para usar WebSocket em componentes React
export function useWebSocket(config: Partial<WebSocketConfig> = {}) {
  const [isConnected, setIsConnected] = React.useState(false)
  const [lastMessage, setLastMessage] = React.useState<WebSocketMessage | null>(null)
  const wsRef = React.useRef<WebSocketService | null>(null)

  React.useEffect(() => {
    const ws = new WebSocketService({
      url: config.url || config.wsUrl || 'ws://localhost:8080',
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      onMessage: (message) => {
        setLastMessage(message)
        config.onMessage?.(message)
      },
      onConnect: () => {
        setIsConnected(true)
        config.onConnect?.()
      },
      onDisconnect: () => {
        setIsConnected(false)
        config.onDisconnect?.()
      },
      onError: config.onError,
    })

    wsRef.current = ws

    ws.connect().catch(console.error)

    return () => {
      ws.disconnect()
    }
  }, [config.url, config.wsUrl])

  const sendMessage = React.useCallback((message: WebSocketMessage) => {
    wsRef.current?.send(message)
  }, [])

  const disconnect = React.useCallback(() => {
    wsRef.current?.disconnect()
  }, [])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
  }
}
