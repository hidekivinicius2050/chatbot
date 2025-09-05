"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { 
  User, 
  Ticket, 
  Campaign, 
  Channel, 
  Flow, 
  MessageTemplate, 
  Conversation,
  AIConfig,
  ticketsService,
  campaignsService,
  channelsService,
  flowsService,
  templatesService,
  chatService,
  aiConfigService
} from '@/services/api'
import { notificationService } from '@/services/notifications'

// Tipos para o estado
interface AppState {
  user: User | null
  tickets: Ticket[]
  campaigns: Campaign[]
  channels: Channel[]
  flows: Flow[]
  templates: MessageTemplate[]
  conversations: Conversation[]
  aiConfig: AIConfig | null
  loading: {
    tickets: boolean
    campaigns: boolean
    channels: boolean
    flows: boolean
    templates: boolean
    conversations: boolean
    aiConfig: boolean
  }
  error: string | null
}

// Ações para o reducer
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TICKETS'; payload: Ticket[] }
  | { type: 'SET_CAMPAIGNS'; payload: Campaign[] }
  | { type: 'SET_CHANNELS'; payload: Channel[] }
  | { type: 'SET_FLOWS'; payload: Flow[] }
  | { type: 'SET_TEMPLATES'; payload: MessageTemplate[] }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_AI_CONFIG'; payload: AIConfig }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'UPDATE_TICKET'; payload: Ticket }
  | { type: 'DELETE_TICKET'; payload: string }
  | { type: 'ADD_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'ADD_CHANNEL'; payload: Channel }
  | { type: 'UPDATE_CHANNEL'; payload: Channel }
  | { type: 'DELETE_CHANNEL'; payload: string }
  | { type: 'ADD_FLOW'; payload: Flow }
  | { type: 'UPDATE_FLOW'; payload: Flow }
  | { type: 'DELETE_FLOW'; payload: string }
  | { type: 'ADD_TEMPLATE'; payload: MessageTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: MessageTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'CLEAR_STATE' }

// Estado inicial
const initialState: AppState = {
  user: null,
  tickets: [],
  campaigns: [],
  channels: [],
  flows: [],
  templates: [],
  conversations: [],
  aiConfig: null,
  loading: {
    tickets: false,
    campaigns: false,
    channels: false,
    flows: false,
    templates: false,
    conversations: false,
    aiConfig: false,
  },
  error: null,
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    
    case 'SET_TICKETS':
      return { ...state, tickets: action.payload }
    
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload }
    
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload }
    
    case 'SET_FLOWS':
      return { ...state, flows: action.payload }
    
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload }
    
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    
    case 'SET_AI_CONFIG':
      return { ...state, aiConfig: action.payload }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'ADD_TICKET':
      return { ...state, tickets: [...state.tickets, action.payload] }
    
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.id ? action.payload : ticket
        ),
      }
    
    case 'DELETE_TICKET':
      return {
        ...state,
        tickets: state.tickets.filter(ticket => ticket.id !== action.payload),
      }
    
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] }
    
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign =>
          campaign.id === action.payload.id ? action.payload : campaign
        ),
      }
    
    case 'DELETE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter(campaign => campaign.id !== action.payload),
      }
    
    case 'ADD_CHANNEL':
      return { ...state, channels: [...state.channels, action.payload] }
    
    case 'UPDATE_CHANNEL':
      return {
        ...state,
        channels: state.channels.map(channel =>
          channel.id === action.payload.id ? action.payload : channel
        ),
      }
    
    case 'DELETE_CHANNEL':
      return {
        ...state,
        channels: state.channels.filter(channel => channel.id !== action.payload),
      }
    
    case 'ADD_FLOW':
      return { ...state, flows: [...state.flows, action.payload] }
    
    case 'UPDATE_FLOW':
      return {
        ...state,
        flows: state.flows.map(flow =>
          flow.id === action.payload.id ? action.payload : flow
        ),
      }
    
    case 'DELETE_FLOW':
      return {
        ...state,
        flows: state.flows.filter(flow => flow.id !== action.payload),
      }
    
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] }
    
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      }
    
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload),
      }
    
    case 'ADD_CONVERSATION':
      return { ...state, conversations: [...state.conversations, action.payload] }
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conversation =>
          conversation.id === action.payload.id ? action.payload : conversation
        ),
      }
    
    case 'CLEAR_STATE':
      return initialState
    
    default:
      return state
  }
}

// Contexto
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  setLoading: (key: keyof AppState['loading'], value: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider
interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setLoading = (key: keyof AppState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } })
  }

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  // Carregar dados iniciais quando o usuário estiver logado
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token && state.user) {
      // Aqui você pode carregar dados iniciais se necessário
      // Por exemplo, carregar tickets, campanhas, etc.
    }
  }, [state.user])

  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    clearError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Hooks específicos para cada entidade
