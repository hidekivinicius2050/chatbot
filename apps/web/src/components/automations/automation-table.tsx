"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  Activity
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Automation {
  id: string
  name: string
  description?: string
  enabled: boolean
  dsl: AutomationDsl
  createdAt: Date
  updatedAt: Date
  runs: AutomationRun[]
}

interface AutomationDsl {
  triggers: Array<{
    type: string
    filters?: Record<string, any>
  }>
  conditions: Array<{
    if: Record<string, any>
  }>
  actions: Array<{
    type: string
    params?: Record<string, any>
  }>
}

interface AutomationRun {
  id: string
  status: 'running' | 'completed' | 'failed'
  startedAt: Date
  finishedAt?: Date
  error?: string
}

interface AutomationTableProps {
  automations: Automation[]
  onToggleAutomation: (id: string, enabled: boolean) => Promise<void>
  onDeleteAutomation: (id: string) => Promise<void>
  onTestAutomation: (id: string) => Promise<void>
}

const statusFilters = [
  { value: "all", label: "Todas", count: 0 },
  { value: "enabled", label: "Ativas", count: 0 },
  { value: "disabled", label: "Inativas", count: 0 },
]

const typeFilters = [
  { value: "all", label: "Todos os tipos", count: 0 },
  { value: "ticket", label: "Ticket", count: 0 },
  { value: "contact", label: "Contato", count: 0 },
  { value: "campaign", label: "Campanha", count: 0 },
]

export function AutomationTable({ 
  automations, 
  onToggleAutomation, 
  onDeleteAutomation,
  onTestAutomation 
}: AutomationTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredAutomations, setFilteredAutomations] = useState(automations)

  // Atualizar contadores dos filtros
  const updateFilterCounts = () => {
    statusFilters[0].count = automations.length
    statusFilters[1].count = automations.filter(a => a.enabled).length
    statusFilters[2].count = automations.filter(a => !a.enabled).length

    typeFilters[0].count = automations.length
    typeFilters[1].count = automations.filter(a => 
      a.dsl.triggers.some(t => t.type.includes('ticket'))
    ).length
    typeFilters[2].count = automations.filter(a => 
      a.dsl.triggers.some(t => t.type.includes('contact'))
    ).length
    typeFilters[3].count = automations.filter(a => 
      a.dsl.triggers.some(t => t.type.includes('campaign'))
    ).length
  }

  // Filtrar automações
  const filterAutomations = () => {
    let filtered = automations

    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter(a => 
        statusFilter === "enabled" ? a.enabled : !a.enabled
      )
    }

    // Filtro de tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter(a => 
        a.dsl.triggers.some(t => t.type.includes(typeFilter))
      )
    }

    // Filtro de busca
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredAutomations(filtered)
  }

  // Aplicar filtros quando mudar
  useState(() => {
    updateFilterCounts()
    filterAutomations()
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setTimeout(filterAutomations, 300) // Debounce
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setTimeout(filterAutomations, 100)
  }

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type)
    setTimeout(filterAutomations, 100)
  }

  const getAutomationType = (automation: Automation) => {
    const triggerTypes = automation.dsl.triggers.map(t => t.type)
    if (triggerTypes.some(t => t.includes('ticket'))) return "ticket"
    if (triggerTypes.some(t => t.includes('contact'))) return "contact"
    if (triggerTypes.some(t => t.includes('campaign'))) return "campaign"
    return "other"
  }

  const getLastRunStatus = (automation: Automation) => {
    if (automation.runs.length === 0) return null
    const lastRun = automation.runs[automation.runs.length - 1]
    return lastRun.status
  }

  const getLastRunTime = (automation: Automation) => {
    if (automation.runs.length === 0) return null
    const lastRun = automation.runs[automation.runs.length - 1]
    return lastRun.startedAt
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie automações para otimizar seu atendimento
          </p>
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link href="/automations/new">
            <Plus className="h-4 w-4" />
            Nova Automação
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros de status e tipo */}
          <div className="flex flex-wrap gap-3">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(filter.value)}
                className="flex items-center gap-2"
              >
                {filter.label}
                <Badge variant="secondary" className="ml-1">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {typeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={typeFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeFilter(filter.value)}
                className="flex items-center gap-2"
              >
                {filter.label}
                <Badge variant="secondary" className="ml-1">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Automações */}
      <div className="space-y-4">
        {filteredAutomations.length === 0 ? (
          <Card className="shadow-midnight">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma automação encontrada
              </h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Crie sua primeira automação para começar"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAutomations.map((automation) => (
            <Card key={automation.id} className="shadow-midnight hover:shadow-midnight-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {automation.name}
                      </h3>
                      
                      <Badge variant={automation.enabled ? "success" : "secondary"}>
                        {automation.enabled ? "Ativa" : "Inativa"}
                      </Badge>
                      
                      <Badge variant="outline">
                        {getAutomationType(automation)}
                      </Badge>
                    </div>

                    {automation.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {automation.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criada em {automation.createdAt.toLocaleDateString("pt-BR")}
                      </div>
                      
                      {getLastRunTime(automation) && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Última execução: {formatRelativeTime(getLastRunTime(automation)!)}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {automation.runs.length} execuções
                      </div>
                    </div>

                    {/* Triggers, Conditions, Actions */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{automation.dsl.triggers.length} trigger(s)</span>
                      <span>{automation.dsl.conditions.length} condição(ões)</span>
                      <span>{automation.dsl.actions.length} ação(ões)</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    {/* Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={(enabled) => onToggleAutomation(automation.id, enabled)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {automation.enabled ? "Ativa" : "Inativa"}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTestAutomation(automation.id)}
                        className="h-8 px-2"
                      >
                        <Play className="h-3 w-3" />
                      </Button>

                      <Button variant="outline" size="sm" asChild className="h-8 px-2">
                        <Link href={`/automations/${automation.id}/edit`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onTestAutomation(automation.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Testar
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/automations/${automation.id}`}>
                              <Activity className="h-4 w-4 mr-2" />
                              Ver Execuções
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/automations/${automation.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteAutomation(automation.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
