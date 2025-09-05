import axios from 'axios'
import { config, currentEnvConfig } from '@/config/env'

const API_BASE_URL = config.apiUrl

// Configuração base do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: currentEnvConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Cache simples para APIs
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para cache
const getCachedData = (key: string) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Tipos para as APIs
export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: User
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface Campaign {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  type: 'support' | 'sales' | 'marketing'
  targetAudience: string[]
  startDate: string
  endDate?: string
  budget?: number
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
  }
}

export interface Channel {
  id: string
  name: string
  type: 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'sms'
  status: 'connected' | 'disconnected' | 'pending'
  phoneNumber?: string
  businessName?: string
  email?: string
  apiKey?: string
  webhookUrl?: string
  qrCode?: string
  lastActivity?: string
  config?: {
    phoneNumber?: string
    businessName?: string
    email?: string
    apiKey?: string
    webhookUrl?: string
  }
}

export interface Flow {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused'
  type: 'support' | 'sales' | 'appointment' | 'marketing'
  steps: FlowStep[]
  triggers: string[]
  metrics: {
    contacts: number
    conversion: number
    avgSteps: number
  }
  createdAt: string
  updatedAt: string
}

export interface FlowStep {
  id: string
  type: 'message' | 'condition' | 'delay' | 'action'
  content: any
  position: { x: number; y: number }
  connections: string[]
}

export interface MessageTemplate {
  id: string
  name: string
  content: string
  category: string
  variables: string[]
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  sender: 'user' | 'agent'
  content: string
  type: 'text' | 'image' | 'file' | 'location'
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  metadata?: any
}

export interface Conversation {
  id: string
  customerName: string
  customerPhone: string
  customerAvatar?: string
  lastMessage?: string
  lastMessageAt?: string
  status: 'active' | 'resolved' | 'pending'
  priority: 'high' | 'medium' | 'normal'
  unreadCount: number
  channel: string
  assignedTo?: { name: string; email: string }
  createdAt: string
  updatedAt: string
  tags: string[]
  category: string
}

export interface AIConfig {
  openai: {
    apiKey: string
    model: string
    temperature: number
    systemPrompt: string
  }
  whatsapp: {
    phoneNumber: string
    businessName: string
    webhookUrl: string
    autoReply: boolean
    aiEnabled: boolean
  }
}

// Serviços de API
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

export const ticketsService = {
  getAll: async (): Promise<Ticket[]> => {
    const response = await api.get('/tickets')
    return response.data.data || response.data
  },

  getById: async (id: string): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
  },

  create: async (ticket: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.post('/tickets', ticket)
    return response.data
  },

  update: async (id: string, ticket: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.patch(`/tickets/${id}`, ticket)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tickets/${id}`)
  },
}

export const campaignsService = {
  getAll: async (): Promise<Campaign[]> => {
    try {
      const response = await api.get('/campaigns')
      // O backend retorna { campaigns: [...] }, então extraímos o array
      const campaigns = response.data.campaigns || response.data
      
      // Mapear os dados do backend para o formato esperado pelo frontend
      return campaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        type: campaign.type,
        targetAudience: campaign.targetAudience || [],
        startDate: campaign.createdAt,
        endDate: campaign.completedAt,
        budget: campaign.budget || 0,
        metrics: {
          sent: campaign.sentCount || 0,
          delivered: campaign.sentCount || 0,
          opened: 0,
          clicked: 0,
          converted: 0
        }
      }))
    } catch (error) {
      console.warn('API não disponível, retornando dados mock:', error)
      // Retornar dados mock quando a API não estiver disponível
      return [
        {
          id: 'campaign-1',
          name: 'Campanha de Boas-vindas',
          description: 'Campanha para novos usuários',
          status: 'active' as const,
          type: 'marketing' as const,
          targetAudience: ['novos-usuarios'],
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          budget: 5000,
          metrics: {
            sent: 150,
            delivered: 145,
            opened: 120,
            clicked: 45,
            converted: 12
          }
        },
        {
          id: 'campaign-2',
          name: 'Suporte Técnico',
          description: 'Campanha de suporte para clientes',
          status: 'paused' as const,
          type: 'support' as const,
          targetAudience: ['clientes-ativos'],
          startDate: '2024-02-01',
          endDate: '2024-11-30',
          budget: 3000,
          metrics: {
            sent: 200,
            delivered: 195,
            opened: 180,
            clicked: 60,
            converted: 25
          }
        }
      ]
    }
  },

  getById: async (id: string): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  },

  create: async (campaign: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.post('/campaigns', campaign)
    return response.data
  },

  update: async (id: string, campaign: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.patch(`/campaigns/${id}`, campaign)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`)
  },

  start: async (id: string): Promise<void> => {
    await api.post(`/campaigns/${id}/start`)
  },

  pause: async (id: string): Promise<void> => {
    await api.post(`/campaigns/${id}/pause`)
  },

  getStats: async (id: string) => {
    const response = await api.get(`/campaigns/${id}/stats`)
    return response.data
  },
}