export function useTickets() {
  const { state, dispatch, setLoading, setError } = useApp()
  
  const loadTickets = useCallback(async () => {
    try {
      setLoading('tickets', true)
      setError(null)
      const tickets = await ticketsService.getAll()
      dispatch({ type: 'SET_TICKETS', payload: tickets })
      notificationService.success('Tickets carregados com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar tickets'
      setError(errorMessage)
      notificationService.error('Erro ao carregar tickets', errorMessage)
    } finally {
      setLoading('tickets', false)
    }
  }, [dispatch, setLoading, setError])

  return {
    tickets: state.tickets || [],
    loading: state.loading.tickets,
    error: state.error,
    loadTickets,
  }
}

export function useCampaigns() {
  const { state, dispatch, setLoading, setError } = useApp()
  
  const loadCampaigns = useCallback(async () => {
    // Evitar carregar se já está carregando ou se já tem dados
    if (state.loading.campaigns || (state.campaigns && state.campaigns.length > 0)) {
      console.log('Campanhas já carregadas ou carregando, pulando...')
      return;
    }

    console.log('Iniciando carregamento de campanhas...')
    try {
      setLoading('campaigns', true)
      setError(null)
      const campaigns = await campaignsService.getAll()
      console.log('Campanhas carregadas:', campaigns)
      dispatch({ type: 'SET_CAMPAIGNS', payload: campaigns })
      // Remover notificação de sucesso para evitar spam
      // notificationService.success('Campanhas carregadas com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar campanhas'
      console.error('Erro ao carregar campanhas:', error)
      setError(errorMessage)
      notificationService.error('Erro ao carregar campanhas', errorMessage)
    } finally {
      setLoading('campaigns', false)
    }
  }, [dispatch, setLoading, setError, state.loading.campaigns, state.campaigns])

  return {
    campaigns: state.campaigns || [],
    loading: state.loading.campaigns,
    error: state.error,
    loadCampaigns,
  }
}

export function useChannels() {
  const { state, dispatch, setLoading, setError } = useApp()
  
  const loadChannels = useCallback(async () => {
    // Evitar carregar se já está carregando ou se já tem dados
    if (state.loading.channels || (state.channels && state.channels.length > 0)) {
      return;
    }

    try {
      setLoading('channels', true)
      setError(null)
      const channels = await channelsService.getAll()
      dispatch({ type: 'SET_CHANNELS', payload: channels })
      // Remover notificação de sucesso para evitar spam
      // notificationService.success('Canais carregados com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar canais'
      setError(errorMessage)
      notificationService.error('Erro ao carregar canais', errorMessage)
    } finally {
      setLoading('channels', false)
    }
  }, [dispatch, setLoading, setError, state.loading.channels, state.channels])

  return {
    channels: state.channels || [],
    loading: state.loading.channels,
    error: state.error,
    loadChannels,
  }
}

export function useFlows() {
  const { state, dispatch, setLoading, setError } = useApp()
  
  const loadFlows = useCallback(async () => {
    // Evitar carregar se já está carregando ou se já tem dados
    if (state.loading.flows || (state.flows && state.flows.length > 0)) {
      return;
    }

    try {
      setLoading('flows', true)
      setError(null)
      const flows = await flowsService.getAll()
      dispatch({ type: 'SET_FLOWS', payload: flows })
      // Remover notificação de sucesso para evitar spam
      // notificationService.success('Fluxos carregados com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar fluxos'
      setError(errorMessage)
      notificationService.error('Erro ao carregar fluxos', errorMessage)
    } finally {
      setLoading('flows', false)
    }
  }, [dispatch, setLoading, setError, state.loading.flows, state.flows])

  return {
    flows: state.flows || [],
    loading: state.loading.flows,
    error: state.error,
    loadFlows,
  }
}

export function useTemplates() {
  const { state, dispatch, setLoading, setError } = useApp()
  
  const loadTemplates = useCallback(async () => {
    // Evitar carregar se já está carregando ou se já tem dados
    if (state.loading.templates || (state.templates && state.templates.length > 0)) {
      console.log('Templates já carregados ou carregando, pulando...')
      return;
    }

    console.log('Iniciando carregamento de templates...')
    try {
      setLoading('templates', true)
      setError(null)
      const templates = await templatesService.getAll()
      console.log('Templates carregados:', templates)
      dispatch({ type: 'SET_TEMPLATES', payload: templates })
      // Remover notificação de sucesso para evitar spam
      // notificationService.success('Templates carregados com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar templates'
      console.error('Erro ao carregar templates:', error)
      setError(errorMessage)
      notificationService.error('Erro ao carregar templates', errorMessage)
    } finally {
      setLoading('templates', false)
    }
  }, [dispatch, setLoading, setError, state.loading.templates, state.templates])

  return {
    templates: state.templates || [],
    loading: state.loading.templates,
    error: state.error,
    loadTemplates,
  }
}

export function useConversations() {
  const { state, dispatch, setLoading, setError } = useApp()
  
  const loadConversations = useCallback(async () => {
    try {
      setLoading('conversations', true)
      setError(null)
      const conversations = await chatService.getConversations()
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations })
      notificationService.success('Conversas carregadas com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar conversas'
      setError(errorMessage)
      notificationService.error('Erro ao carregar conversas', errorMessage)
    } finally {
      setLoading('conversations', false)
    }
  }, [dispatch, setLoading, setError])

  return {
    conversations: state.conversations || [],
    loading: state.loading.conversations,
    error: state.error,
    loadConversations,
  }
}

export function useAIConfig() {
  const { state, dispatch, setLoading, setError } = useApp()
  
  const loadAIConfig = useCallback(async () => {
    try {
      setLoading('aiConfig', true)
      setError(null)
      const config = await aiConfigService.get()
      dispatch({ type: 'SET_AI_CONFIG', payload: config })
      notificationService.success('Configurações de IA carregadas com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar configurações de IA'
      setError(errorMessage)
      notificationService.error('Erro ao carregar configurações de IA', errorMessage)
    } finally {
      setLoading('aiConfig', false)
    }
  }, [dispatch, setLoading, setError])

  return {
    aiConfig: state.aiConfig,
    loading: state.loading.aiConfig,
    error: state.error,
    loadAIConfig,
  }
}
