"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Users,
  Activity,
  Loader2
} from "lucide-react"
import { useApp } from "@/contexts/AppContext"
import { useTickets } from "@/contexts/AppContext"
import { useCampaigns } from "@/contexts/AppContext"
import { useConversations } from "@/contexts/AppContext"

export function DashboardContent() {
  const { state } = useApp()
  const { tickets, loadTickets } = useTickets()
  const { campaigns, loadCampaigns } = useCampaigns()
  const { conversations, loadConversations } = useConversations()

  useEffect(() => {
    // Carregar dados iniciais
    loadTickets()
    loadCampaigns()
    loadConversations()
  }, [loadTickets, loadCampaigns, loadConversations])

  // Calcular KPIs baseados nos dados reais
  const openTickets = tickets.filter(ticket => ticket.status === 'open').length
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length
  const totalTickets = tickets.length
  const resolutionRate = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0
  
  // Calcular tempo médio de resposta (mockado por enquanto)
  const avgResponseTime = "2.4h"
  const satisfactionScore = "4.8"

  const kpiData = [
    {
      title: "Tickets Abertos",
      value: openTickets.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: MessageSquare,
      color: "text-blue-500",
      loading: state.loading.tickets,
    },
    {
      title: "Tempo Médio Resposta",
      value: avgResponseTime,
      change: "-8%",
      changeType: "positive" as const,
      icon: Clock,
      color: "text-amber-500",
      loading: false,
    },
    {
      title: "Taxa de Resolução",
      value: `${resolutionRate}%`,
      change: "+2%",
      changeType: "positive" as const,
      icon: CheckCircle,
      color: "text-success",
      loading: state.loading.tickets,
    },
    {
      title: "Satisfação",
      value: satisfactionScore,
      change: "+0.2",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-brand",
      loading: false,
    },
  ]

  // Atividade recente baseada em dados reais
  const recentActivity = [
    ...tickets.slice(0, 2).map((ticket, index) => ({
      id: `ticket-${ticket.id}`,
      action: `Ticket #${ticket.id} ${ticket.status === 'open' ? 'criado' : 'respondido'}`,
      time: "2 min atrás",
      user: ticket.customerName || "Cliente",
    })),
    ...campaigns.slice(0, 1).map((campaign, index) => ({
      id: `campaign-${campaign.id}`,
      action: `Campanha "${campaign.name}" enviada`,
      time: "12 min atrás",
      user: "Sistema",
    })),
    ...conversations.slice(0, 1).map((conversation, index) => ({
      id: `conversation-${conversation.id}`,
      action: `Conversa iniciada`,
      time: "18 min atrás",
      user: conversation.customerName || "Cliente",
    })),
  ].slice(0, 4)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu centro de atendimento
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="online" className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="shadow-midnight">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              {kpi.loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {kpi.loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  kpi.value
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${
                  kpi.changeType === "positive" ? "text-success" : "text-destructive"
                }`}>
                  {kpi.change}
                </span>
                <span className="text-xs text-muted-foreground">vs. mês passado</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Chart */}
        <Card className="lg:col-span-2 shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand" />
              Mensagens por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-2xl">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Gráfico de mensagens diárias</p>
                <p className="text-sm text-muted-foreground">Integração com Chart.js em breve</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.loading.tickets || state.loading.campaigns || state.loading.conversations ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-muted rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                          <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {activity.user}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
