import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { config } from '@/config/env'

interface UseSocketIOOptions {
  namespace?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export function useSocketIO({
  namespace = '',
  onConnect,
  onDisconnect,
  onError,
}: UseSocketIOOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return
    }

    const socketUrl = namespace 
      ? `${config.wsUrl}/${namespace}` 
      : config.wsUrl

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setSocket(newSocket)
      onConnect?.()
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      setSocket(null)
      onDisconnect?.()
    })

    newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão Socket.IO:', error)
      onError?.(error)
    })

    socketRef.current = newSocket
  }, [namespace, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setSocket(null)
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket.IO não está conectado')
    }
  }, [])

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }, [])

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    socket,
    emit,
    on,
    off,
    connect,
    disconnect,
  }
}

// Hook específico para chat com Socket.IO
export function useChatSocketIO(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [typing, setTyping] = useState<{ [key: string]: boolean }>({})

  const { isConnected, emit, on, off } = useSocketIO({
    namespace: 'chat',
    onConnect: () => {
      if (conversationId) {
        emit('join-conversation', { conversationId })
      }
    },
  })

  useEffect(() => {
    if (conversationId && isConnected) {
      emit('join-conversation', { conversationId })
    }
  }, [conversationId, isConnected, emit])

  useEffect(() => {
    const handleNewMessage = (data: any) => {
      setMessages(prev => [...prev, data.message])
    }

    const handleUserTyping = (data: any) => {
      setTyping(prev => ({ ...prev, [data.userId]: data.isTyping }))
    }

    const handleJoinedConversation = (data: any) => {
      console.log('Entrou na conversa:', data)
    }

    const handleLeftConversation = (data: any) => {
      console.log('Saiu da conversa:', data)
    }

    on('new_message', handleNewMessage)
    on('user_typing', handleUserTyping)
    on('joined_conversation', handleJoinedConversation)
    on('left_conversation', handleLeftConversation)

    return () => {
      off('new_message', handleNewMessage)
      off('user_typing', handleUserTyping)
      off('joined_conversation', handleJoinedConversation)
      off('left_conversation', handleLeftConversation)
    }
  }, [on, off])

  const sendMessage = useCallback((messageData: any) => {
    emit('chat_message', {
      conversationId,
      ...messageData,
    })
  }, [emit, conversationId])

  const sendTyping = useCallback((isTyping: boolean) => {
    emit('typing', {
      conversationId,
      isTyping,
    })
  }, [emit, conversationId])

  const joinConversation = useCallback((convId: string) => {
    emit('join-conversation', { conversationId: convId })
  }, [emit])

  const leaveConversation = useCallback((convId: string) => {
    emit('leave-conversation', { conversationId: convId })
  }, [emit])

  return {
    isConnected,
    messages,
    typing,
    sendMessage,
    sendTyping,
    joinConversation,
    leaveConversation,
  }
}
