import React from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

class NotificationService {
  private listeners: ((notification: Notification) => void)[] = []
  private counter = 0

  subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notify(notification: Notification) {
    this.listeners.forEach(listener => listener(notification))
  }

  success(title: string, message?: string, duration = 5000) {
    const notification: Notification = {
      id: `success-${++this.counter}`,
      type: 'success',
      title,
      message: message || title,
      duration,
    }
    this.notify(notification)
  }

  error(title: string, message?: string, duration = 8000) {
    const notification: Notification = {
      id: `error-${++this.counter}`,
      type: 'error',
      title,
      message: message || title,
      duration,
    }
    this.notify(notification)
  }

  warning(title: string, message?: string, duration = 6000) {
    const notification: Notification = {
      id: `warning-${++this.counter}`,
      type: 'warning',
      title,
      message: message || title,
      duration,
    }
    this.notify(notification)
  }

  info(title: string, message?: string, duration = 4000) {
    const notification: Notification = {
      id: `info-${++this.counter}`,
      type: 'info',
      title,
      message: message || title,
      duration,
    }
    this.notify(notification)
  }

  // Métodos específicos para operações comuns
  apiSuccess(operation: string) {
    this.success(`${operation} realizado com sucesso!`)
  }

  apiError(operation: string, error?: string) {
    this.error(`Erro ao ${operation}`, error || 'Tente novamente mais tarde')
  }

  connectionSuccess() {
    this.success('Conectado com sucesso!')
  }

  connectionError(error?: string) {
    this.error('Erro de conexão', error || 'Verifique sua conexão com a internet')
  }

  saveSuccess() {
    this.success('Dados salvos com sucesso!')
  }

  saveError(error?: string) {
    this.error('Erro ao salvar', error || 'Verifique os dados e tente novamente')
  }

  deleteSuccess() {
    this.success('Item excluído com sucesso!')
  }

  deleteError(error?: string) {
    this.error('Erro ao excluir', error || 'Tente novamente mais tarde')
  }
}

export const notificationService = new NotificationService()

// Hook para usar notificações em componentes React
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  React.useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [...prev, notification])

      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id))
        }, notification.duration)
      }
    })

    return unsubscribe
  }, [])

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = React.useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    removeNotification,
    clearAll,
  }
}
