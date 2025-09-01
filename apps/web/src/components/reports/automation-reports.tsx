"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/hooks/use-i18n"
import { useAccessibility } from "@/hooks/use-accessibility"
import { Virtuoso } from 'react-virtuoso'
import { 
  Download, 
  Filter, 
  TrendingUp, 
  Play, 
  Pause,
  Calendar,
  Clock,
  Activity
} from "lucide-react"

interface Automation {
  id: string
  name: string
  description?: string
  enabled: boolean
  type: string
  lastRun?: Date
  executions: number
  successRate: number
}

interface AutomationReportsProps {
  automations: Automation[]
  onExport: (format: "csv" | "pdf") => Promise<void>
}

export function AutomationReports({ automations, onExport }: AutomationReportsProps) {
  const { t, formatDate, formatNumber } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Hook de acessibilidade
  const { containerRef, announce } = useAccessibility({
    onEscape: () => {
      setSearchQuery("")
      setStatusFilter("all")
      setTypeFilter("all")
      announce("Filtros limpos")
    }
  })

  // Filtrar automações
  const filteredAutomations = useMemo(() => {
    let filtered = automations

    if (statusFilter !== "all") {
      filtered = filtered.filter(a => 
        statusFilter === "enabled" ? a.enabled : !a.enabled
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(a => a.type === typeFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [automations, statusFilter, typeFilter, searchQuery])

  // Estatísticas
  const stats = useMemo(() => {
    const total = automations.length
    const enabled = automations.filter(a => a.enabled).length
    const totalExecutions = automations.reduce((sum, a) => sum + a.executions, 0)
    const avgSuccessRate = automations.length > 0 
      ? automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length
      : 0

    return { total, enabled, totalExecutions, avgSuccessRate }
  }, [automations])

  // Tipos únicos para filtro
  const uniqueTypes = useMemo(() => {
    const types = [...new Set(automations.map(a => a.type))]
    return types
  }, [automations])

  // Função para exportar
  const handleExport = useCallback(async (format: "csv" | "pdf") => {
    try {
      await onExport(format)
      announce(`Relatório exportado em ${format.toUpperCase()}`)
    } catch (error) {
      announce("Erro ao exportar relatório")
    }
  }, [onExport, announce])

  // Renderizar linha da tabela virtualizada
  const renderRow = useCallback((index: number, automation: Automation) => (
    <div className="flex items-center justify-between p-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-foreground truncate">
            {automation.name}
          </h4>
          <Badge variant={automation.enabled ? "success" : "secondary"}>
            {automation.enabled ? t('automations.enabled') : t('automations.disabled')}
          </Badge>
          <Badge variant="outline">
            {automation.type}
          </Badge>
        </div>
        
        {automation.description && (
          <p className="text-muted-foreground mb-2 line-clamp-2">
            {automation.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {automation.lastRun && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(automation.lastRun)}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            {formatNumber(automation.executions)} {t('automations.executions')}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {formatNumber(automation.successRate)}% sucesso
          </div>
        </div>
      </div>
    </div>
  ), [t, formatDate, formatNumber])

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{stats.enabled}</div>
            <div className="text-sm text-muted-foreground">Ativas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatNumber(stats.totalExecutions)}</div>
            <div className="text-sm text-muted-foreground">Execuções</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatNumber(stats.avgSuccessRate)}%</div>
            <div className="text-sm text-muted-foreground">Taxa Sucesso</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Buscar automações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Buscar automações"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={statusFilter === "enabled" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("enabled")}
            >
              Ativas
            </Button>
            <Button
              variant={statusFilter === "disabled" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("disabled")}
            >
              Inativas
            </Button>
          </div>

          {uniqueTypes.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
              >
                Todos os tipos
              </Button>
              {uniqueTypes.map(type => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredAutomations.length} de {automations.length} automações
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('common.export')} CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('common.export')} PDF
          </Button>
        </div>
      </div>

      {/* Lista virtualizada */}
      {filteredAutomations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma automação encontrada
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Nenhuma automação configurada"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Virtuoso
              data={filteredAutomations}
              itemContent={renderRow}
              style={{ height: '400px' }}
              overscan={5}
              components={{
                Footer: () => (
                  <div className="p-4 text-center text-muted-foreground">
                    Fim da lista
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
