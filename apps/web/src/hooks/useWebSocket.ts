import { useEffect, useRef, useCallback, useState } from 'react'
import { config, currentEnvConfig } from '@/config/env'

interface WebSocketMessage {
  type: string
  data: any
}

interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectInterval = currentEnvConfig.wsReconnectInterval,
  maxReconnectAttempts = currentEnvConfig.maxReconnectAttempts,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setReconnectAttempts(0)
        onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          onMessage?.(message)
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        onClose?.()
        
        // Tentar reconectar se não foi fechado manualmente
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        onError?.(error)
      }
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error)
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts, reconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket não está conectado')
    }
  }, [isConnected])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    sendMessage,
    disconnect,
    connect,
    reconnectAttempts,
  }
}

// Hook específico para chat em tempo real
export function useChatWebSocket(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [typing, setTyping] = useState<{ [key: string]: boolean }>({})

  const onMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_message':
        setMessages(prev => [...prev, message.data])
        break
      
      case 'typing_start':
        setTyping(prev => ({ ...prev, [message.data.userId]: true }))
        break
      
      case 'typing_stop':
        setTyping(prev => ({ ...prev, [message.data.userId]: false }))
        break
      
      case 'message_status':
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.data.messageId 
              ? { ...msg, status: message.data.status }
              : msg
          )
        )
        break
      
      case 'conversation_update':
        // Atualizar informações da conversa
        break
      
      default:
        console.log('Mensagem WebSocket não reconhecida:', message)
    }
  }, [])

  const { isConnected, sendMessage } = useWebSocket({
    url: `${config.wsUrl}/chat${conversationId ? `/${conversationId}` : ''}`,
    onMessage,
  })

  const sendTyping = useCallback((isTyping: boolean) => {
    sendMessage({
      type: isTyping ? 'typing_start' : 'typing_stop',
      data: { conversationId }
    })
  }, [sendMessage, conversationId])

  const sendChatMessage = useCallback((content: string, type: string = 'text') => {
    sendMessage({
      type: 'chat_message',
      data: {
        conversationId,
        content,
        type,
        timestamp: new Date().toISOString(),
      }
    })
  }, [sendMessage, conversationId])

  return {
    isConnected,
    messages,
    typing,
    sendMessage: sendChatMessage,
    sendTyping,
  }
}

// Hook para notificações em tempo real
export function useNotificationsWebSocket() {
  const [notifications, setNotifications] = useState<any[]>([])

  const onMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_notification':
        setNotifications(prev => [message.data, ...prev])
        break
      
      case 'notification_read':
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === message.data.notificationId 
              ? { ...notif, read: true }
              : notif
          )
        )
        break
      
      case 'notification_clear':
        setNotifications([])
        break
      
      default:
        console.log('Notificação WebSocket não reconhecida:', message)
    }
  }, [])

  const { isConnected, sendMessage } = useWebSocket({
    url: `${config.wsUrl}/notifications`,
    onMessage,
  })

  const markAsRead = useCallback((notificationId: string) => {
    sendMessage({
      type: 'mark_read',
      data: { notificationId }
    })
  }, [sendMessage])

  const clearAll = useCallback(() => {
    sendMessage({
      type: 'clear_all',
      data: {}
    })
  }, [sendMessage])

  return {
    isConnected,
    notifications,
    markAsRead,
    clearAll,
  }
}
