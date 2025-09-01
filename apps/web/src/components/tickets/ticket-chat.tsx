"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, 
  User, 
  Clock, 
  Paperclip,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "agent" | "customer"
  timestamp: Date
  status: "sent" | "sending" | "failed"
  attachments?: Array<{
    name: string
    size: number
    type: string
  }>
}

interface Ticket {
  id: string
  title: string
  status: "open" | "pending" | "closed"
  customer: string
  agent: string
  priority: "low" | "medium" | "high"
  sla: "normal" | "warning" | "critical"
  slaTime: string
  createdAt: Date
}

// Mock data - será substituído por API real
const mockTicket: Ticket = {
  id: "1234",
  title: "Problema com login no app",
  status: "open",
  customer: "João Silva",
  agent: "Maria Santos",
  priority: "high",
  sla: "warning",
  slaTime: "30m restantes",
  createdAt: new Date("2024-01-15T10:00:00Z"),
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Olá! Estou tendo problemas para fazer login no aplicativo. Sempre aparece 'usuário ou senha inválidos'.",
    sender: "customer",
    timestamp: new Date("2024-01-15T10:00:00Z"),
    status: "sent",
  },
  {
    id: "2",
    content: "Olá João! Vou te ajudar com esse problema. Pode me dizer qual versão do app você está usando?",
    sender: "agent",
    timestamp: new Date("2024-01-15T10:05:00Z"),
    status: "sent",
  },
  {
    id: "3",
    content: "Estou usando a versão 2.1.0. Já tentei reinstalar o app mas o problema persiste.",
    sender: "customer",
    timestamp: new Date("2024-01-15T10:08:00Z"),
    status: "sent",
  },
  {
    id: "4",
    content: "Entendi. Vamos verificar algumas coisas. Primeiro, pode confirmar se o email está correto?",
    sender: "agent",
    timestamp: new Date("2024-01-15T10:10:00Z"),
    status: "sent",
  },
]

export function TicketChat({ ticketId }: { ticketId: string }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "agent",
      timestamp: new Date(),
      status: "sending",
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: "sent" as const }
            : msg
        )
      )
    }, 1000)

    // Simulate customer typing
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Simulate customer response
      const customerMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Obrigado pela ajuda! Vou verificar essas informações.",
        sender: "customer",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages(prev => [...prev, customerMessage])
    }, 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadProgress(0)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Add message with attachment
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        content: `Arquivo anexado: ${file.name}`,
        sender: "agent",
        timestamp: new Date(),
        status: "sent",
        attachments: [{
          name: file.name,
          size: file.size,
          type: file.type,
        }],
      }
      setMessages(prev => [...prev, message])
    }, 1000)
  }

  const retryMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: "sending" as const }
          : msg
      )
    )

    // Simulate retry
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: "sent" as const }
            : msg
        )
      )
    }, 1000)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open": return "open"
      case "pending": return "pending"
      case "closed": return "closed"
      default: return "default"
    }
  }

  const getSLABadgeVariant = (sla: string) => {
    switch (sla) {
      case "normal": return "sla_normal"
      case "warning": return "sla_warning"
      case "critical": return "sla_critical"
      default: return "default"
    }
  }

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  #{mockTicket.id} - {mockTicket.title}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getStatusBadgeVariant(mockTicket.status)}>
                    {mockTicket.status === "open" && "Aberto"}
                    {mockTicket.status === "pending" && "Pendente"}
                    {mockTicket.status === "closed" && "Fechado"}
                  </Badge>
                  <Badge variant={getSLABadgeVariant(mockTicket.sla)}>
                    {mockTicket.slaTime}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Cliente: {mockTicket.customer}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Atribuir para mim
              </Button>
              <Button variant="outline" size="sm">
                Fechar Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "agent" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] ${message.sender === "agent" ? "order-2" : "order-1"}`}>
                <div className={cn(
                  "chat-bubble",
                  message.sender === "agent" ? "chat-bubble-mine" : "chat-bubble-other",
                  message.status === "sending" && "chat-bubble-sending",
                  message.status === "failed" && "chat-bubble-failed"
                )}>
                  <p className="text-base">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 p-2 bg-background/50 rounded-lg">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment.name}</span>
                          <span className="text-muted-foreground">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="message-meta flex items-center gap-2">
                    <span className="text-xs">
                      {message.timestamp.toLocaleTimeString("pt-BR", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </span>
                    
                    {message.status === "sending" && (
                      <span className="text-xs text-muted-foreground">Enviando...</span>
                    )}
                    
                    {message.status === "sent" && (
                      <CheckCircle className="h-3 w-3 text-success" />
                    )}
                    
                    {message.status === "failed" && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                          onClick={() => retryMessage(message.id)}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="chat-bubble chat-bubble-other">
                <div className="typing-indicator">
                  <span>{mockTicket.customer} está digitando</span>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-card p-6">
          <div className="space-y-4">
            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Enviando arquivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="upload-progress">
                  <div 
                    className="upload-progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Message input */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[80px] resize-none"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isUploading}
                  className="h-10 w-10 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Informações do Ticket</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <Badge variant={getStatusBadgeVariant(mockTicket.status)} className="mt-1">
              {mockTicket.status === "open" && "Aberto"}
              {mockTicket.status === "pending" && "Pendente"}
              {mockTicket.status === "closed" && "Fechado"}
            </Badge>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Prioridade</label>
            <p className="text-foreground font-medium mt-1">
              {mockTicket.priority === "high" && "Alta"}
              {mockTicket.priority === "medium" && "Média"}
              {mockTicket.priority === "low" && "Baixa"}
            </p>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">SLA</label>
            <Badge variant={getSLABadgeVariant(mockTicket.sla)} className="mt-1">
              {mockTicket.slaTime}
            </Badge>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Cliente</label>
            <p className="text-foreground font-medium mt-1">{mockTicket.customer}</p>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Atendente</label>
            <p className="text-foreground font-medium mt-1">{mockTicket.agent}</p>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Criado em</label>
            <p className="text-foreground font-medium mt-1">
              {mockTicket.createdAt.toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
