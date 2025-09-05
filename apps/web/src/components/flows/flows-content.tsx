"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Copy,
  Settings,
  Eye,
  Download,
  Upload,
  Save,
  Zap,
  MessageSquare,
  Image,
  Video,
  Mic,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Loader2
} from "lucide-react"
import { useFlows } from "@/contexts/AppContext"
import { useApp } from "@/contexts/AppContext"
import { flowsService } from "@/services/api"
import { notificationService } from "@/services/notification"
import { CreateFlowModal } from "./create-flow-modal"
import Link from "next/link"

const flowTypes = [
  { id: "support", name: "Suporte", icon: MessageSquare, color: "blue" },
  { id: "sales", name: "Vendas", icon: Zap, color: "green" },
  { id: "appointment", name: "Agendamento", icon: Clock, color: "purple" },
  { id: "marketing", name: "Marketing", icon: Users, color: "orange" }
]

export function FlowsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())
  const [createModalOpen, setCreateModalOpen] = useState(false)
  
  const { flows, loadFlows } = useFlows()
  const { state } = useApp()

  useEffect(() => {
    // Carregar fluxos ao montar o componente apenas se não estiver carregando e não houver fluxos
    if (!state.loading.flows && flows.length === 0) {
    loadFlows()
    }
  }, []) // Removido as dependências que causavam loop infinito

  // Funções de ação
  const handleActivate = async (flowId: string) => {
    setLoadingActions(prev => new Set(prev).add(`activate-${flowId}`))
    try {
      await flowsService.activate(flowId)
      notificationService.success('Fluxo ativado com sucesso!')
      loadFlows() // Recarregar lista
    } catch (error) {
      notificationService.error('Erro ao ativar fluxo', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(`activate-${flowId}`)
        return newSet
      })
    }
  }

  const handlePause = async (flowId: string) => {
    setLoadingActions(prev => new Set(prev).add(`pause-${flowId}`))
    try {
      await flowsService.pause(flowId)
      notificationService.success('Fluxo pausado com sucesso!')
      loadFlows() // Recarregar lista
    } catch (error) {
      notificationService.error('Erro ao pausar fluxo', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(`pause-${flowId}`)
        return newSet
      })
    }
  }

  const handleDuplicate = async (flowId: string) => {
    setLoadingActions(prev => new Set(prev).add(`duplicate-${flowId}`))
    try {
      await flowsService.duplicate(flowId)
      notificationService.success('Fluxo duplicado com sucesso!')
      loadFlows() // Recarregar lista
    } catch (error) {
      notificationService.error('Erro ao duplicar fluxo', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(`duplicate-${flowId}`)
        return newSet
      })
    }
  }

  const handleDelete = async (flowId: string) => {
    if (!confirm('Tem certeza que deseja excluir este fluxo? Esta ação não pode ser desfeita.')) {
      return
    }

    setLoadingActions(prev => new Set(prev).add(`delete-${flowId}`))
    try {
      await flowsService.delete(flowId)
      notificationService.success('Fluxo excluído com sucesso!')
      loadFlows() // Recarregar lista
    } catch (error) {
      notificationService.error('Erro ao excluir fluxo', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(`delete-${flowId}`)
        return newSet
      })
    }
  }

  const handleCreateFlow = () => {
    setCreateModalOpen(true)
  }

  const handleImportFlow = () => {
    // TODO: Implementar importação de fluxos
    notificationService.info('Funcionalidade em desenvolvimento', 'A importação de fluxos será implementada em breve')
  }

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flow.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || flow.type === selectedType
    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "paused": return "bg-yellow-100 text-yellow-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo"
      case "paused": return "Pausado"
      case "draft": return "Rascunho"
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    const flowType = flowTypes.find(t => t.id === type)
    if (!flowType) return MessageSquare
    return flowType.icon
  }

  const getTypeColor = (type: string) => {
    const flowType = flowTypes.find(t => t.id === type)
    if (!flowType) return "text-gray-600"
    return `text-${flowType.color}-600`
  }

  const getTypeLabel = (type: string) => {
    const flowType = flowTypes.find(t => t.id === type)
    return flowType ? flowType.name : type
  }

  if (state.loading.flows) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fluxos de Conversa</h1>
            <p className="text-muted-foreground">
              Crie e gerencie fluxos automatizados para suas conversas
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando fluxos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxos de Conversa</h1>
          <p className="text-muted-foreground">
            Crie e gerencie fluxos automatizados para suas conversas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleImportFlow}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleCreateFlow}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fluxo
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card className="shadow-midnight">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar fluxos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                Lista
              </Button>
            </div>
          </div>
          
          {/* Filtros por tipo */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              Todos ({flows.length})
            </Button>
            {flowTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.id)}
              >
                <type.icon className="h-4 w-4 mr-2" />
                {type.name} ({flows.filter(f => f.type === type.id).length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fluxos */}
      {filteredFlows.length === 0 ? (
        <Card className="text-center py-12 shadow-midnight">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum fluxo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedType !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Crie seu primeiro fluxo para começar a automatizar suas conversas"
              }
            </p>
            <Button onClick={handleCreateFlow}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Fluxo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlows.map((flow) => (
            <Card key={flow.id} className="hover:shadow-midnight-lg transition-shadow shadow-midnight">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(flow.type)} bg-gray-50`}>
                      {React.createElement(getTypeIcon(flow.type), { className: "h-5 w-5" })}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{flow.name || "Sem nome"}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {flow.description || "Sem descrição"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Link href={`/flows/${flow.id}/builder`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status e Tags */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(flow.status)}>
                    {getStatusLabel(flow.status)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {flow.tags?.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {flow.tags && flow.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{flow.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {flow.steps?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Passos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {flow.metrics?.contacts || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Contatos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {flow.metrics?.conversion || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Conversão</div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Modificado em {flow.updatedAt ? 
                      new Date(flow.updatedAt).toLocaleDateString('pt-BR') : 
                      "N/A"
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    {flow.status === "active" ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePause(flow.id)}
                        disabled={loadingActions.has(`pause-${flow.id}`)}
                      >
                        {loadingActions.has(`pause-${flow.id}`) ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                        <Pause className="h-4 w-4 mr-1" />
                        )}
                        Pausar
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleActivate(flow.id)}
                        disabled={loadingActions.has(`activate-${flow.id}`)}
                      >
                        {loadingActions.has(`activate-${flow.id}`) ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                        <Play className="h-4 w-4 mr-1" />
                        )}
                        Ativar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDuplicate(flow.id)}
                      disabled={loadingActions.has(`duplicate-${flow.id}`)}
                    >
                      {loadingActions.has(`duplicate-${flow.id}`) ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                      <Copy className="h-4 w-4 mr-1" />
                      )}
                      Duplicar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(flow.id)}
                      disabled={loadingActions.has(`delete-${flow.id}`)}
                    >
                      {loadingActions.has(`delete-${flow.id}`) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                      <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas Gerais */}
      {flows.length > 0 && (
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle>Resumo dos Fluxos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{flows.length}</div>
                <div className="text-sm text-muted-foreground">Total de Fluxos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {flows.filter(f => f.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {flows.filter(f => f.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Rascunhos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {flows.filter(f => f.status === 'paused').length}
                </div>
                <div className="text-sm text-muted-foreground">Pausados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação */}
      <CreateFlowModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFlowCreated={loadFlows}
      />
    </div>
  )
}
