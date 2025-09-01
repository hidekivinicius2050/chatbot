"use client"

import { useState } from "react"
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
  Calendar
} from "lucide-react"

// Mock data - será substituído por API real
const mockTickets = [
  {
    id: "1234",
    title: "Problema com login no app",
    status: "open" as const,
    priority: "high" as const,
    customer: "João Silva",
    agent: "Maria Santos",
    lastMessage: "2 min atrás",
    messages: 8,
    sla: "normal" as const,
    slaTime: "2h restantes",
  },
  {
    id: "1235",
    title: "Dúvida sobre faturamento",
    status: "pending" as const,
    priority: "medium" as const,
    customer: "Ana Costa",
    agent: "João Silva",
    lastMessage: "15 min atrás",
    messages: 5,
    sla: "warning" as const,
    slaTime: "30m restantes",
  },
  {
    id: "1236",
    title: "Erro ao fazer upload",
    status: "closed" as const,
    priority: "low" as const,
    customer: "Pedro Santos",
    agent: "Maria Santos",
    lastMessage: "1h atrás",
    messages: 12,
    sla: "normal" as const,
    slaTime: "Resolvido",
  },
]

const statusFilters = [
  { value: "all", label: "Todos", count: mockTickets.length },
  { value: "open", label: "Abertos", count: mockTickets.filter(t => t.status === "open").length },
  { value: "pending", label: "Pendentes", count: mockTickets.filter(t => t.status === "pending").length },
  { value: "closed", label: "Fechados", count: mockTickets.filter(t => t.status === "closed").length },
]

export function TicketsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredTickets, setFilteredTickets] = useState(mockTickets)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterTickets(query, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterTickets(searchQuery, status)
  }

  const filterTickets = (query: string, status: string) => {
    let filtered = mockTickets

    if (status !== "all") {
      filtered = filtered.filter(ticket => ticket.status === status)
    }

    if (query) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(query.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(query.toLowerCase()) ||
        ticket.id.includes(query)
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

  const getSLABadgeVariant = (sla: string) => {
    switch (sla) {
      case "normal": return "sla_normal"
      case "warning": return "sla_warning"
      case "critical": return "sla_critical"
      default: return "default"
    }
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
                        {ticket.status === "open" && "Aberto"}
                        {ticket.status === "pending" && "Pendente"}
                        {ticket.status === "closed" && "Fechado"}
                      </Badge>
                      <Badge variant={getSLABadgeVariant(ticket.sla)}>
                        {ticket.slaTime}
                      </Badge>
                    </div>
                    
                    <h3 className="text-base font-medium text-foreground mb-2">
                      {ticket.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {ticket.customer}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {ticket.messages} mensagens
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {ticket.lastMessage}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Atendente</p>
                      <p className="text-sm font-medium text-foreground">{ticket.agent}</p>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tickets/${ticket.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
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
