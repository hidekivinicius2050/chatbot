"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"

interface SlaSummaryCardsProps {
  slaReport: SlaReport
  previousPeriod?: SlaReport
}

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

export function SlaSummaryCards({ slaReport, previousPeriod }: SlaSummaryCardsProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes < 1440) { // menos de 24 horas
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

  const getChangeIndicator = (current: number, previous: number) => {
    if (!previous) return null
    
    const change = current - previous
    const changePercent = previous > 0 ? (change / previous) * 100 : 0
    
    if (Math.abs(changePercent) < 1) return null // Mudança insignificante
    
    return {
      value: changePercent > 0 ? `+${changePercent.toFixed(1)}%` : `${changePercent.toFixed(1)}%`,
      isPositive: changePercent < 0, // Para SLA, menor é melhor
      icon: changePercent < 0 ? TrendingUp : TrendingDown
    }
  }

  const getComplianceStatus = (compliance: number) => {
    if (compliance >= 95) return "excellent"
    if (compliance >= 85) return "good"
    if (compliance >= 70) return "warning"
    return "critical"
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success"
      case "good": return "text-success"
      case "warning": return "text-warning"
      case "critical": return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "excellent": return CheckCircle
      case "good": return CheckCircle
      case "warning": return AlertTriangle
      case "critical": return AlertTriangle
      default: return Activity
    }
  }

  const kpiData = [
    {
      title: "Compliance Primeira Resposta",
      value: `${slaReport.firstResponseCompliance.toFixed(1)}%`,
      change: getChangeIndicator(slaReport.firstResponseCompliance, previousPeriod?.firstResponseCompliance),
      icon: Clock,
      status: getComplianceStatus(slaReport.firstResponseCompliance),
      description: `${slaReport.totalTickets - slaReport.firstResponseBreaches} de ${slaReport.totalTickets} tickets`,
      color: getComplianceColor(getComplianceStatus(slaReport.firstResponseCompliance))
    },
    {
      title: "Compliance Resolução",
      value: `${slaReport.resolutionCompliance.toFixed(1)}%`,
      change: getChangeIndicator(slaReport.resolutionCompliance, previousPeriod?.resolutionCompliance),
      icon: CheckCircle,
      status: getComplianceStatus(slaReport.resolutionCompliance),
      description: `${slaReport.totalTickets - slaReport.resolutionBreaches} de ${slaReport.totalTickets} tickets`,
      color: getComplianceColor(getComplianceStatus(slaReport.resolutionCompliance))
    },
    {
      title: "Tempo Médio Primeira Resposta",
      value: formatTime(slaReport.avgFirstResponseTime),
      change: getChangeIndicator(slaReport.avgFirstResponseTime, previousPeriod?.avgFirstResponseTime),
      icon: Clock,
      status: slaReport.avgFirstResponseTime <= slaReport.slaConfig.firstResponseMins ? "good" : "warning",
      description: `Meta: ${formatTime(slaReport.slaConfig.firstResponseMins)}`,
      color: slaReport.avgFirstResponseTime <= slaReport.slaConfig.firstResponseMins ? "text-success" : "text-warning"
    },
    {
      title: "Tempo Médio Resolução",
      value: formatTime(slaReport.avgResolutionTime),
      change: getChangeIndicator(slaReport.avgResolutionTime, previousPeriod?.avgResolutionTime),
      icon: CheckCircle,
      status: slaReport.avgResolutionTime <= slaReport.slaConfig.resolutionMins ? "good" : "warning",
      description: `Meta: ${formatTime(slaReport.slaConfig.resolutionMins)}`,
      color: slaReport.avgResolutionTime <= slaReport.slaConfig.resolutionMins ? "text-success" : "text-warning"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi) => {
        const StatusIcon = getComplianceIcon(kpi.status)
        
        return (
          <Card key={kpi.title} className="shadow-midnight">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <StatusIcon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              
              <div className="flex items-center gap-2 mt-1">
                {kpi.change && (
                  <Badge 
                    variant={kpi.change.isPositive ? "success" : "destructive"}
                    className="text-xs"
                  >
                    {kpi.change.icon && <kpi.change.icon className="h-3 w-3 mr-1" />}
                    {kpi.change.value}
                  </Badge>
                )}
                
                {previousPeriod && (
                  <span className="text-xs text-muted-foreground">vs. período anterior</span>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
