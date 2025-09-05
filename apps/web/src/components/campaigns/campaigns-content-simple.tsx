"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Megaphone, 
  Plus,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Loader2
} from "lucide-react"
import { useCampaigns } from "@/contexts/AppContext"
import { notificationService } from "@/services/notifications"
import { CreateCampaignModal } from "./create-campaign-modal"
import { CampaignDetailsModal } from "./campaign-details-modal"

export function CampaignsContentSimple() {
  const { campaigns, loading, error, loadCampaigns } = useCampaigns()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  useEffect(() => {
    console.log('Componente montado, carregando campanhas...')
    loadCampaigns()
  }, [loadCampaigns])

  console.log('Renderizando campanhas:', { campaigns, loading, error })

  // Filtrar campanhas
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesType = typeFilter === "all" || campaign.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Ações das campanhas
  const handleCampaignAction = async (campaignId: string, action: string) => {
    setActionLoading(campaignId)
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      notificationService.success(`Campanha ${action} com sucesso!`)
      loadCampaigns() // Recarregar dados
    } catch (error) {
      notificationService.error(`Erro ao ${action} campanha`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      setActionLoading(campaignId)
      try {
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        notificationService.success('Campanha excluída com sucesso!')
        loadCampaigns() // Recarregar dados
      } catch (error) {
        notificationService.error('Erro ao excluir campanha')
      } finally {
        setActionLoading(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando campanhas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={loadCampaigns}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de marketing e comunicação
          </p>
        </div>
        <CreateCampaignModal onCampaignCreated={loadCampaigns} />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
            <option value="completed">Concluída</option>
            <option value="scheduled">Agendada</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="broadcast">Broadcast</option>
            <option value="segmented">Segmentada</option>
            <option value="scheduled">Agendada</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredCampaigns.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === 'active').length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pausadas</CardTitle>
            <Pause className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredCampaigns.filter(c => c.status === 'paused').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === 'paused').length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <Square className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredCampaigns.filter(c => c.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === 'completed').length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {campaigns.length === 0 ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha corresponde aos filtros'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {campaigns.length === 0 
                  ? 'Crie sua primeira campanha para começar a engajar seus clientes'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              <CreateCampaignModal onCampaignCreated={loadCampaigns} />
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {campaign.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      campaign.status === 'active' ? 'default' :
                      campaign.status === 'paused' ? 'secondary' :
                      campaign.status === 'completed' ? 'outline' : 'secondary'
                    }>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline">
                      {campaign.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Enviados: {campaign.metrics.sent}</span>
                    <span>Entregues: {campaign.metrics.delivered}</span>
                    <span>Taxa de abertura: {campaign.metrics.opened}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Ações baseadas no status */}
                    {campaign.status === 'draft' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'iniciada')}
                        disabled={actionLoading === campaign.id}
                      >
                        {actionLoading === campaign.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'pausada')}
                        disabled={actionLoading === campaign.id}
                      >
                        {actionLoading === campaign.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Pause className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'retomada')}
                        disabled={actionLoading === campaign.id}
                      >
                        {actionLoading === campaign.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {(campaign.status === 'active' || campaign.status === 'paused') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'finalizada')}
                        disabled={actionLoading === campaign.id}
                      >
                        {actionLoading === campaign.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <CampaignDetailsModal campaign={campaign} />
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      disabled={actionLoading === campaign.id}
                    >
                      {actionLoading === campaign.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
