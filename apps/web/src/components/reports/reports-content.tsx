"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Activity,
  Loader2
} from "lucide-react"
import { useApp } from "@/contexts/AppContext"
import { useTickets } from "@/contexts/AppContext"
import { useCampaigns } from "@/contexts/AppContext"
import { useChannels } from "@/contexts/AppContext"

export function ReportsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedType, setSelectedType] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  
  const { state } = useApp()
  const { tickets, loadTickets } = useTickets()
  const { campaigns, loadCampaigns } = useCampaigns()
  const { channels, loadChannels } = useChannels()

  useEffect(() => {
    // Carregar dados ao montar o componente
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadTickets(),
        loadCampaigns(),
        loadChannels()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadInitialData()
  }

  // Calcular métricas baseadas nos dados reais
  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t.status === 'open').length
  const closedTickets = tickets.filter(t => t.status === 'closed').length
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalChannels = channels.length
  const connectedChannels = channels.filter(c => c.status === 'connected').length
  
  // Calcular taxas de crescimento (mockado por enquanto)
  const ticketsGrowth = "+12.5%"
  const campaignsGrowth = "+8.3%"
  const channelsGrowth = "+14.2%"
  const satisfactionGrowth = "+2.1%"
  
  // Calcular satisfação baseada em tickets resolvidos
  const satisfactionRate = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "success"
      case "processing": return "warning"
      case "failed": return "destructive"
      default: return "default"
    }
  }

  if (state.loading.tickets || state.loading.campaigns || state.loading.channels || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">
              Análises e métricas do sistema
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando relatórios...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e métricas do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-midnight">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Tickets
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalTickets.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">{ticketsGrowth}</span>
              <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Campanhas Ativas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {activeCampaigns}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">{campaignsGrowth}</span>
              <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Canais Conectados
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {connectedChannels}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">{channelsGrowth}</span>
              <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Taxa de Satisfação
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {satisfactionRate}%
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">{satisfactionGrowth}</span>
              <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Período */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Período:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="tickets">Tickets</option>
            <option value="campaigns">Campanhas</option>
            <option value="channels">Canais</option>
            <option value="sla">SLA</option>
          </select>
        </div>

        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status dos Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="grid grid-cols-3 gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{openTickets}</div>
                    <div className="text-sm text-muted-foreground">Abertos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">
                      {tickets.filter(t => t.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Em Progresso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{closedTickets}</div>
                    <div className="text-sm text-muted-foreground">Fechados</div>
                  </div>
                </div>
                <p className="text-muted-foreground">Distribuição por status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status das Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{activeCampaigns}</div>
                    <div className="text-sm text-muted-foreground">Ativas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {campaigns.filter(c => c.status === 'draft').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Rascunhos</div>
                  </div>
                </div>
                <p className="text-muted-foreground">Distribuição por status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Recentes */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Tickets</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{totalTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Abertos:</span>
                  <span className="font-medium text-blue-500">{openTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fechados:</span>
                  <span className="font-medium text-green-500">{closedTickets}</span>
                </div>
              </div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Campanhas</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{totalCampaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ativas:</span>
                  <span className="font-medium text-green-500">{activeCampaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rascunhos:</span>
                  <span className="font-medium text-blue-500">
                    {campaigns.filter(c => c.status === 'draft').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Canais</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{totalChannels}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conectados:</span>
                  <span className="font-medium text-green-500">{connectedChannels}</span>
                </div>
                <div className="flex justify-between">
                  <span>WhatsApp:</span>
                  <span className="font-medium text-blue-500">
                    {channels.filter(c => c.type === 'whatsapp').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
