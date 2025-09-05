"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Megaphone, 
  Search, 
  Filter,
  Plus,
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
  Loader2
} from "lucide-react"
import { useCampaigns } from "@/contexts/AppContext"
import { useApp } from "@/contexts/AppContext"

export function CampaignsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([])
  
  const { campaigns, loadCampaigns } = useCampaigns()
  const { state } = useApp()
  
  // Garantir que campaigns seja sempre um array usando useMemo para estabilizar
  const campaignsArray = useMemo(() => Array.isArray(campaigns) ? campaigns : [], [campaigns])

  useEffect(() => {
    // Carregar campanhas ao montar o componente apenas se não estiver carregando e não houver campanhas
    console.log('useEffect campanhas - loading:', state.loading.campaigns, 'length:', campaignsArray.length)
    if (!state.loading.campaigns && campaignsArray.length === 0) {
      console.log('Carregando campanhas...')
      loadCampaigns()
    }
  }, [loadCampaigns, state.loading.campaigns, campaignsArray.length])

  const filterCampaigns = useCallback((query: string, status: string, type: string) => {
    let filtered = campaignsArray

    if (status !== "all") {
      filtered = filtered.filter(campaign => campaign.status === status)
    }

    if (type !== "all") {
      filtered = filtered.filter(campaign => campaign.type === type)
    }

    if (query) {
      filtered = filtered.filter(campaign =>
        campaign.name?.toLowerCase().includes(query.toLowerCase()) ||
        campaign.targetAudience?.join(', ').toLowerCase().includes(query.toLowerCase()) ||
        campaign.id?.toString().includes(query)
      )
    }

    setFilteredCampaigns(filtered)
  }, [campaignsArray])

  useEffect(() => {
    // Filtrar campanhas quando campanhas ou filtros mudarem
    filterCampaigns(searchQuery, statusFilter, typeFilter)
  }, [filterCampaigns, searchQuery, statusFilter, typeFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterCampaigns(query, statusFilter, typeFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterCampaigns(searchQuery, status, typeFilter)
  }

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type)
    filterCampaigns(searchQuery, statusFilter, type)
  }

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
      case "support": return "success"
      case "sales": return "info"
      case "marketing": return "warning"
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativa"
      case "paused": return "Pausada"
      case "draft": return "Rascunho"
      case "completed": return "Concluída"
      default: return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "support": return "Suporte"
      case "sales": return "Vendas"
      case "marketing": return "Marketing"
      default: return type
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Calcular estatísticas baseadas nos dados reais
  const totalCampaigns = campaignsArray.length
  const activeCampaigns = campaignsArray.filter(c => c.status === "active").length
  const totalContacts = campaignsArray.reduce((sum, c) => sum + (c.metrics?.contacts || 0), 0)
  const totalBudget = campaignsArray.reduce((sum, c) => sum + (c.budget || 0), 0)

  if (state.loading.campaigns) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas campanhas de marketing e comunicação
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando campanhas...</p>
          </div>
        </div>
      </div>
    )
  }

  // Calcular contadores para filtros
  const statusFilters = [
    { value: "all", label: "Todas", count: totalCampaigns },
    { value: "active", label: "Ativas", count: activeCampaigns },
    { value: "paused", label: "Pausadas", count: campaignsArray.filter(c => c.status === "paused").length },
    { value: "draft", label: "Rascunhos", count: campaignsArray.filter(c => c.status === "draft").length },
    { value: "completed", label: "Concluídas", count: campaignsArray.filter(c => c.status === "completed").length },
  ]

  const typeFilters = [
    { value: "all", label: "Todos os Tipos" },
    { value: "support", label: "Suporte" },
    { value: "sales", label: "Vendas" },
    { value: "marketing", label: "Marketing" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas campanhas de marketing e comunicação
          </p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Campanhas</p>
                <p className="text-2xl font-bold text-foreground">{totalCampaigns}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-foreground">{activeCampaigns}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Contatos</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalContacts.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamento Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
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
              placeholder="Buscar por nome, público-alvo ou ID..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">Status:</span>
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

            {/* Type filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">Tipo:</span>
              {typeFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={typeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypeFilter(filter.value)}
                  className="flex items-center gap-2"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card className="shadow-midnight">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma campanha encontrada
              </h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Crie sua primeira campanha para começar"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="shadow-midnight hover:shadow-midnight-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(campaign.status)}
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                      </div>
                      <Badge variant={getTypeBadgeVariant(campaign.type)}>
                        {getTypeLabel(campaign.type)}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {campaign.name || "Sem nome"}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{campaign.targetAudience?.join(', ') || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{(campaign.metrics?.contacts || 0).toLocaleString()} contatos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>{formatCurrency(campaign.budget)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {campaign.status === "active" && campaign.metrics && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>Progresso</span>
                          <span>{Math.round((campaign.metrics.sent / campaign.metrics.contacts) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(campaign.metrics.sent / campaign.metrics.contacts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    {campaign.status !== "draft" && campaign.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Mensagens Enviadas</p>
                          <p className="font-medium text-foreground">{(campaign.metrics.sent || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa de Abertura</p>
                          <p className="font-medium text-foreground">{campaign.metrics.opened || 0}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa de Resposta</p>
                          <p className="font-medium text-foreground">{campaign.metrics.clicked || 0}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversões</p>
                          <p className="font-medium text-foreground">{(campaign.metrics.converted || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex gap-2">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                    
                    {campaign.status === "active" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Square className="h-4 w-4 mr-2" />
                          Finalizar
                        </Button>
                      </div>
                    )}
                    
                    {campaign.status === "paused" && (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Retomar
                      </Button>
                    )}
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