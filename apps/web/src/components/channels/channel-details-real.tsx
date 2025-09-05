"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { channelsService } from "@/services/api"
import { notificationService } from "@/services/notification"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  Calendar,
  BarChart3,
  Loader2
} from "lucide-react"

interface ChannelDetailsProps {
  channelId: string
}

interface ChannelData {
  id: string
  name: string
  type: string
  status: string
  config?: {
    phoneNumber?: string
    businessName?: string
    email?: string
    apiKey?: string
    webhookUrl?: string
  }
  createdAt: string
  updatedAt: string
}

interface QRCodeData {
  qrCode: string
  channelId: string
  type: string
}

interface ChannelStats {
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
}

export function ChannelDetails({ channelId }: ChannelDetailsProps) {
  const [channel, setChannel] = useState<ChannelData | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [stats, setStats] = useState<ChannelStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrLoading, setQrLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChannel()
  }, [channelId])

  const loadChannel = async () => {
    try {
      setLoading(true)
      const channelData = await channelsService.getById(channelId)
      setChannel(channelData)
      
      // Carregar estatísticas
      loadStats()
      
      // Se for WhatsApp Baileys, carregar QR Code
      if (channelData.type === 'whatsapp-baileys') {
        loadQRCode()
      }
    } catch (error) {
      console.error("Erro ao carregar canal:", error)
      setError("Erro ao carregar dados do canal")
      notificationService.error("Erro ao carregar canal", error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const loadQRCode = async () => {
    try {
      setQrLoading(true)
      const qrData: QRCodeData = await channelsService.getQRCode(channelId)
      setQrCode(qrData.qrCode)
    } catch (error) {
      console.error("Erro ao carregar QR Code:", error)
      notificationService.error("Erro ao carregar QR Code", error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setQrLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const statsData: ChannelStats = await channelsService.getStats(channelId)
      setStats(statsData)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
      notificationService.error("Erro ao carregar estatísticas", error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setStatsLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      await channelsService.connect(channelId)
      notificationService.success("Canal conectado com sucesso!")
      loadChannel() // Recarregar dados
    } catch (error) {
      notificationService.error("Erro ao conectar canal", error instanceof Error ? error.message : "Erro desconhecido")
    }
  }

  const handleDisconnect = async () => {
    try {
      await channelsService.update(channelId, { status: "disconnected" })
      notificationService.success("Canal desconectado com sucesso!")
      loadChannel() // Recarregar dados
    } catch (error) {
      notificationService.error("Erro ao desconectar canal", error instanceof Error ? error.message : "Erro desconhecido")
    }
  }

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este canal?")) {
      try {
        await channelsService.delete(channelId)
        notificationService.success("Canal excluído com sucesso!")
        // Redirecionar para lista de canais
        window.location.href = "/channels"
      } catch (error) {
        notificationService.error("Erro ao excluir canal", error instanceof Error ? error.message : "Erro desconhecido")
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp-cloud":
      case "whatsapp-baileys":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case "telegram":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "instagram":
        return <MessageSquare className="h-5 w-5 text-pink-500" />
      case "email":
        return <Mail className="h-5 w-5 text-blue-500" />
      case "sms":
        return <Smartphone className="h-5 w-5 text-gray-500" />
      default:
        return <MessageSquare className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Conectado</Badge>
      case "disconnected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Desconectado</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pendente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando canal...</span>
      </div>
    )
  }

  if (error || !channel) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar canal</h3>
        <p className="text-gray-600 mb-4">{error || "Canal não encontrado"}</p>
        <Link href="/channels">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Canais
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/channels">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {getTypeIcon(channel.type)}
              {channel.name}
            </h1>
            <p className="text-gray-600">ID: {channel.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(channel.status)}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Status e Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Status e Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {channel.status === "connected" ? "🟢" : "🔴"}
              </div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium">{channel.status === "connected" ? "Online" : "Offline"}</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {channel.type === "whatsapp-cloud" || channel.type === "whatsapp-baileys" ? "📱" : "💬"}
              </div>
              <div className="text-sm text-gray-600">Tipo</div>
              <div className="font-medium capitalize">{channel.type.replace("-", " ")}</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                📊
              </div>
              <div className="text-sm text-gray-600">Mensagens</div>
              <div className="font-medium">0</div>
            </div>
          </div>

          <div className="flex gap-2">
            {channel.status === "connected" ? (
              <Button variant="destructive" onClick={handleDisconnect}>
                <WifiOff className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            ) : (
              <Button onClick={handleConnect}>
                <Wifi className="h-4 w-4 mr-2" />
                Conectar
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code para WhatsApp Baileys */}
      {channel.type === "whatsapp-baileys" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code para Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR Code abaixo com seu WhatsApp para conectar o canal
              </p>
              
              {qrLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Carregando QR Code...</span>
                </div>
              ) : qrCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code"
                    className="w-64 h-64 border border-gray-200 rounded-lg"
                  />
                  <Button variant="outline" onClick={loadQRCode}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar QR Code
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600">QR Code não disponível</p>
                  <Button variant="outline" onClick={loadQRCode} className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração para WhatsApp Cloud */}
      {channel.type === "whatsapp-cloud" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração WhatsApp Cloud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center h-32 mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Canal conectado via WhatsApp Cloud API
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Configuração necessária:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Phone Number ID configurado</li>
                  <li>• Access Token válido</li>
                  <li>• Webhook URL configurado</li>
                  <li>• Token de verificação</li>
                </ul>
              </div>
              
              <Button variant="outline" className="mt-4">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Canal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Canal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações do Canal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <p className="text-gray-900">{channel.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <p className="text-gray-900 capitalize">{channel.type.replace("-", " ")}</p>
            </div>
            
            {channel.config?.phoneNumber && (
              <div>
                <label className="text-sm font-medium text-gray-700">Número</label>
                <p className="text-gray-900">{channel.config.phoneNumber}</p>
              </div>
            )}
            
            {channel.config?.businessName && (
              <div>
                <label className="text-sm font-medium text-gray-700">Nome da Empresa</label>
                <p className="text-gray-900">{channel.config.businessName}</p>
              </div>
            )}
            
            {channel.config?.email && (
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{channel.config.email}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700">Criado em</label>
              <p className="text-gray-900">{new Date(channel.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Última atualização</label>
              <p className="text-gray-900">{new Date(channel.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando estatísticas...</span>
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                  <div className="text-sm text-gray-600">Total de Mensagens</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.sentMessages}</div>
                  <div className="text-sm text-gray-600">Mensagens Enviadas</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.receivedMessages}</div>
                  <div className="text-sm text-gray-600">Mensagens Recebidas</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.uniqueContacts}</div>
                  <div className="text-sm text-gray-600">Contatos Únicos</div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-700">{stats.avgResponseTime}</div>
                  <div className="text-sm text-gray-600">Tempo Médio de Resposta</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-700">{stats.uptime}</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-700">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString('pt-BR') : 'Nunca'}
                  </div>
                  <div className="text-sm text-gray-600">Última Atividade</div>
                </div>
              </div>
              
              {stats.totalMessages === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 text-center">
                    📊 As estatísticas de mensagens serão exibidas aqui quando o canal estiver conectado e recebendo mensagens.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Erro ao carregar estatísticas</p>
              <Button variant="outline" onClick={loadStats} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
