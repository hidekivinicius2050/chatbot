"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Bot,
  Key,
  Settings,
  Save,
  TestTube,
  QrCode,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Smartphone,
  MessageCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Download
} from "lucide-react"
import { useAIConfig } from "@/contexts/AppContext"
import { useApp } from "@/contexts/AppContext"
import { aiConfigService } from "@/services/api"
import { Loading, PageLoading, InlineLoading } from "@/components/ui/loading"
import { useToastNotifications } from "@/components/ui/toast"
import { validateAIConfig } from "@/utils/validation"
import { useLogger } from "@/utils/logger"
import { useConnectivity } from "@/utils/connectivity"
import { shouldSkipConnectivityCheck } from "@/config/environment"

export default function AIConfigContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testMessage, setTestMessage] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  
  const { aiConfig, loadAIConfig } = useAIConfig()
  const { state } = useApp()
  const toast = useToastNotifications()
  const logger = useLogger('AIConfigContent')
  const connectivity = useConnectivity()

  // Estado local para configurações
  const [config, setConfig] = useState({
    openai: {
      apiKey: "",
      model: "gpt-4",
      temperature: 0.7,
      systemPrompt: "Você é um assistente virtual profissional e amigável para atendimento ao cliente via WhatsApp. Responda de forma clara, concisa e útil."
    },
    whatsapp: {
      phoneNumber: "",
      businessName: "",
      webhookUrl: "",
      status: "disconnected"
    }
  })

  useEffect(() => {
    // Carregar configurações ao montar o componente
    loadInitialData()
  }, [])

  // Sempre permitir edição para facilitar o uso
  useEffect(() => {
    // Forçar edição sempre ativa
    setIsEditing(true)
  }, [])

  useEffect(() => {
    // Atualizar estado local quando aiConfig mudar
    if (aiConfig) {
      setConfig({
        openai: {
          apiKey: aiConfig.openai?.apiKey || "",
          model: aiConfig.openai?.model || "gpt-4",
          temperature: aiConfig.openai?.temperature || 0.7,
          systemPrompt: aiConfig.openai?.systemPrompt || "Você é um assistente virtual profissional e amigável para atendimento ao cliente via WhatsApp. Responda de forma clara, concisa e útil."
        },
        whatsapp: {
          phoneNumber: aiConfig.whatsapp?.phoneNumber || "",
          businessName: aiConfig.whatsapp?.businessName || "",
          webhookUrl: aiConfig.whatsapp?.webhookUrl || "",
          status: aiConfig.whatsapp?.aiEnabled ? "connected" : "disconnected"
        }
      })
    }
  }, [aiConfig])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      await loadAIConfig()
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setValidationErrors([])
    
    try {
      // Validar configurações
      const validation = validateAIConfig(config)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error('Erro de validação', validation.errors.join(', '))
        return
      }

      // Verificar conectividade apenas se não estiver em ambiente local
      if (!shouldSkipConnectivityCheck() && !connectivity.isOnline) {
        toast.error('Sem conexão', 'Verifique sua conexão com a internet')
        return
      }

      logger.info('Salvando configurações de IA', { config })
      
      // Salvar configurações no backend
      const aiConfigData = {
        openai: {
          apiKey: config.openai.apiKey,
          model: config.openai.model,
          temperature: config.openai.temperature,
          systemPrompt: config.openai.systemPrompt
        },
        whatsapp: {
          phoneNumber: config.whatsapp.phoneNumber,
          businessName: config.whatsapp.businessName,
          webhookUrl: config.whatsapp.webhookUrl,
          aiEnabled: config.whatsapp.status === "connected"
        }
      }
      
      await aiConfigService.update(aiConfigData)
      await loadAIConfig() // Recarregar configurações
      
      setIsEditing(false)
      toast.success('Configurações salvas!', 'As configurações de IA foram atualizadas com sucesso')
      logger.info('Configurações salvas com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      logger.error('Erro ao salvar configurações', { error: errorMessage })
      toast.error('Erro ao salvar', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestAI = async () => {
    if (!testMessage.trim() || !config.openai.apiKey) return

    setIsTesting(true)
    try {
      // Testar IA usando o serviço
      const response = await aiConfigService.test(testMessage)
      setTestResponse(response.data.aiResponse || "Resposta da IA recebida com sucesso!")

    } catch (error) {
      console.error('Erro ao testar IA:', error)
      setTestResponse("Erro ao conectar com a IA. Verifique sua API key e tente novamente.")
    } finally {
      setIsTesting(false)
    }
  }

  const handleGenerateQR = async () => {
    try {
      setIsLoading(true)
      logger.info('Gerando QR Code para WhatsApp...')
      
      // Chamar API para gerar QR Code (diretamente no servidor mock)
      const response = await fetch('http://localhost:3001/api/whatsapp/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: config.whatsapp.phoneNumber,
          businessName: config.whatsapp.businessName
        })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code')
      }
      
      const data = await response.json()
      
      // Armazenar QR Code
      console.log('🔍 Debug - QR Code recebido:', data.qrCode)
      console.log('🔍 Debug - Tipo do QR Code:', typeof data.qrCode)
      console.log('🔍 Debug - Tamanho do QR Code:', data.qrCode?.length)
      
      setQrCodeData(data.qrCode)
      
      // Atualizar status para conectado
      setConfig(prev => ({
        ...prev,
        whatsapp: {
          ...prev.whatsapp,
          status: 'connected'
        }
      }))
      
      toast.success('QR Code gerado com sucesso!', 'Escaneie o código com seu WhatsApp Business')
      logger.info('QR Code gerado com sucesso', { qrCode: data.qrCode })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao gerar QR Code:', error)
      toast.error('Erro ao gerar QR Code', errorMessage)
      logger.error('Erro ao gerar QR Code', { error: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Mostrar toast de sucesso
  }

  if (state.loading.aiConfig) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações de IA</h1>
            <p className="text-muted-foreground">
              Configure o GPT-4 e integrações do WhatsApp para automatizar seu atendimento
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
          <h1 className="text-3xl font-bold text-foreground">Configurações de IA</h1>
          <p className="text-muted-foreground">
            Configure o GPT-4 e integrações do WhatsApp para automatizar seu atendimento
          </p>
          {isEditing && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Modo de edição ativado - Campos habilitados
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do OpenAI */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Configurações do OpenAI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                API Key
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={config.openai.apiKey}
                  onChange={(e) => setConfig({
                    ...config,
                    openai: { ...config.openai, apiKey: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={!isEditing}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.openai.apiKey)}
                  disabled={!config.openai.apiKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Modelo
                </label>
                <select
                  value={config.openai.model}
                  onChange={(e) => setConfig({
                    ...config,
                    openai: { ...config.openai, model: e.target.value }
                  })}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded text-sm mt-1"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Temperatura
                </label>
                <Input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.openai.temperature}
                  onChange={(e) => setConfig({
                    ...config,
                    openai: { ...config.openai, temperature: parseFloat(e.target.value) }
                  })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Prompt do Sistema
              </label>
              <Textarea
                value={config.openai.systemPrompt}
                onChange={(e) => setConfig({
                  ...config,
                  openai: { ...config.openai, systemPrompt: e.target.value }
                })}
                disabled={!isEditing}
                rows={4}
                className="mt-1"
                placeholder="Instruções para o comportamento da IA..."
              />
            </div>

            {/* Teste da IA */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Testar IA</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Digite uma mensagem para testar..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  disabled={!config.openai.apiKey}
                />
                <Button 
                  onClick={handleTestAI} 
                  disabled={!testMessage.trim() || !config.openai.apiKey || isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar IA
                </Button>
                {testResponse && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Resposta:</p>
                    <p className="text-sm">{testResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações do WhatsApp */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Configurações do WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Número do Telefone
                </label>
                <Input
                  value={config.whatsapp.phoneNumber}
                  onChange={(e) => setConfig({
                    ...config,
                    whatsapp: { ...config.whatsapp, phoneNumber: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="+55 11 99999-9999"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nome da Empresa
                </label>
                <Input
                  value={config.whatsapp.businessName}
                  onChange={(e) => setConfig({
                    ...config,
                    whatsapp: { ...config.whatsapp, businessName: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="Nome da sua empresa"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Webhook URL
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={config.whatsapp.webhookUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    whatsapp: { ...config.whatsapp, webhookUrl: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="https://seu-dominio.com/webhook"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.whatsapp.webhookUrl)}
                  disabled={!config.whatsapp.webhookUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status da Conexão */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Status da Conexão</h4>
                <Badge variant={config.whatsapp.status === "connected" ? "default" : "secondary"}>
                  {config.whatsapp.status === "connected" ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  config.whatsapp.status === "connected" ? "bg-green-500" : "bg-red-500"
                }`} />
                <span className="text-sm text-muted-foreground">
                  {config.whatsapp.status === "connected" ? "WhatsApp conectado" : "WhatsApp desconectado"}
                </span>
              </div>

              <Button 
                onClick={handleGenerateQR}
                variant="outline"
                className="w-full"
                disabled={!isEditing}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Gerar QR Code
              </Button>
            </div>

            {/* QR Code */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">QR Code</h4>
              {console.log('🔍 Debug - qrCodeData no render:', qrCodeData)}
              {qrCodeData ? (
                <div className="text-center p-6 border-2 border-green-300 rounded-lg bg-green-50">
                  <img 
                    src={qrCodeData} 
                    alt="QR Code WhatsApp" 
                    className="mx-auto mb-4 max-w-48 h-auto"
                  />
                  <p className="text-green-700 mb-2 font-medium">
                    QR Code gerado com sucesso!
                  </p>
                  <p className="text-sm text-green-600 mb-3">
                    Escaneie este código com seu WhatsApp Business
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={handleGenerateQR}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Gerar Novo
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(qrCodeData)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    QR Code para conectar WhatsApp Business
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateQR}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Gerar QR Code
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas e Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-midnight">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status da IA</p>
                <p className="text-2xl font-bold text-foreground">
                  {config.openai.apiKey ? "Ativa" : "Inativa"}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                config.openai.apiKey ? "bg-green-500/10" : "bg-red-500/10"
              }`}>
                <Bot className={`h-6 w-6 ${
                  config.openai.apiKey ? "text-green-500" : "text-red-500"
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status do WhatsApp</p>
                <p className="text-2xl font-bold text-foreground">
                  {config.whatsapp.status === "connected" ? "Conectado" : "Desconectado"}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                config.whatsapp.status === "connected" ? "bg-green-500/10" : "bg-red-500/10"
              }`}>
                <MessageCircle className={`h-6 w-6 ${
                  config.whatsapp.status === "connected" ? "text-green-500" : "text-red-500"
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-midnight">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modelo Ativo</p>
                <p className="text-2xl font-bold text-foreground">
                  {config.openai.model.toUpperCase()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
