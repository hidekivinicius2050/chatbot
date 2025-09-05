import axios from 'axios'
import { config } from '@/config/env'

// Configuração do N8N
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678'
const N8N_API_KEY = process.env.NEXT_PUBLIC_N8N_API_KEY || ''

// Cliente N8N - usando o backend local para simulação
const n8nClient = axios.create({
  baseURL: 'http://localhost:3001', // Usando nosso backend local
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY,
  },
})

// Tipos para N8N
export interface N8NWorkflow {
  id: string
  name: string
  active: boolean
  nodes: N8NNode[]
  connections: N8NConnection
  settings?: any
  staticData?: any
  createdAt: string
  updatedAt: string
}

export interface N8NNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: any
  credentials?: any
}

export interface N8NConnection {
  [nodeId: string]: {
    [outputIndex: string]: {
      [inputIndex: string]: string[]
    }
  }
}

export interface N8NExecution {
  id: string
  finished: boolean
  mode: string
  startedAt: string
  stoppedAt?: string
  workflowId: string
  data: any
  status: 'running' | 'success' | 'error' | 'cancelled'
}

export interface N8NWebhook {
  id: string
  path: string
  httpMethod: string
  workflowId: string
  nodeId: string
  active: boolean
}

// Serviço N8N
export const n8nService = {
  // Workflows
  getWorkflows: async (): Promise<N8NWorkflow[]> => {
    const response = await n8nClient.get('/api/v1/workflows')
    return response.data.data || []
  },

  getWorkflow: async (id: string): Promise<N8NWorkflow> => {
    const response = await n8nClient.get(`/api/v1/workflows/${id}`)
    return response.data
  },

  createWorkflow: async (workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> => {
    const response = await n8nClient.post('/api/v1/workflows', workflow)
    return response.data
  },

  updateWorkflow: async (id: string, workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> => {
    const response = await n8nClient.put(`/api/v1/workflows/${id}`, workflow)
    return response.data
  },

  deleteWorkflow: async (id: string): Promise<void> => {
    await n8nClient.delete(`/api/v1/workflows/${id}`)
  },

  activateWorkflow: async (id: string): Promise<void> => {
    await n8nClient.post(`/api/v1/workflows/${id}/activate`)
  },

  deactivateWorkflow: async (id: string): Promise<void> => {
    await n8nClient.post(`/api/v1/workflows/${id}/deactivate`)
  },

  // Execuções
  getExecutions: async (workflowId?: string, limit: number = 20): Promise<N8NExecution[]> => {
    const params = new URLSearchParams()
    if (workflowId) params.append('workflowId', workflowId)
    params.append('limit', limit.toString())
    
    const response = await n8nClient.get(`/api/v1/executions?${params}`)
    return response.data.data || []
  },

  getExecution: async (id: string): Promise<N8NExecution> => {
    const response = await n8nClient.get(`/api/v1/executions/${id}`)
    return response.data
  },

  deleteExecution: async (id: string): Promise<void> => {
    await n8nClient.delete(`/api/v1/executions/${id}`)
  },

  // Webhooks
  getWebhooks: async (): Promise<N8NWebhook[]> => {
    const response = await n8nClient.get('/api/v1/webhook-test')
    return response.data.data || []
  },

  // Teste de conectividade
  testConnection: async (): Promise<boolean> => {
    try {
      await n8nClient.get('/api/v1/workflows')
      return true
    } catch (error) {
      return false
    }
  },

  // Executar workflow manualmente
  executeWorkflow: async (id: string, data?: any): Promise<N8NExecution> => {
    const response = await n8nClient.post(`/api/v1/workflows/${id}/execute`, data)
    return response.data
  },

  // Templates de workflows para chatbot
  getChatbotTemplates: async (): Promise<N8NWorkflow[]> => {
    const templates = [
      {
        id: 'chatbot-welcome-flow',
        name: 'Fluxo de Boas-vindas',
        description: 'Fluxo automático de boas-vindas para novos usuários',
        nodes: [
          {
            id: 'webhook',
            name: 'Webhook WhatsApp',
            type: 'n8n-nodes-base.webhook',
            position: [100, 100],
            parameters: {
              httpMethod: 'POST',
              path: 'whatsapp-webhook',
            }
          },
          {
            id: 'condition',
            name: 'Verificar Primeira Mensagem',
            type: 'n8n-nodes-base.if',
            position: [300, 100],
            parameters: {
              conditions: {
                string: [
                  {
                    value1: '={{$json.isFirstMessage}}',
                    operation: 'equal',
                    value2: 'true'
                  }
                ]
              }
            }
          },
          {
            id: 'welcome-message',
            name: 'Mensagem de Boas-vindas',
            type: 'n8n-nodes-base.httpRequest',
            position: [500, 50],
            parameters: {
              method: 'POST',
              url: 'https://graph.facebook.com/v17.0/{{$json.phoneNumberId}}/messages',
              headers: {
                'Authorization': 'Bearer {{$json.accessToken}}',
                'Content-Type': 'application/json'
              },
              body: {
                messaging_product: 'whatsapp',
                to: '{{$json.from}}',
                type: 'text',
                text: {
                  body: 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?'
                }
              }
            }
          }
        ]
      },
      {
        id: 'chatbot-ai-response',
        name: 'Resposta com IA',
        description: 'Fluxo para processar mensagens com IA',
        nodes: [
          {
            id: 'webhook',
            name: 'Webhook WhatsApp',
            type: 'n8n-nodes-base.webhook',
            position: [100, 100],
            parameters: {
              httpMethod: 'POST',
              path: 'whatsapp-ai-webhook',
            }
          },
          {
            id: 'openai',
            name: 'Processar com OpenAI',
            type: 'n8n-nodes-base.openAi',
            position: [300, 100],
            parameters: {
              resource: 'chat',
              operation: 'create',
              model: 'gpt-3.5-turbo',
              messages: {
                values: [
                  {
                    role: 'system',
                    content: 'Você é um assistente virtual para atendimento ao cliente via WhatsApp. Seja prestativo e objetivo.'
                  },
                  {
                    role: 'user',
                    content: '={{$json.message}}'
                  }
                ]
              }
            }
          },
          {
            id: 'send-response',
            name: 'Enviar Resposta',
            type: 'n8n-nodes-base.httpRequest',
            position: [500, 100],
            parameters: {
              method: 'POST',
              url: 'https://graph.facebook.com/v17.0/{{$json.phoneNumberId}}/messages',
              headers: {
                'Authorization': 'Bearer {{$json.accessToken}}',
                'Content-Type': 'application/json'
              },
              body: {
                messaging_product: 'whatsapp',
                to: '{{$json.from}}',
                type: 'text',
                text: {
                  body: '={{$json.choices[0].message.content}}'
                }
              }
            }
          }
        ]
      }
    ]
    
    return templates
  }
}

export default n8nService
