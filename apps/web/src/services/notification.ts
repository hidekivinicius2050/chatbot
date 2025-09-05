// Serviço de notificações simples
export const notificationService = {
  success: (title: string, message?: string) => {
    const fullMessage = `${title}${message ? `: ${message}` : ''}`
    console.log(`✅ ${fullMessage}`)
    
    // Mostrar notificação visual simples
    if (typeof window !== 'undefined') {
      // Criar elemento de notificação
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
      `
      notification.textContent = fullMessage
      
      document.body.appendChild(notification)
      
      // Remover após 3 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 3000)
    }
  },

  error: (title: string, message?: string) => {
    const fullMessage = `${title}${message ? `: ${message}` : ''}`
    console.error(`❌ ${fullMessage}`)
    
    // Mostrar notificação visual simples
    if (typeof window !== 'undefined') {
      // Criar elemento de notificação
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
      `
      notification.textContent = fullMessage
      
      document.body.appendChild(notification)
      
      // Remover após 5 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 5000)
    }
  },

  warning: (title: string, message?: string) => {
    const fullMessage = `${title}${message ? `: ${message}` : ''}`
    console.warn(`⚠️ ${fullMessage}`)
    
    // Mostrar notificação visual simples
    if (typeof window !== 'undefined') {
      // Criar elemento de notificação
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
      `
      notification.textContent = fullMessage
      
      document.body.appendChild(notification)
      
      // Remover após 4 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 4000)
    }
  },

  info: (title: string, message?: string) => {
    const fullMessage = `${title}${message ? `: ${message}` : ''}`
    console.info(`ℹ️ ${fullMessage}`)
    
    // Mostrar notificação visual simples
    if (typeof window !== 'undefined') {
      // Criar elemento de notificação
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
      `
      notification.textContent = fullMessage
      
      document.body.appendChild(notification)
      
      // Remover após 3 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 3000)
    }
  }
}
