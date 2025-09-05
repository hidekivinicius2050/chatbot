"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Megaphone, 
  Clock,
  Users,
  Calendar,
  Target,
  BarChart3,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Smartphone,
  Mail,
  MessageCircle
} from "lucide-react"

// Mock data - será substituído por API real
const mockCampaign = {
  id: "1",
  name: "Campanha Black Friday 2024",
  status: "active" as const,
  type: "whatsapp" as const,
  targetAudience: "Clientes Premium",
  totalContacts: 2500,
  sentMessages: 1800,
  openedRate: 78.5,
  responseRate: 12.3,
  startDate: "2024-11-20",
  endDate: "2024-11-30",
  budget: 1500.00,
  spent: 890.50,
  priority: "high" as const,
  description: "Campanha especial para Black Friday com ofertas exclusivas para clientes premium. Foco em produtos de alta margem e cross-selling.",
  messageTemplate: "🎉 BLACK FRIDAY EXCLUSIVA! 🎉\n\nOlá {nome}! Temos ofertas incríveis só para você:\n\n🔥 Até 70% OFF\n🎁 Frete grátis\n⚡ Ofertas por tempo limitado\n\nAcesse: {link}\n\nVálido até 30/11",
  tags: ["Black Friday", "Premium", "Ofertas", "WhatsApp"],
  createdAt: "2024-11-15T10:00:00Z",
  updatedAt: "2024-11-25T14:30:00Z",
}

const mockMetrics = [
  { label: "Mensagens Enviadas", value: "1.800", icon: MessageSquare, color: "text-blue-600" },
  { label: "Taxa de Abertura", value: "78.5%", icon: Eye, color: "text-green-600" },
  { label: "Taxa de Resposta", value: "12.3%", icon: MessageCircle, color: "text-purple-600" },
  { label: "Contatos Alcançados", value: "2.500", icon: Users, color: "text-orange-600" },
]

const mockTimeline = [
  { date: "2024-11-20", action: "Campanha iniciada", status: "success" },
  { date: "2024-11-21", action: "1.000 mensagens enviadas", status: "success" },
  { date: "2024-11-22", action: "2.000 mensagens enviadas", status: "success" },
  { date: "2024-11-23", action: "Pausa temporária para ajustes", status: "warning" },
  { date: "2024-11-24", action: "Campanha retomada", status: "success" },
  { date: "2024-11-25", action: "1.800 mensagens enviadas", status: "success" },
]

interface CampaignDetailsProps {
  campaignId: string
}

export function CampaignDetails({ campaignId }: CampaignDetailsProps) {
  const [campaign, setCampaign] = useState(mockCampaign)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Aqui você faria a chamada para a API real
    // fetchCampaign(campaignId)
  }, [campaignId])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "success"
      case "paused": return "warning"
      case "draft": return "secondary"
      case "completed": return "default"
      default: return "default"
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "whatsapp": return "success"
      case "email": return "info"
      case "sms": return "warning"
      default: return "default"
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "warning"
      case "low": return "default"
      default: return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="h-4 w-4" />
      case "paused": return <Pause className="h-4 w-4" />
      case "draft": return <Edit className="h-4 w-4" />
      case "completed": return <Square className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <Smartphone className="h-5 w-5" />
      case "email": return <Mail className="h-5 w-5" />
      case "sms": return <MessageCircle className="h-5 w-5" />
      default: return <MessageSquare className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando campanha...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{campaign.name}</h1>
            <p className="text-muted-foreground mt-1">
              ID: #{campaign.id} • Criada em {formatDateTime(campaign.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Status and Type */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(campaign.status)}
          <Badge variant={getStatusBadgeVariant(campaign.status)}>
            {campaign.status === "active" && "Ativa"}
            {campaign.status === "paused" && "Pausada"}
            {campaign.status === "draft" && "Rascunho"}
            {campaign.status === "completed" && "Concluída"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {getTypeIcon(campaign.type)}
          <Badge variant={getTypeBadgeVariant(campaign.type)}>
            {campaign.type === "whatsapp" && "WhatsApp"}
            {campaign.type === "email" && "Email"}
            {campaign.type === "sms" && "SMS"}
          </Badge>
        </div>
        <Badge variant={getPriorityBadgeVariant(campaign.priority)}>
          {campaign.priority === "high" && "Alta Prioridade"}
          {campaign.priority === "medium" && "Média Prioridade"}
          {campaign.priority === "low" && "Baixa Prioridade"}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, index) => (
          <Card key={index} className="shadow-midnight">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Campaign Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-brand" />
                Detalhes da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Descrição</h4>
                <p className="text-muted-foreground">{campaign.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Público-Alvo</p>
                  <p className="font-medium text-foreground">{campaign.targetAudience}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Contatos</p>
                  <p className="font-medium text-foreground">{campaign.totalContacts.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium text-foreground">{formatDate(campaign.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Fim</p>
                  <p className="font-medium text-foreground">{formatDate(campaign.endDate)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Template */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand" />
                Template da Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                  {campaign.messageTemplate}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand" />
                Timeline da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTimeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions and Stats */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-brand" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaign.status === "active" && (
                <>
                  <Button variant="outline" className="w-full">
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar Campanha
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar Campanha
                  </Button>
                </>
              )}
              
              {campaign.status === "paused" && (
                <Button variant="outline" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Retomar Campanha
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
              
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Contatos
              </Button>
            </CardContent>
          </Card>

          {/* Budget Info */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand" />
                Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orçamento Total:</span>
                <span className="font-medium">{formatCurrency(campaign.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gasto:</span>
                <span className="font-medium">{formatCurrency(campaign.spent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restante:</span>
                <span className="font-medium">{formatCurrency(campaign.budget - campaign.spent)}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progresso do Gasto</span>
                  <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Abertura:</span>
                <span className="font-medium text-green-600">{campaign.openedRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Resposta:</span>
                <span className="font-medium text-blue-600">{campaign.responseRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Eficiência:</span>
                <span className="font-medium text-purple-600">
                  {Math.round((campaign.openedRate + campaign.responseRate) / 2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
