"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useDebounce } from "@/hooks/useDebounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Search, 
  Filter,
  Plus,
  Wifi,
  WifiOff,
  Smartphone,
  Mail,
  MessageCircle,
  QrCode,
  Settings,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  Loader2
} from "lucide-react"
import { useChannels } from "@/contexts/AppContext"
import { useApp } from "@/contexts/AppContext"
import { AddChannelModal } from "./add-channel-modal"
import { channelsService } from "@/services/api"
import { notificationService } from "@/services/notification"

export function ChannelsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredChannels, setFilteredChannels] = useState<any[]>([])
  const [connectingChannels, setConnectingChannels] = useState<Set<string>>(new Set())
  
  const { channels, loadChannels } = useChannels()
  const { state } = useApp()
  
  // Debounce para evitar requisições excessivas
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    // Carregar canais ao montar o componente
    loadChannels()
  }, [loadChannels]) // Agora loadChannels está memoizado com useCallback

  useEffect(() => {
    // Filtrar canais quando canais ou filtros mudarem (com debounce)
    filterChannels(debouncedSearchQuery, statusFilter, typeFilter)
  }, [channels, debouncedSearchQuery, statusFilter, typeFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // O filtro será aplicado automaticamente pelo useEffect com debounce
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    // O filtro será aplicado automaticamente pelo useEffect
  }

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type)
    // O filtro será aplicado automaticamente pelo useEffect
  }

  const handleConnect = async (channelId: string) => {
    setConnectingChannels(prev => new Set(prev).add(channelId))
    try {
      await channelsService.connect(channelId)
      notificationService.success("Canal conectado com sucesso!")
      loadChannels() // Recarregar para atualizar status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao conectar canal"
      notificationService.error("Erro ao conectar canal", errorMessage)
    } finally {
      setConnectingChannels(prev => {
        const newSet = new Set(prev)
        newSet.delete(channelId)
        return newSet
      })
    }
  }

  const handleDisconnect = async (channelId: string) => {
    setConnectingChannels(prev => new Set(prev).add(channelId))
    try {
      // Simular desconexão (não há endpoint específico, então vamos atualizar o status)
      await channelsService.update(channelId, { status: "disconnected" })
      notificationService.success("Canal desconectado com sucesso!")
      loadChannels() // Recarregar para atualizar status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao desconectar canal"
      notificationService.error("Erro ao desconectar canal", errorMessage)
    } finally {
      setConnectingChannels(prev => {
        const newSet = new Set(prev)
        newSet.delete(channelId)
        return newSet
      })
    }
  }

  const handleDelete = async (channelId: string) => {
    if (confirm("Tem certeza que deseja excluir este canal?")) {
      try {
        await channelsService.delete(channelId)
        notificationService.success("Canal excluído com sucesso!")
        loadChannels() // Recarregar lista
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao excluir canal"
        notificationService.error("Erro ao excluir canal", errorMessage)
      }
    }
  }

  const filterChannels = (query: string, status: string, type: string) => {
    const safeChannels = Array.isArray(channels) ? channels : []
    let filtered = safeChannels

    if (status !== "all") {
      filtered = filtered.filter(channel => channel.status === status)
    }

    if (type !== "all") {
      filtered = filtered.filter(channel => channel.type === type)
    }

    if (query) {
      filtered = filtered.filter(channel =>
        channel.name?.toLowerCase().includes(query.toLowerCase()) ||
        channel.phoneNumber?.toLowerCase().includes(query.toLowerCase()) ||
        channel.businessName?.toLowerCase().includes(query.toLowerCase())
      )
    }

    setFilteredChannels(filtered)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "connected": return "success"
      case "disconnected": return "secondary"
      case "pending": return "warning"
      default: return "default"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageCircle className="h-5 w-5" />
      case "telegram": return <MessageSquare className="h-5 w-5" />
      case "instagram": return <MessageSquare className="h-5 w-5" />
      default: return <MessageSquare className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "disconnected": return <XCircle className="h-4 w-4 text-gray-500" />
      case "pending": return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "connected": return "Conectado"
      case "disconnected": return "Desconectado"
      case "pending": return "Pendente"
      default: return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "whatsapp": return "WhatsApp"
      case "telegram": return "Telegram"
      case "instagram": return "Instagram"
      default: return type
    }
  }

  // Calcular estatísticas baseadas nos dados reais
  const safeChannels = Array.isArray(channels) ? channels : []
  const totalChannels = safeChannels.length
  const connectedChannels = safeChannels.filter(c => c.status === "connected").length
  const whatsappChannels = safeChannels.filter(c => c.type === "whatsapp").length

  if (state.loading.channels) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Canais</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os canais de comunicação
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando canais...</p>
          </div>
        </div>
      </div>
    )
  }

  // Calcular contadores para filtros
  const statusFilters = [
    { value: "all", label: "Todos", count: totalChannels },
    { value: "connected", label: "Conectados", count: connectedChannels },
    { value: "disconnected", label: "Desconectados", count: safeChannels.filter(c => c.status === "disconnected").length },
    { value: "pending", label: "Pendentes", count: safeChannels.filter(c => c.status === "pending").length },
  ]

  const typeFilters = [
    { value: "all", label: "Todos", count: totalChannels },
    { value: "whatsapp", label: "WhatsApp", count: whatsappChannels },
    { value: "telegram", label: "Telegram", count: safeChannels.filter(c => c.type === "telegram").length },
    { value: "instagram", label: "Instagram", count: safeChannels.filter(c => c.type === "instagram").length },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Canais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os canais de comunicação
          </p>
        </div>
        
        <AddChannelModal>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Canal
          </Button>
        </AddChannelModal>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Canais</p>
                <p className="text-2xl font-bold text-foreground">{totalChannels}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conectados</p>
                <p className="text-2xl font-bold text-foreground">{connectedChannels}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <p className="text-2xl font-bold text-foreground">{whatsappChannels}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outros Canais</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalChannels - whatsappChannels}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
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
              placeholder="Buscar por nome, telefone ou empresa..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status and Type filters */}
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

          <div className="flex flex-wrap gap-2">
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

      {/* Channels List */}
      <div className="space-y-4">
        {filteredChannels.length === 0 ? (
          <Card className="shadow-midnight">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum canal encontrado
              </h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Crie seu primeiro canal para começar"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredChannels.map((channel) => (
            <Card key={channel.id} className="shadow-midnight hover:shadow-midnight-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(channel.type)}
                        <Link 
                          href={`/channels/${channel.id}`}
                          className="text-lg font-semibold text-foreground hover:text-brand transition-colors"
                        >
                          {channel.name || "Sem nome"}
                        </Link>
                      </div>
                      <Badge variant={getStatusBadgeVariant(channel.status)}>
                        {getStatusLabel(channel.status)}
                      </Badge>
                      {channel.type === "whatsapp" && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <QrCode className="h-3 w-3" />
                          QR Code
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(channel.status)}
                        {getStatusLabel(channel.status)}
                      </div>
                      {channel.type === "whatsapp" && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp Business
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {channel.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Smartphone className="h-4 w-4" />
                          {channel.phoneNumber}
                        </div>
                      )}
                      {channel.businessName && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {channel.businessName}
                        </div>
                      )}
                      {channel.lastActivity && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(channel.lastActivity).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="text-sm font-medium text-foreground">{getTypeLabel(channel.type)}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/channels/${channel.id}`}>
                        <Button variant="outline" size="sm" title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {channel.status === "connected" ? (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDisconnect(channel.id)}
                          disabled={connectingChannels.has(channel.id)}
                          title="Desconectar"
                        >
                          {connectingChannels.has(channel.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <WifiOff className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleConnect(channel.id)}
                          disabled={connectingChannels.has(channel.id)}
                          title="Conectar"
                        >
                          {connectingChannels.has(channel.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wifi className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(channel.id)}
                        title="Excluir canal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
