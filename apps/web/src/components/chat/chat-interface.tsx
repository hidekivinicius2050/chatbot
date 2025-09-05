"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  User,
  MessageSquare,
  PhoneCall,
  MapPin,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  Archive,
  Trash2,
  Settings,
  Plus,
  Zap,
  Bot,
  Headphones,
  X,
  Loader2
} from "lucide-react"
import { useConversations } from "@/contexts/AppContext"
import { useApp } from "@/contexts/AppContext"
import { useChatSocketIO } from "@/hooks/useSocketIO"
import "@/utils/mockAuth" // Importar mock de autenticação

export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { conversations, loadConversations } = useConversations()
  const { state } = useApp()
  
  // WebSocket para chat em tempo real
  const { isConnected, sendMessage, sendTyping } = useChatSocketIO(selectedConversation?.id)

  // Garantir que conversations seja sempre um array
  const safeConversations = Array.isArray(conversations) ? conversations : []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Carregar conversas ao montar o componente apenas se não estiver carregando e não houver conversas
    if (!state.loading.conversations && safeConversations.length === 0) {
      loadConversations()
    }
  }, []) // Removido as dependências que causavam loop infinito

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Carregar mensagens quando uma conversa for selecionada
    if (selectedConversation) {
      loadMessagesForConversation(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadMessagesForConversation = async (conversationId: string) => {
    // Aqui você implementaria a busca de mensagens da API
    // Por enquanto, vamos usar dados mock
    const mockMessages = [
      {
        id: "1",
        type: "received",
        content: "Olá! Preciso de ajuda com meu pedido #12345",
        timestamp: "14:25",
        status: "read"
      },
      {
        id: "2",
        type: "sent",
        content: "Olá! Claro, vou te ajudar. Pode me dar mais detalhes sobre o problema?",
        timestamp: "14:26",
        status: "delivered"
      },
      {
        id: "3",
        type: "received",
        content: "O pedido foi confirmado mas não recebi confirmação por email",
        timestamp: "14:28",
        status: "read"
      }
    ]
    setMessages(mockMessages)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message = {
      id: Date.now().toString(),
      type: "sent" as const,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: "sending"
    }

    // Adicionar mensagem localmente
    setMessages(prev => [...prev, message])
    setNewMessage("")

    try {
      // Enviar mensagem via WebSocket
      if (isConnected) {
        sendMessage({
          type: 'chat_message',
          conversationId: selectedConversation.id,
          content: newMessage,
          timestamp: new Date().toISOString()
        })
      }

      // Aqui você implementaria o envio para a API
      // await sendMessageToAPI(selectedConversation.id, newMessage)

      // Atualizar status da mensagem
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ))

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      // Marcar mensagem como falha
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'failed' } : msg
      ))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    if (isConnected && selectedConversation) {
      sendTyping(selectedConversation.id)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "normal": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Templates de resposta rápida
  const quickReplies = [
    "Olá! Como posso ajudar?",
    "Obrigado pelo contato!",
    "Vou verificar isso para você",
    "Aguarde um momento, por favor",
    "Posso te ajudar com mais alguma coisa?",
    "Tem mais alguma dúvida?",
    "Obrigado pela paciência!",
    "Vou resolver isso o mais rápido possível"
  ]

  const filteredConversations = safeConversations.filter(conv => {
    const matchesSearch = conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || conv.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (state.loading.conversations) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar - Lista de conversas */}
      <div className="w-80 border-r bg-background flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todas
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Ativas
            </Button>
            <Button
              variant={filterStatus === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("resolved")}
            >
              Resolvidas
            </Button>
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.customerAvatar || undefined} />
                    <AvatarFallback>
                      {conversation.customerName?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">
                        {conversation.customerName || "Cliente"}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessageAt ? 
                            new Date(conversation.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) :
                            "N/A"
                          }
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage || "Nenhuma mensagem"}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPriorityColor(conversation.priority || "normal")}>
                        {conversation.priority === "high" ? "Alta" : 
                         conversation.priority === "medium" ? "Média" : "Normal"}
                      </Badge>
                      <Badge className={getStatusColor(conversation.status || "active")}>
                        {conversation.status === "active" ? "Ativa" : 
                         conversation.status === "resolved" ? "Resolvida" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConversation ? (
          <>
            {/* Header da conversa */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.customerAvatar || undefined} />
                    <AvatarFallback>
                      {selectedConversation.customerName?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.customerName || "Cliente"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {isConnected ? "Online" : "Offline"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedConversation.customerPhone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm">Inicie a conversa enviando uma mensagem</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'sent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        message.type === 'sent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span>{message.timestamp}</span>
                        {message.type === 'sent' && (
                          <span>
                            {message.status === 'sending' && <Clock className="h-3 w-3" />}
                            {message.status === 'delivered' && <CheckCircle className="h-3 w-3" />}
                            {message.status === 'read' && <Eye className="h-3 w-3" />}
                            {message.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Área de resposta rápida */}
            {showQuickReplies && (
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Respostas Rápidas</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickReplies(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2"
                      onClick={() => {
                        setNewMessage(reply)
                        setShowQuickReplies(false)
                      }}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Área de input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                >
                  <Zap className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={handleKeyPress}
                    className="border-0 focus-visible:ring-0"
                  />
                </div>
                
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || !isConnected}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Status da conexão */}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </div>
            </div>
          </>
        ) : (
          /* Estado vazio */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">
                Escolha uma conversa da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