export const channelsService = {
  getAll: async (): Promise<Channel[]> => {
    const cacheKey = 'channels:all'
    const cached = getCachedData(cacheKey)
    if (cached) return cached
    
    const response = await api.get('/channels')
    const data = response.data.items || []
    setCachedData(cacheKey, data)
    return data
  },

  getById: async (id: string): Promise<Channel> => {
    const response = await api.get(`/channels/${id}`)
    return response.data
  },

  create: async (channel: Partial<Channel>): Promise<Channel> => {
    const response = await api.post('/channels', channel)
    return response.data
  },

  update: async (id: string, channel: Partial<Channel>): Promise<Channel> => {
    const response = await api.patch(`/channels/${id}`, channel)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/channels/${id}`)
  },

  getQRCode: async (id: string): Promise<{ qrCode: string }> => {
    const response = await api.get(`/channels/${id}/qrcode`)
    return response.data
  },

  connect: async (id: string): Promise<void> => {
    await api.post(`/channels/${id}/connect`)
  },

  getStatus: async (id: string): Promise<{ status: string }> => {
    const response = await api.get(`/channels/${id}/status`)
    return response.data
  },

  getStats: async (id: string): Promise<{
    channelId: string
    totalMessages: number
    sentMessages: number
    receivedMessages: number
    uniqueContacts: number
    avgResponseTime: string
    uptime: string
    lastActivity: string | null
    period: {
      start: string
      end: string
    }
    dailyStats: Array<{
      date: string
      messages: number
    }>
  }> => {
    const response = await api.get(`/channels/${id}/stats`)
    return response.data
  },
}

export const flowsService = {
  getAll: async (): Promise<Flow[]> => {
    const response = await api.get('/flows')
    return response.data
  },

  getById: async (id: string): Promise<Flow> => {
    const response = await api.get(`/flows/${id}`)
    return response.data
  },

  create: async (flow: Partial<Flow>): Promise<Flow> => {
    const response = await api.post('/flows', flow)
    return response.data
  },

  update: async (id: string, flow: Partial<Flow>): Promise<Flow> => {
    const response = await api.patch(`/flows/${id}`, flow)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/flows/${id}`)
  },

  activate: async (id: string): Promise<void> => {
    await api.post(`/flows/${id}/activate`)
  },

  pause: async (id: string): Promise<void> => {
    await api.post(`/flows/${id}/pause`)
  },

  duplicate: async (id: string): Promise<Flow> => {
    const response = await api.post(`/flows/${id}/duplicate`)
    return response.data
  },
}

