"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Search, 
  Filter,
  Plus,
  Clock,
  User,
  Calendar,
  Loader2
} from "lucide-react"
import { useTickets } from "@/contexts/AppContext"
import { useApp } from "@/contexts/AppContext"

export function TicketsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredTickets, setFilteredTickets] = useState<any[]>([])
  
  const { tickets, loadTickets } = useTickets()
  const { state } = useApp()

  // Garantir que tickets seja sempre um array
  const safeTickets = Array.isArray(tickets) ? tickets : []

  useEffect(() => {
    // Carregar tickets ao montar o componente apenas se não estiver carregando e não houver tickets
    if (!state.loading.tickets && safeTickets.length === 0) {
      loadTickets()
    }
  }, [loadTickets, state.loading.tickets, safeTickets.length])

  useEffect(() => {
    // Filtrar tickets quando tickets ou filtros mudarem
    filterTickets(searchQuery, statusFilter)
  }, [safeTickets, searchQuery, statusFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterTickets(query, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterTickets(searchQuery, status)
  }

  const filterTickets = (query: string, status: string) => {
    let filtered = safeTickets

    if (status !== "all") {
      filtered = filtered.filter(ticket => ticket.status === status)
    }

    if (query) {
      filtered = filtered.filter(ticket =>
        ticket.title?.toLowerCase().includes(query.toLowerCase()) ||
        ticket.assignedTo?.name?.toLowerCase().includes(query.toLowerCase()) ||
        ticket.id?.toString().includes(query)
      )
    }

    setFilteredTickets(filtered)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open": return "open"
      case "pending": return "pending"
      case "closed": return "closed"
      default: return "default"
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive"
      case "high": return "sla_warning"
      case "medium": return "sla_normal"
      case "low": return "default"
      default: return "default"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Aberto"
      case "in_progress": return "Em Progresso"
      case "resolved": return "Resolvido"
      case "closed": return "Fechado"
      default: return status
    }
  }

  // Calcular contadores para filtros
  const statusFilters = [
    { value: "all", label: "Todos", count: safeTickets.length },
    { value: "open", label: "Abertos", count: safeTickets.filter(t => t.status === "open").length },
    { value: "in_progress", label: "Em Progresso", count: safeTickets.filter(t => t.status === "in_progress").length },
    { value: "resolved", label: "Resolvidos", count: safeTickets.filter(t => t.status === "resolved").length },
    { value: "closed", label: "Fechados", count: safeTickets.filter(t => t.status === "closed").length },
  ]

  if (state.loading.tickets) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os tickets de atendimento
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando tickets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os tickets de atendimento
          </p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, cliente ou ID..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-2">
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
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="shadow-midnight">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum ticket encontrado
              </h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || statusFilter !== "all" 
                  ? "Tente ajustar os filtros de busca"
                  : "Crie seu primeiro ticket para começar"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="shadow-midnight hover:shadow-midnight-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        href={`/tickets/${ticket.id}`}
                        className="text-lg font-semibold text-foreground hover:text-brand transition-colors"
                      >
                        #{ticket.id}
                      </Link>
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {ticket.priority === 'urgent' ? 'Urgente' : ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    
                    <h3 className="text-base font-medium text-foreground mb-2">
                      {ticket.title || "Sem título"}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {ticket.assignedTo?.name || "Cliente"}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {ticket.tags?.length || 0} tags
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('pt-BR') : "N/A"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Atendente</p>
                      <p className="text-sm font-medium text-foreground">
                        {ticket.assignedTo?.name || "Não atribuído"}
                      </p>
                    </div>
                    
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
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
