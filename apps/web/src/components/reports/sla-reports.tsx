"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SlaSummaryCards } from "./sla-summary-cards"
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react"

interface SlaReport {
  period: string
  slaConfig: {
    firstResponseMins: number
    resolutionMins: number
  }
  totalTickets: number
  firstResponseCompliance: number // %
  resolutionCompliance: number    // %
  avgFirstResponseTime: number    // minutos
  avgResolutionTime: number       // minutos
  firstResponseBreaches: number
  resolutionBreaches: number
}

interface SlaBreach {
  id: string
  ticketId: string
  customerName: string
  type: "first_response" | "resolution"
  dueAt: Date
  breachedAt: Date
  overdueMinutes: number
  agent?: string
  priority: "low" | "medium" | "high"
}

interface SlaReportsProps {
  slaReport: SlaReport
  previousPeriod?: SlaReport
  breaches: SlaBreach[]
  onExport: (format: "csv" | "pdf") => Promise<void>
}

export function SlaReports({ 
  slaReport, 
  previousPeriod, 
  breaches, 
  onExport 
}: SlaReportsProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [breachTypeFilter, setBreachTypeFilter] = useState<"all" | "first_response" | "resolution">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all")

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (mins === 0) {
        return `${hours}h`
      }
      return `${hours}h ${mins}min`
    } else {
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      if (hours === 0) {
        return `${days} dia${days > 1 ? 's' : ''}`
      }
      return `${days} dia${days > 1 ? 's' : ''} ${hours}h`
    }
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Agora"
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days} dia${days > 1 ? 's' : ''} atrás`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive"
      case "medium": return "text-warning"
      case "low": return "text-muted-foreground"
      default: return "text-muted-foreground"
    }
  }

  const getBreachTypeLabel = (type: string) => {
    switch (type) {
      case "first_response": return "Primeira Resposta"
      case "resolution": return "Resolução"
      default: return type
    }
  }

  const getBreachTypeBadge = (type: string) => {
    switch (type) {
      case "first_response": return "warning"
      case "resolution": return "destructive"
      default: return "secondary"
    }
  }

  const filteredBreaches = breaches.filter(breach => {
    if (breachTypeFilter !== "all" && breach.type !== breachTypeFilter) return false
    if (priorityFilter !== "all" && breach.priority !== priorityFilter) return false
    return true
  })

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      await onExport(format)
    } catch (error) {
      console.error("Erro ao exportar:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios de SLA</h1>
          <p className="text-muted-foreground mt-1">
            Monitore o desempenho dos seus acordos de nível de serviço
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand" />
            Período do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">De:</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Até:</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <SlaSummaryCards slaReport={slaReport} previousPeriod={previousPeriod} />

      {/* Gráficos e Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Compliance */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand" />
              Tendência de Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-2xl">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Gráfico de tendência</p>
                <p className="text-sm text-muted-foreground">Integração com Chart.js em breve</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Breaches */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-brand" />
              Distribuição de Breaches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Primeira Resposta</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full" 
                      style={{ width: `${(slaReport.firstResponseBreaches / slaReport.totalTickets) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{slaReport.firstResponseBreaches}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Resolução</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-destructive h-2 rounded-full" 
                      style={{ width: `${(slaReport.resolutionBreaches / slaReport.totalTickets) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{slaReport.resolutionBreaches}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Breaches */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-brand" />
            Tickets com SLA Vencido
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros de Breaches */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tipo:</span>
              <select
                value={breachTypeFilter}
                onChange={(e) => setBreachTypeFilter(e.target.value as any)}
                className="px-3 py-1 border border-border rounded-lg text-sm"
              >
                <option value="all">Todos</option>
                <option value="first_response">Primeira Resposta</option>
                <option value="resolution">Resolução</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Prioridade:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-3 py-1 border border-border rounded-lg text-sm"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          {/* Tabela de Breaches */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-foreground">Ticket</th>
                  <th className="text-left p-3 font-medium text-foreground">Cliente</th>
                  <th className="text-left p-3 font-medium text-foreground">Tipo</th>
                  <th className="text-left p-3 font-medium text-foreground">Vencido há</th>
                  <th className="text-left p-3 font-medium text-foreground">Prioridade</th>
                  <th className="text-left p-3 font-medium text-foreground">Atendente</th>
                  <th className="text-left p-3 font-medium text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBreaches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum breach encontrado para os filtros selecionados
                    </td>
                  </tr>
                ) : (
                  filteredBreaches.map((breach) => (
                    <tr key={breach.id} className="border-b border-border/50">
                      <td className="p-3 font-mono text-foreground">#{breach.ticketId}</td>
                      <td className="p-3 text-foreground">{breach.customerName}</td>
                      <td className="p-3">
                        <Badge variant={getBreachTypeBadge(breach.type)}>
                          {getBreachTypeLabel(breach.type)}
                        </Badge>
                      </td>
                      <td className="p-3 text-foreground">
                        {formatTime(breach.overdueMinutes)}
                      </td>
                      <td className="p-3">
                        <span className={getPriorityColor(breach.priority)}>
                          {breach.priority === "high" && "Alta"}
                          {breach.priority === "medium" && "Média"}
                          {breach.priority === "low" && "Baixa"}
                        </span>
                      </td>
                      <td className="p-3 text-foreground">
                        {breach.agent || "Não atribuído"}
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm">
                          Ver Ticket
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {filteredBreaches.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredBreaches.length} de {breaches.length} breaches
              </p>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">Página 1 de 1</span>
                <Button variant="outline" size="sm" disabled>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
