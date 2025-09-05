"use client"

import React, { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/ui/file-upload"
import {
  Save,
  Play,
  Search,
  Zap,
  MessageSquare,
  Image,
  MapPin,
  ClipboardList,
  Clock,
  CheckSquare,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowLeft,
  Bot,
  Tv,
  Wifi
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipos
interface FlowNode {
  id: string
  type: 'trigger' | 'message' | 'media' | 'location' | 'input' | 'condition' | 'delay' | 'action' | 'chatgpt' | 'tv_brand' | 'iptv_consultation'
  position: { x: number; y: number }
  data: any
  connections?: string[]
}

interface Flow {
  id: string
  name: string
  nodes: FlowNode[]
  edges: Array<{ from: string; to: string }>
}

// Dados mock
const mockFlow: Flow = {
  id: "cmf5tkhh300032tkayeucflfg",
  name: "Atendimento Inicial",
  nodes: [
    {
      id: "node-1",
      type: "trigger",
      position: { x: 100, y: 100 },
      data: { trigger: "inbound.message" }
    },
    {
      id: "node-2", 
      type: "message",
      position: { x: 300, y: 100 },
      data: { text: "Olá! Como posso ajudá-lo?" },
      connections: ["node-3"]
    },
    {
      id: "node-3",
      type: "condition", 
      position: { x: 500, y: 100 },
      data: { condition: "contains", value: "ajuda" },
      connections: ["node-4"]
    },
    {
      id: "node-4",
      type: "message",
      position: { x: 300, y: 250 },
      data: { text: "Vou transferir você para um atendente." }
    }
  ],
  edges: [
    { from: "node-1", to: "node-2" },
    { from: "node-2", to: "node-3" },
    { from: "node-3", to: "node-4" }
  ]
}

// Funções auxiliares
const getNodeIcon = (type: string) => {
  const icons = {
    trigger: Zap,
    message: MessageSquare,
    media: Image,
    location: MapPin,
    input: ClipboardList,
    condition: CheckSquare,
    delay: Clock,
    action: Settings,
    chatgpt: Bot,
    tv_brand: Tv,
    iptv_consultation: Wifi
  }
  return icons[type as keyof typeof icons] || Settings
}

const getNodeColor = (type: string) => {
  const colors = {
    trigger: "bg-blue-500",
    message: "bg-green-500", 
    media: "bg-purple-500",
    location: "bg-orange-500",
    input: "bg-yellow-500",
    condition: "bg-red-500",
    delay: "bg-gray-500",
    action: "bg-indigo-500",
    chatgpt: "bg-cyan-500",
    tv_brand: "bg-pink-500",
    iptv_consultation: "bg-emerald-500"
  }
  return colors[type as keyof typeof colors] || "bg-gray-500"
}

const getNodeName = (type: string) => {
  const names = {
    trigger: "Gatilho",
    message: "Mensagem",
    media: "Mídia", 
    location: "Localização",
    input: "Entrada",
    condition: "Condição",
    delay: "Atraso",
    action: "Ação",
    chatgpt: "ChatGPT",
    tv_brand: "Marca TV",
    iptv_consultation: "Consulta IPTV"
  }
  return names[type as keyof typeof names] || "Nó"
}

// Componente de edição de nó
interface NodeEditDialogProps {
  node: FlowNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (nodeId: string, data: any) => void
}

function NodeEditDialog({ node, open, onOpenChange, onSave }: NodeEditDialogProps) {
  const [formData, setFormData] = useState<any>({})

  React.useEffect(() => {
    if (node) {
      setFormData(node.data || {})
    }
  }, [node])

  const handleSave = () => {
    if (node) {
      onSave(node.id, formData)
      onOpenChange(false)
    }
  }

  const renderForm = () => {
    if (!node) return null

    switch (node.type) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Texto da Mensagem</Label>
              <Textarea
                id="text"
                value={formData.text || ''}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Digite a mensagem que será enviada..."
                rows={4}
              />
            </div>
          </div>
        )
      
      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Tipo de Condição</Label>
              <Select 
                value={formData.condition || ''} 
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contém texto</SelectItem>
                  <SelectItem value="equals">Igual a</SelectItem>
                  <SelectItem value="startsWith">Começa com</SelectItem>
                  <SelectItem value="endsWith">Termina com</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Digite o valor para comparação..."
              />
            </div>
          </div>
        )

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                placeholder="Digite a duração em segundos..."
              />
            </div>
          </div>
        )

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">Pergunta</Label>
              <Input
                id="prompt"
                value={formData.prompt || ''}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Digite a pergunta..."
              />
            </div>
            <div>
              <Label htmlFor="variable">Nome da Variável</Label>
              <Input
                id="variable"
                value={formData.variable || ''}
                onChange={(e) => setFormData({ ...formData, variable: e.target.value })}
                placeholder="Ex: nome, email, telefone..."
              />
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mediaType">Tipo de Mídia</Label>
              <Select 
                value={formData.mediaType || ''} 
                onValueChange={(value) => setFormData({ ...formData, mediaType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mídia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="audio">Áudio</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Arquivo de Mídia</Label>
              <FileUpload
                onFileSelect={(file) => {
                  setFormData({ 
                    ...formData, 
                    uploadedFile: file,
                    filename: file.name,
                    mediaUrl: URL.createObjectURL(file) // URL temporária para preview
                  })
                }}
                onFileRemove={() => {
                  setFormData({ 
                    ...formData, 
                    uploadedFile: null,
                    filename: '',
                    mediaUrl: ''
                  })
                }}
                selectedFile={formData.uploadedFile}
                acceptedTypes={
                  formData.mediaType === 'image' ? ['image/*'] :
                  formData.mediaType === 'video' ? ['video/*'] :
                  formData.mediaType === 'audio' ? ['audio/*'] :
                  formData.mediaType === 'document' ? ['application/pdf'] :
                  ['image/*', 'video/*', 'audio/*', 'application/pdf']
                }
                maxSize={formData.mediaType === 'video' ? 50 : 10} // Vídeos podem ser maiores
              />
            </div>

            <div>
              <Label htmlFor="caption">Legenda (opcional)</Label>
              <Textarea
                id="caption"
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Digite uma legenda para a mídia..."
                rows={3}
              />
            </div>

            {formData.uploadedFile && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Arquivo selecionado:</p>
                <p className="text-xs text-blue-600 mt-1">
                  {formData.uploadedFile.name} • {(formData.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  O arquivo será enviado automaticamente quando o fluxo for executado.
                </p>
              </div>
            )}
          </div>
        )

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                placeholder="-23.5505"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                placeholder="-46.6333"
              />
            </div>
            <div>
              <Label htmlFor="name">Nome do Local</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Shopping Center, Restaurante..."
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade..."
              />
            </div>
          </div>
        )

      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="actionType">Tipo de Ação</Label>
              <Select 
                value={formData.actionType || ''} 
                onValueChange={(value) => setFormData({ ...formData, actionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="api">Chamada de API</SelectItem>
                  <SelectItem value="database">Operação no Banco</SelectItem>
                  <SelectItem value="email">Enviar Email</SelectItem>
                  <SelectItem value="sms">Enviar SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">URL/Endpoint</Label>
              <Input
                id="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://api.exemplo.com/webhook"
              />
            </div>
            <div>
              <Label htmlFor="method">Método HTTP</Label>
              <Select 
                value={formData.method || 'POST'} 
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Textarea
                id="headers"
                value={formData.headers || ''}
                onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="body">Body (JSON)</Label>
              <Textarea
                id="body"
                value={formData.body || ''}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder='{"message": "Hello World", "user": "{{user_id}}"}'
                rows={4}
              />
            </div>
          </div>
        )

      case 'trigger':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="triggerType">Tipo de Gatilho</Label>
              <Select 
                value={formData.triggerType || ''} 
                onValueChange={(value) => setFormData({ ...formData, triggerType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de gatilho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">Nova Mensagem</SelectItem>
                  <SelectItem value="keyword">Palavra-chave</SelectItem>
                  <SelectItem value="time">Horário Específico</SelectItem>
                  <SelectItem value="event">Evento do Sistema</SelectItem>
                  <SelectItem value="webhook">Webhook Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.triggerType === 'keyword' && (
              <div>
                <Label htmlFor="keywords">Palavras-chave</Label>
                <Input
                  id="keywords"
                  value={formData.keywords || ''}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="oi, olá, help (separadas por vírgula)"
                />
              </div>
            )}
            {formData.triggerType === 'time' && (
              <div>
                <Label htmlFor="schedule">Horário</Label>
                <Input
                  id="schedule"
                  type="time"
                  value={formData.schedule || ''}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva quando este gatilho deve ser ativado..."
                rows={3}
              />
            </div>
          </div>
        )

      case 'chatgpt':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="profileId">Perfil ChatGPT</Label>
              <Select 
                value={formData.profileId || ''} 
                onValueChange={(value) => setFormData({ ...formData, profileId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil de IA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suporte-tecnico">Suporte Técnico IPTV</SelectItem>
                  <SelectItem value="instalacao-apps">Instalação de Apps</SelectItem>
                  <SelectItem value="vendas-planos">Vendas e Planos</SelectItem>
                  <SelectItem value="configuracao-dispositivos">Configuração de Dispositivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="systemPrompt">Prompt Personalizado (opcional)</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt || ''}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Digite um prompt personalizado para este nó específico..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperatura (0.0 - 1.0)</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature || '0.7'}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                placeholder="0.7"
              />
            </div>
            <div>
              <Label htmlFor="maxTokens">Máximo de Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={formData.maxTokens || '500'}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                placeholder="500"
              />
            </div>
          </div>
        )

      case 'tv_brand':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Pergunta para o Cliente</Label>
              <Textarea
                id="question"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Qual marca de TV você possui? (LG, Samsung, Roku, etc.)"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="validationMessage">Mensagem de Validação</Label>
              <Textarea
                id="validationMessage"
                value={formData.validationMessage || ''}
                onChange={(e) => setFormData({ ...formData, validationMessage: e.target.value })}
                placeholder="Por favor, diga apenas o nome da marca da sua TV"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="successMessage">Mensagem de Sucesso</Label>
              <Textarea
                id="successMessage"
                value={formData.successMessage || ''}
                onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                placeholder="Perfeito! Você tem uma TV {brand}. Vou te ajudar com as instruções específicas."
                rows={2}
              />
            </div>
          </div>
        )

      case 'iptv_consultation':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="consultationType">Tipo de Consulta</Label>
              <Select 
                value={formData.consultationType || ''} 
                onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test_credentials">Gerar Credenciais de Teste</SelectItem>
                  <SelectItem value="check_status">Verificar Status do Usuário</SelectItem>
                  <SelectItem value="user_info">Informações do Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="successMessage">Mensagem de Sucesso</Label>
              <Textarea
                id="successMessage"
                value={formData.successMessage || ''}
                onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                placeholder="Perfeito! Vou gerar suas credenciais de teste agora..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="errorMessage">Mensagem de Erro</Label>
              <Textarea
                id="errorMessage"
                value={formData.errorMessage || ''}
                onChange={(e) => setFormData({ ...formData, errorMessage: e.target.value })}
                placeholder="Você já utilizou o teste gratuito anteriormente. Entre em contato conosco para conhecer nossos planos!"
                rows={2}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Configurações não disponíveis para este tipo de nó.</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar {getNodeName(node?.type || '')}</DialogTitle>
          <DialogDescription>
            Configure as propriedades deste nó do fluxo.
          </DialogDescription>
        </DialogHeader>
        
        {renderForm()}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente principal
export function FlowBuilder() {
  const [flow, setFlow] = useState<Flow>(mockFlow)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [draggedConnection, setDraggedConnection] = useState<{from: string, to?: string} | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Função para voltar para a lista de fluxos
  const handleGoBack = () => {
    window.history.back()
  }

  // Função para salvar dados do nó
  const handleNodeSave = useCallback((nodeId: string, data: any) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    }))
  }, [])

  // Função para editar nó
  const handleEditNode = (node: FlowNode) => {
    setSelectedNode(node)
    setEditDialogOpen(true)
  }

  // Função para adicionar novo nó
  const handleAddNode = (type: FlowNode['type']) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {}
    }
    
    setFlow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
  }

  // Função para deletar nó
  const handleDeleteNode = (nodeId: string) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId)
    }))
  }

  // Função para adicionar conexão
  const handleAddConnection = (fromNodeId: string, toNodeId: string) => {
    // Verificar se já existe conexão
    const existingConnection = flow.edges.find(edge => edge.from === fromNodeId && edge.to === toNodeId)
    if (existingConnection) return

    setFlow(prev => ({
      ...prev,
      edges: [...prev.edges, { from: fromNodeId, to: toNodeId }]
    }))
  }

  // Função para remover conexão
  const handleRemoveConnection = (fromNodeId: string, toNodeId: string) => {
    setFlow(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => !(edge.from === fromNodeId && edge.to === toNodeId))
    }))
  }

  // Função para iniciar drag de conexão
  const handleConnectionDragStart = (fromNodeId: string) => {
    setDraggedConnection({ from: fromNodeId })
  }

  // Função para finalizar drag de conexão
  const handleConnectionDragEnd = (toNodeId: string) => {
    if (draggedConnection && draggedConnection.from !== toNodeId) {
      handleAddConnection(draggedConnection.from, toNodeId)
    }
    setDraggedConnection(null)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedNode(nodeId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedNode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === draggedNode
          ? { ...node, position: { x, y } }
          : node
      )
    }))

    setDraggedNode(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Elementos</h2>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {/* Elementos disponíveis */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Adicionar Nó</h3>
            {[
              { type: 'trigger', name: 'Gatilho', icon: Zap, desc: 'Início do fluxo' },
              { type: 'message', name: 'Mensagem', icon: MessageSquare, desc: 'Enviar mensagem' },
              { type: 'media', name: 'Mídia', icon: Image, desc: 'Imagem, vídeo ou áudio' },
              { type: 'location', name: 'Localização', icon: MapPin, desc: 'Enviar localização' },
              { type: 'input', name: 'Entrada', icon: ClipboardList, desc: 'Coletar dados' },
              { type: 'condition', name: 'Condição', icon: CheckSquare, desc: 'Tomar decisão' },
              { type: 'delay', name: 'Atraso', icon: Clock, desc: 'Aguardar tempo' },
              { type: 'action', name: 'Ação', icon: Settings, desc: 'Executar ação' },
              { type: 'chatgpt', name: 'ChatGPT', icon: Bot, desc: 'Conversa com IA especializada' },
              { type: 'tv_brand', name: 'Marca TV', icon: Tv, desc: 'Identificar marca de TV' },
              { type: 'iptv_consultation', name: 'Consulta IPTV', icon: Wifi, desc: 'Consultar sistema IPTV' }
            ].map(({ type, name, icon: Icon, desc }) => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleAddNode(type as FlowNode['type'])}
              >
                <Icon className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </Button>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Instruções de conexão */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Como Conectar</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Arraste o ponto azul para conectar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Solte no ponto verde</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Clique no X para deletar</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Propriedades do nó selecionado */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Propriedades</h3>
            {selectedNode ? (
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const Icon = getNodeIcon(selectedNode.type)
                      return <Icon className="h-4 w-4" />
                    })()}
                    <span className="font-medium">{getNodeName(selectedNode.type)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedNode.type === 'message' && selectedNode.data?.text && (
                      <div>Texto: {selectedNode.data.text}</div>
                    )}
                    {selectedNode.type === 'condition' && selectedNode.data?.condition && (
                      <div>Condição: {selectedNode.data.condition}</div>
                    )}
                    {selectedNode.type === 'delay' && selectedNode.data?.duration && (
                      <div>Duração: {selectedNode.data.duration}s</div>
                    )}
                    {selectedNode.type === 'input' && selectedNode.data?.prompt && (
                      <div>Pergunta: {selectedNode.data.prompt}</div>
                    )}
                    {selectedNode.type === 'media' && selectedNode.data?.uploadedFile && (
                      <div>
                        <div>Arquivo: {selectedNode.data.uploadedFile.name}</div>
                        <div>Tipo: {selectedNode.data.mediaType}</div>
                        {selectedNode.data.caption && (
                          <div>Legenda: {selectedNode.data.caption}</div>
                        )}
                      </div>
                    )}
                    {selectedNode.type === 'location' && selectedNode.data?.name && (
                      <div>Local: {selectedNode.data.name}</div>
                    )}
                    {selectedNode.type === 'action' && selectedNode.data?.actionType && (
                      <div>Ação: {selectedNode.data.actionType}</div>
                    )}
                    {selectedNode.type === 'trigger' && selectedNode.data?.triggerType && (
                      <div>Gatilho: {selectedNode.data.triggerType}</div>
                    )}
                    {selectedNode.type === 'chatgpt' && selectedNode.data?.profileId && (
                      <div>Perfil: {selectedNode.data.profileId}</div>
                    )}
                    {selectedNode.type === 'tv_brand' && selectedNode.data?.question && (
                      <div>Pergunta: {selectedNode.data.question}</div>
                    )}
                    {selectedNode.type === 'iptv_consultation' && selectedNode.data?.consultationType && (
                      <div>Consulta: {selectedNode.data.consultationType}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditNode(selectedNode)}>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteNode(selectedNode.id)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Selecione um nó para ver suas propriedades</p>
            )}
          </div>
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold">{flow.name}</h1>
              <Badge variant="outline">Rascunho</Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Testar
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Nós */}
          {flow.nodes.map((node) => {
            const Icon = getNodeIcon(node.type)
            const isHovered = hoveredNode === node.id
            const isDraggingConnection = draggedConnection?.from === node.id
            
            return (
              <div
                key={node.id}
                className={`absolute w-32 h-20 bg-white border-2 rounded-lg shadow-sm cursor-move transition-all ${
                  selectedNode?.id === node.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                } ${isHovered ? 'border-green-400' : ''} ${isDraggingConnection ? 'border-purple-500' : ''}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, node.id)}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className={`w-6 h-6 rounded-full ${getNodeColor(node.type)} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-xs font-medium">{getNodeName(node.type)}</div>
                  </div>
                </div>
                
                {/* Handle de conexão de saída */}
                <div 
                  className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white cursor-crosshair transition-all ${
                    isDraggingConnection ? 'bg-purple-500 scale-125' : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
                  }`}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation()
                    handleConnectionDragStart(node.id)
                  }}
                  onDragEnd={() => setDraggedConnection(null)}
                  title="Arraste para conectar com outro nó"
                ></div>

                {/* Handle de conexão de entrada */}
                <div 
                  className={`absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white transition-all ${
                    isHovered ? 'bg-green-500 scale-110' : 'bg-gray-400'
                  }`}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedConnection) {
                      handleConnectionDragEnd(node.id)
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  title="Soltar conexão aqui"
                ></div>

                {/* Botão de deletar conexões */}
                {selectedNode?.id === node.id && (
                  <div className="absolute -top-2 -right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-6 h-6 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Remover todas as conexões deste nó
                        setFlow(prev => ({
                          ...prev,
                          edges: prev.edges.filter(edge => edge.from !== node.id && edge.to !== node.id)
                        }))
                      }}
                      title="Remover todas as conexões"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Linhas de conexão */}
          {flow.edges.map((edge, index) => {
            const fromNode = flow.nodes.find(n => n.id === edge.from)
            const toNode = flow.nodes.find(n => n.id === edge.to)
            
            if (!fromNode || !toNode) return null
            
            const startX = fromNode.position.x + 128 // 32 (width) + 96 (offset)
            const startY = fromNode.position.y + 40 // 20 (height) + 20 (offset)
            const endX = toNode.position.x
            const endY = toNode.position.y + 40
            
            // Ponto médio da linha para o botão de deletar
            const midX = (startX + endX) / 2
            const midY = (startY + endY) / 2
            
            return (
              <div key={index} className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
                <svg
                  className="absolute pointer-events-none"
                  style={{
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <path
                    d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY} ${endX} ${endY}`}
                    stroke="#3B82F6"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="hover:stroke-blue-600 transition-colors"
                  />
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#3B82F6"
                      />
                    </marker>
                  </defs>
                </svg>
                
                {/* Botão para deletar conexão */}
                <div
                  className="absolute pointer-events-auto"
                  style={{
                    left: midX - 12,
                    top: midY - 12,
                  }}
                >
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-6 h-6 p-0 rounded-full opacity-0 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                    onClick={() => handleRemoveConnection(edge.from, edge.to)}
                    title="Deletar conexão"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })}

          {/* Linha temporária durante drag de conexão */}
          {draggedConnection && (
            <svg
              className="absolute pointer-events-none z-10"
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
              }}
            >
              <defs>
                <marker
                  id="temp-arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#8B5CF6"
                  />
                </marker>
              </defs>
              {/* Esta linha será desenhada dinamicamente via JavaScript se necessário */}
            </svg>
          )}
        </div>
      </div>

      {/* Dialog de edição */}
      <NodeEditDialog
        node={selectedNode}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleNodeSave}
      />
    </div>
  )
}