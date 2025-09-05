"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Eye, 
  Calendar, 
  Users, 
  Target, 
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  description: string
  status: string
  type: string
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

interface CampaignDetailsModalProps {
  campaign: Campaign
}

export function CampaignDetailsModal({ campaign }: CampaignDetailsModalProps) {
  const [open, setOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'broadcast': return 'bg-blue-100 text-blue-800'
      case 'segmented': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateOpenRate = () => {
    if (campaign.metrics.sent === 0) return 0
    return Math.round((campaign.metrics.opened / campaign.metrics.sent) * 100)
  }

  const calculateClickRate = () => {
    if (campaign.metrics.sent === 0) return 0
    return Math.round((campaign.metrics.clicked / campaign.metrics.sent) * 100)
  }

  const calculateConversionRate = () => {
    if (campaign.metrics.sent === 0) return 0
    return Math.round((campaign.metrics.converted / campaign.metrics.sent) * 100)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {campaign.name}
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
            <Badge className={getTypeColor(campaign.type)}>
              {campaign.type}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {campaign.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Informações da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm">{campaign.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <p className="text-sm capitalize">{campaign.type}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Público-Alvo</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {campaign.targetAudience.map((audience, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>

              {campaign.budget && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Orçamento</label>
                  <p className="text-sm">R$ {campaign.budget.toLocaleString('pt-BR')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Início</label>
                  <p className="text-sm">{formatDate(campaign.startDate)}</p>
                </div>
              </div>
              
              {campaign.endDate && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Conclusão</label>
                    <p className="text-sm">{formatDate(campaign.endDate)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métricas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.metrics.sent}</div>
                  <div className="text-sm text-gray-500">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.metrics.delivered}</div>
                  <div className="text-sm text-gray-500">Entregues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{calculateOpenRate()}%</div>
                  <div className="text-sm text-gray-500">Taxa de Abertura</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{calculateClickRate()}%</div>
                  <div className="text-sm text-gray-500">Taxa de Clique</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{calculateConversionRate()}%</div>
                  <div className="text-sm text-gray-500">Taxa de Conversão</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status da Campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Status Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  campaign.status === 'active' ? 'bg-green-500' :
                  campaign.status === 'paused' ? 'bg-yellow-500' :
                  campaign.status === 'completed' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <span className="capitalize font-medium">{campaign.status}</span>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                {campaign.status === 'active' && 'Campanha está ativa e enviando mensagens.'}
                {campaign.status === 'paused' && 'Campanha está pausada. Você pode retomá-la a qualquer momento.'}
                {campaign.status === 'completed' && 'Campanha foi concluída com sucesso.'}
                {campaign.status === 'draft' && 'Campanha está em rascunho. Você pode editá-la antes de ativá-la.'}
                {campaign.status === 'scheduled' && 'Campanha está agendada para ser executada em uma data específica.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}


