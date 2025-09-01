"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Users,
  Activity
} from "lucide-react"

const kpiData = [
  {
    title: "Tickets Abertos",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: MessageSquare,
    color: "text-blue-500",
  },
  {
    title: "Tempo Médio Resposta",
    value: "2.4h",
    change: "-8%",
    changeType: "positive" as const,
    icon: Clock,
    color: "text-amber-500",
  },
  {
    title: "Taxa de Resolução",
    value: "94%",
    change: "+2%",
    changeType: "positive" as const,
    icon: CheckCircle,
    color: "text-success",
  },
  {
    title: "Satisfação",
    value: "4.8",
    change: "+0.2",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "text-brand",
  },
]

const recentActivity = [
  { id: 1, action: "Ticket #1234 respondido", time: "2 min atrás", user: "João Silva" },
  { id: 2, action: "Novo ticket criado", time: "5 min atrás", user: "Maria Santos" },
  { id: 3, action: "Campanha enviada", time: "12 min atrás", user: "Sistema" },
  { id: 4, action: "Ticket #1230 fechado", time: "18 min atrás", user: "Ana Costa" },
]

export function DashboardContent() {
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
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
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
              {recentActivity.map((activity) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
