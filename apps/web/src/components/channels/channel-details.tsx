"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { channelsService } from "@/services/api"
import { notificationService } from "@/services/notification"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  MessageSquare, 
  Wifi,
  WifiOff,
  Smartphone,
  Mail,
  MessageCircle,
  QrCode,
  Settings,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  Calendar,
  Target,
  BarChart3,
  Play,
  Pause,
  Square,
  Download,
  Copy,
  ExternalLink
} from "lucide-react"

// Mock data - será substituído por API real
const mockChannel = {
  id: "1",
  name: "WhatsApp Principal",
  type: "whatsapp" as const,
  status: "connected" as const,
  phoneNumber: "+55 11 99999-9999",
  qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMzIgMzJIMjI0VjIyNEgzMlYzMloiIGZpbGw9IiMwMDAiLz4KPHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMTYgMTYgMTkyIDE5MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQ4IDQ4SDE3NlYxNzZINDhWNDhaIiBmaWxsPSIjMDBEIi8+CjxwYXRoIGQ9Ik02NCA2NEgxNjBWNjRINjRWNjRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjQgODBIMTYwVjgwSDY0VjgwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTY0IDk2SDE2MFY5Nkg2NFY5NloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik02NCAxMTJIMTYwVjExMkg2NFYxMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjQgMTI4SDE2MFYxMjhINjRWMTI4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTY0IDE0NEgxNjBWMTQ0SDY0VjE0NFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K",
  lastActivity: "2 minutos atrás",
  messageCount: 1247,
  contactCount: 89,
  businessHours: "24/7",
  sla: "5 minutos",
  createdAt: "15/08/2024",
  lastConnected: "02/09/2025 às 14:30",
  totalMessages: 1247,
  totalContacts: 89,
  avgResponseTime: "2.3 minutos",
  uptime: "99.8%",
  webhookUrl: "https://api.empresa.com/webhooks/whatsapp",
  apiKey: "wapp_1234567890abcdef",
  settings: {
    autoReply: true,
    businessHours: true,
    messageTemplate: true,
    mediaSupport: true,
    groupSupport: false
  },
  recentMessages: [
    {
      id: "1",
      contact: "João Silva",
      message: "Olá, preciso de ajuda com meu pedido",
      timestamp: "2 minutos atrás",
      status: "delivered"
    },
    {
      id: "2",
      contact: "Maria Santos",
      message: "Obrigada pelo atendimento!",
      timestamp: "5 minutos atrás",
      status: "read"
    },
    {
      id: "3",
      contact: "Pedro Costa",
      message: "Qual o prazo de entrega?",
      timestamp: "10 minutos atrás",
      status: "delivered"
    }
  ]
}

export function ChannelDetails({ channelId }: { channelId: string }) {
  const [channel, setChannel] = useState(mockChannel)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Aqui você faria a chamada para a API real
    // setChannel(await fetchChannel(channelId))
  }, [channelId])

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simular conexão
    setTimeout(() => {
      setIsConnecting(false)
    }, 2000)
  }

  const handleDisconnect = async () => {
    // Implementar desconexão
  }

  const handleRefreshQR = async () => {
    // Implementar refresh do QR code
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "connected": return "success"
      case "active": return "default"
      case "connecting": return "warning"
      case "inactive": return "secondary"
      default: return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "active": return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "connecting": return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      case "inactive": return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageCircle className="h-5 w-5" />
      case "email": return <Mail className="h-5 w-5" />
      case "sms": return <Smartphone className="h-5 w-5" />
      default: return <MessageSquare className="h-5 w-5" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
           <Link href="/channels">
             <Button variant="outline" size="sm">
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{channel.name}</h1>
            <p className="text-muted-foreground mt-1">
              Canal de {channel.type === "whatsapp" ? "WhatsApp" : channel.type === "email" ? "Email" : "SMS"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Info */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(channel.type)}
              Informações do Canal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={getStatusBadgeVariant(channel.status)}>
                {channel.status === "connected" && "Conectado"}
                {channel.status === "active" && "Ativo"}
                {channel.status === "connecting" && "Conectando"}
                {channel.status === "inactive" && "Inativo"}
              </Badge>
            </div>
            
            {channel.phoneNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Telefone:</span>
                <span className="text-sm font-medium">{channel.phoneNumber}</span>
              </div>
            )}
            
            {channel.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{channel.email}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Horário:</span>
              <span className="text-sm font-medium">{channel.businessHours}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">SLA:</span>
              <span className="text-sm font-medium">{channel.sla}</span>
            </div>
          </CardContent>
        </Card>

        {/* Connection Actions */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(channel.status)}
              <span className="text-sm">
                {channel.status === "connected" && "Conectado"}
                {channel.status === "active" && "Ativo"}
                {channel.status === "connecting" && "Conectando"}
                {channel.status === "inactive" && "Desconectado"}
              </span>
            </div>
            
            <div className="space-y-2">
              {channel.status === "connected" ? (
                <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              ) : (
                <Button className="w-full" onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wifi className="h-4 w-4 mr-2" />
                  )}
                  {isConnecting ? "Conectando..." : "Conectar"}
                </Button>
              )}
              
              {channel.type === "whatsapp" && (
                <Button variant="outline" className="w-full" onClick={handleRefreshQR}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar QR Code
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Code for WhatsApp */}
        {channel.type === "whatsapp" && (
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={channel.qrCode} 
                  alt="QR Code" 
                  className="w-32 h-32 border rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Mensagens</p>
                <p className="text-2xl font-bold text-foreground">{channel.totalMessages.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contatos</p>
                <p className="text-2xl font-bold text-foreground">{channel.totalContacts.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                <p className="text-2xl font-bold text-foreground">{channel.avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-foreground">{channel.uptime}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Configuration */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Webhook URL</label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={channel.webhookUrl} readOnly />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(channel.webhookUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
                                 <a href={channel.webhookUrl} target="_blank" rel="noopener noreferrer">
                   <Button variant="outline" size="sm">
                     <ExternalLink className="h-4 w-4" />
                   </Button>
                 </a>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">API Key</label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={channel.apiKey} readOnly />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(channel.apiKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {channel.recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{message.contact}</span>
                    <Badge variant="outline" size="sm">
                      {message.status === "delivered" && "Entregue"}
                      {message.status === "read" && "Lida"}
                      {message.status === "sent" && "Enviada"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
