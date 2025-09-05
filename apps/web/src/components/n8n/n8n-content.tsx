"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Workflow,
  Play,
  Pause,
  Settings,
  Plus,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  GitBranch,
  Clock,
  Activity
} from "lucide-react"
import { n8nService, N8NWorkflow, N8NExecution } from "@/services/n8n"
import { useToastNotifications } from "@/components/ui/toast"
import { useLogger } from "@/utils/logger"
import { useConnectivity } from "@/utils/connectivity"
import { Loading, PageLoading } from "@/components/ui/loading"

export default function N8NContent() {
  const [workflows, setWorkflows] = useState<N8NWorkflow[]>([])
  const [executions, setExecutions] = useState<N8NExecution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [n8nUrl, setN8nUrl] = useState('http://localhost:5678')
  const [apiKey, setApiKey] = useState('')
  
  const toast = useToastNotifications()
  const logger = useLogger('N8NContent')
  const connectivity = useConnectivity()

  useEffect(() => {
    loadN8NData()
  }, [])

  const loadN8NData = async () => {
    setIsLoading(true)
    try {
      // Testar conexão
      const connected = await n8nService.testConnection()
      setIsConnected(connected)
      
      if (connected) {
        // Carregar workflows
        const workflowsData = await n8nService.getWorkflows()
        setWorkflows(workflowsData)
        
        // Carregar execuções recentes
        const executionsData = await n8nService.getExecutions(undefined, 10)
        setExecutions(executionsData)
        
        logger.info('Dados N8N carregados com sucesso', { 
          workflows: workflowsData.length,
          executions: executionsData.length 
        })
      } else {
        toast.warning('N8N não conectado', 'Verifique se o N8N está rodando e acessível')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Erro ao carregar dados N8N', { error: errorMessage })
      toast.error('Erro ao conectar N8N', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      // Atualizar configuração
      process.env.NEXT_PUBLIC_N8N_URL = n8nUrl
      process.env.NEXT_PUBLIC_N8N_API_KEY = apiKey
      
      const connected = await n8nService.testConnection()
      setIsConnected(connected)
      
      if (connected) {
        toast.success('Conectado ao N8N!', 'Conexão estabelecida com sucesso')
        await loadN8NData()
      } else {
        toast.error('Falha na conexão', 'Verifique a URL e API Key do N8N')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro de conexão', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivateWorkflow = async (workflowId: string) => {
    try {
      await n8nService.activateWorkflow(workflowId)
      toast.success('Workflow ativado!', 'O workflow foi ativado com sucesso')
      await loadN8NData()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao ativar workflow', errorMessage)
    }
  }

  const handleDeactivateWorkflow = async (workflowId: string) => {
    try {
      await n8nService.deactivateWorkflow(workflowId)
      toast.success('Workflow desativado!', 'O workflow foi desativado com sucesso')
      await loadN8NData()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao desativar workflow', errorMessage)
    }
  }

  const handleCreateTemplate = async (templateId: string) => {
    try {
      const templates = await n8nService.getChatbotTemplates()
      const template = templates.find(t => t.id === templateId)
      
      if (template) {
        await n8nService.createWorkflow(template)
        toast.success('Template criado!', 'Workflow criado a partir do template')
        await loadN8NData()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao criar template', errorMessage)
    }
  }

  if (isLoading && workflows.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Integração N8N</h1>
            <p className="text-muted-foreground">
              Gerencie workflows automatizados para seu chatbot
            </p>
          </div>
        </div>
        <PageLoading />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integração N8N</h1>
          <p className="text-muted-foreground">
            Gerencie workflows automatizados para seu chatbot
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Conectado ao N8N' : 'Desconectado do N8N'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadN8NData} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Button onClick={() => window.open(n8nUrl, '_blank')} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir N8N
          </Button>
        </div>
      </div>

      {/* Configuração de Conexão */}
      {!isConnected && (
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  URL do N8N
                </label>
                <Input
                  value={n8nUrl}
                  onChange={(e) => setN8nUrl(e.target.value)}
                  placeholder="http://localhost:5678"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  API Key (opcional)
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Sua API Key do N8N"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Conectar ao N8N
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Templates de Workflows */}
      {isConnected && (
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Templates de Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Fluxo de Boas-vindas</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Fluxo automático de boas-vindas para novos usuários do WhatsApp
                </p>
                <Button 
                  size="sm" 
                  onClick={() => handleCreateTemplate('chatbot-welcome-flow')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Workflow
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Resposta com IA</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Fluxo para processar mensagens com OpenAI e enviar respostas
                </p>
                <Button 
                  size="sm" 
                  onClick={() => handleCreateTemplate('chatbot-ai-response')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflows Ativos */}
      {isConnected && (
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflows ({workflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum workflow encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Crie workflows usando os templates acima
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${workflow.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.nodes.length} nós • Atualizado em {new Date(workflow.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.active ? "default" : "secondary"}>
                        {workflow.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {workflow.active ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeactivateWorkflow(workflow.id)}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleActivateWorkflow(workflow.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Ativar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Execuções Recentes */}
      {isConnected && executions.length > 0 && (
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Execuções Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executions.slice(0, 5).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      execution.status === 'success' ? 'bg-green-500' :
                      execution.status === 'error' ? 'bg-red-500' :
                      execution.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">Workflow {execution.workflowId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(execution.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    execution.status === 'success' ? "default" :
                    execution.status === 'error' ? "destructive" :
                    execution.status === 'running' ? "secondary" : "outline"
                  }>
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status de Conectividade */}
      <Card className="shadow-midnight">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status da Conexão</p>
              <p className="text-2xl font-bold text-foreground">
                {isConnected ? "Conectado" : "Desconectado"}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isConnected ? "bg-green-500/10" : "bg-red-500/10"
            }`}>
              {isConnected ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