export const templatesService = {
  getAll: async (): Promise<MessageTemplate[]> => {
    try {
      const response = await api.get('/templates')
      return response.data
    } catch (error) {
      console.warn('API de templates não disponível, retornando dados mock:', error)
      // Retornar dados mock quando a API não estiver disponível
      return [
        {
          id: 'template-1',
          name: 'Boas-vindas',
          content: 'Olá! Bem-vindo à nossa empresa. Como podemos ajudá-lo hoje?',
          category: 'welcome',
          tags: ['boas-vindas', 'inicial'],
          variables: ['nome', 'empresa'],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'template-2',
          name: 'Horário de Funcionamento',
          content: 'Nosso horário de funcionamento é de segunda a sexta, das 9h às 18h. Estamos aqui para ajudar!',
          category: 'business-hours',
          tags: ['horário', 'funcionamento'],
          variables: [],
          isActive: true,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 'template-3',
          name: 'Promoção Especial',
          content: '🎉 Oferta especial para você! Aproveite nosso desconto de 20% em todos os produtos. Válido até o final do mês!',
          category: 'sales',
          tags: ['promoção', 'desconto', 'vendas'],
          variables: ['desconto', 'validade'],
          isActive: true,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z'
        },
        {
          id: 'template-4',
          name: 'Agradecimento',
          content: 'Muito obrigado pelo seu contato! Sua mensagem é muito importante para nós. Retornaremos em breve.',
          category: 'gratitude',
          tags: ['agradecimento', 'contato'],
          variables: [],
          isActive: true,
          createdAt: '2024-01-04T00:00:00Z',
          updatedAt: '2024-01-04T00:00:00Z'
        },
        {
          id: 'template-5',
          name: 'Suporte Técnico',
          content: 'Entendemos sua dificuldade. Nossa equipe técnica está trabalhando para resolver seu problema. Em breve você receberá uma atualização.',
          category: 'support',
          tags: ['suporte', 'técnico', 'problema'],
          variables: ['problema', 'prazo'],
          isActive: true,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        }
      ]
    }
  },

  getById: async (id: string): Promise<MessageTemplate> => {
    const response = await api.get(`/templates/${id}`)
    return response.data
  },

  create: async (template: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    const response = await api.post('/templates', template)
    return response.data
  },

  update: async (id: string, template: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    const response = await api.patch(`/templates/${id}`, template)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`)
  },

  toggleActive: async (id: string): Promise<void> => {
    await api.patch(`/templates/${id}/toggle`)
  },
}

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chat/conversations')
    return response.data.data || response.data
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`)
    return response.data
  },

  sendMessage: async (conversationId: string, message: Partial<ChatMessage>): Promise<ChatMessage> => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, message)
    return response.data
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/chat/conversations/${conversationId}/read`)
  },

  resolveConversation: async (conversationId: string): Promise<void> => {
    await api.patch(`/chat/conversations/${conversationId}/resolve`)
  },

  archiveConversation: async (conversationId: string): Promise<void> => {
    await api.patch(`/chat/conversations/${conversationId}/archive`)
  },
}

export const aiConfigService = {
  get: async (): Promise<AIConfig> => {
    const cacheKey = 'ai-config:get'
    const cached = getCachedData(cacheKey)
    if (cached) return cached
    
    const response = await api.get('/ai-config')
    setCachedData(cacheKey, response.data)
    return response.data
  },

  update: async (config: any): Promise<AIConfig> => {
    const response = await api.post('/ai-config', config)
    return response.data
  },

  test: async (message: string) => {
    const response = await api.post('/ai-config/test', { message })
    return response.data
  },
}

export const messagingService = {
  send: async (data: {
    channelId: string
    to: string
    message: string
    type?: 'text' | 'image' | 'file'
    metadata?: any
  }) => {
    const response = await api.post('/messaging/send', data)
    return response.data
  },

  sendBulk: async (data: {
    channelId: string
    recipients: string[]
    message: string
    type?: 'text' | 'image' | 'file'
    metadata?: any
  }) => {
    const response = await api.post('/messaging/send-bulk', data)
    return response.data
  },
}

export default api
