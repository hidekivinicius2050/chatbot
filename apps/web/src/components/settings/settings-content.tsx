"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Clock, 
  Users, 
  Shield, 
  Bell, 
  Database,
  Globe,
  Mail,
  Phone,
  Building,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  QrCode,
  Wifi,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { useApp } from "@/contexts/AppContext"
import { useAIConfig } from "@/contexts/AppContext"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { state } = useApp()
  const { aiConfig, loadAIConfig } = useAIConfig()

  // Estado local para configurações
  const [settings, setSettings] = useState({
    business: {
      name: "AtendeChat 2.0",
      email: "contato@atendechat.com.br",
      phone: "+55 11 99999-9999",
      address: "São Paulo, SP",
      timezone: "America/Sao_Paulo",
      language: "pt-BR"
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      slack: true
    },
    security: {
      twoFactor: true,
      sessionTimeout: 30,
      passwordPolicy: "strong",
      ipWhitelist: ["192.168.1.0/24"]
    },
    integrations: {
      slack: {
        enabled: true,
        webhook: "https://hooks.slack.com/services/...",
        channel: "#chatbot-alerts"
      },
      zapier: {
        enabled: false,
        apiKey: ""
      }
    },
    ai: {
      openaiApiKey: "",
      model: "gpt-4",
      temperature: 0.7,
      systemPrompt: "Você é um assistente virtual profissional e amigável."
    }
  })

  useEffect(() => {
    // Carregar configurações ao montar o componente
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      await loadAIConfig()
      // Aqui você pode carregar outras configurações se necessário
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Aqui você implementaria a lógica para salvar as configurações
      console.log("Configurações salvas:", settings)
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsEditing(false)
      // Mostrar toast de sucesso
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      // Mostrar toast de erro
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Resetar para valores originais
    setSettings({
      business: {
        name: "AtendeChat 2.0",
        email: "contato@atendechat.com.br",
        phone: "+55 11 99999-9999",
        address: "São Paulo, SP",
        timezone: "America/Sao_Paulo",
        language: "pt-BR"
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        slack: true
      },
      security: {
        twoFactor: true,
        sessionTimeout: 30,
        passwordPolicy: "strong",
        ipWhitelist: ["192.168.1.0/24"]
      },
      integrations: {
        slack: {
          enabled: true,
          webhook: "https://hooks.slack.com/services/...",
          channel: "#chatbot-alerts"
        },
        zapier: {
          enabled: false,
          apiKey: ""
        }
      },
      ai: {
        openaiApiKey: "",
        model: "gpt-4",
        temperature: 0.7,
        systemPrompt: "Você é um assistente virtual profissional e amigável."
      }
    })
    setIsEditing(false)
  }

  const tabs = [
    { id: "general", label: "Geral", icon: Settings },
    { id: "business", label: "Empresa", icon: Building },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "integrations", label: "Integrações", icon: Wifi },
    { id: "ai", label: "IA & WhatsApp", icon: Key }
  ]

  if (isLoading && !aiConfig) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações da sua plataforma
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando configurações...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua plataforma
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
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
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="grid gap-6">
            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nome da Plataforma
                    </label>
                    <Input
                      value={settings.business.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        business: { ...settings.business, name: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Idioma
                    </label>
                    <Input
                      value={settings.business.language}
                      onChange={(e) => setSettings({
                        ...settings,
                        business: { ...settings.business, language: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fuso Horário
                  </label>
                  <Input
                    value={settings.business.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      business: { ...settings.business, timezone: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Business Settings */}
        {activeTab === "business" && (
          <div className="grid gap-6">
            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      value={settings.business.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        business: { ...settings.business, email: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Telefone
                    </label>
                    <Input
                      value={settings.business.phone}
                      onChange={(e) => setSettings({
                        ...settings,
                        business: { ...settings.business, phone: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Endereço
                  </label>
                  <Input
                    value={settings.business.address}
                    onChange={(e) => setSettings({
                      ...settings,
                      business: { ...settings.business, address: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="grid gap-6">
            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">
                          {key === "email" && "Email"}
                          {key === "push" && "Push"}
                          {key === "sms" && "SMS"}
                          {key === "slack" && "Slack"}
                        </span>
                      </div>
                      <Button
                        variant={value ? "default" : "outline"}
                        size="sm"
                        onClick={() => isEditing && setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, [key]: !value }
                        })}
                        disabled={!isEditing}
                      >
                        {value ? "Ativo" : "Inativo"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="grid gap-6">
            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Autenticação em 2 Fatores</span>
                    </div>
                    <Badge variant={settings.security.twoFactor ? "default" : "secondary"}>
                      {settings.security.twoFactor ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Timeout da Sessão (minutos)</span>
                    </div>
                    <Input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => isEditing && setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                      disabled={!isEditing}
                      className="w-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integrations Settings */}
        {activeTab === "integrations" && (
          <div className="grid gap-6">
            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Integrações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Slack Integration */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">S</span>
                        </div>
                        <span className="font-medium">Slack</span>
                      </div>
                      <Badge variant={settings.integrations.slack.enabled ? "default" : "secondary"}>
                        {settings.integrations.slack.enabled ? "Conectado" : "Desconectado"}
                      </Badge>
                    </div>
                    {settings.integrations.slack.enabled && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>Canal: {settings.integrations.slack.channel}</div>
                        <div className="truncate">Webhook: {settings.integrations.slack.webhook}</div>
                      </div>
                    )}
                  </div>

                  {/* Zapier Integration */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">Z</span>
                        </div>
                        <span className="font-medium">Zapier</span>
                      </div>
                      <Badge variant={settings.integrations.zapier.enabled ? "default" : "secondary"}>
                        {settings.integrations.zapier.enabled ? "Conectado" : "Desconectado"}
                      </Badge>
                    </div>
                    {!settings.integrations.zapier.enabled && (
                      <Button variant="outline" size="sm">
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI & WhatsApp Settings */}
        {activeTab === "ai" && (
          <div className="grid gap-6">
            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configurações de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    OpenAI API Key
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="password"
                      value={settings.ai.openaiApiKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        ai: { ...settings.ai, openaiApiKey: e.target.value }
                      })}
                      disabled={!isEditing}
                      placeholder="sk-..."
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Modelo
                    </label>
                    <select
                      value={settings.ai.model}
                      onChange={(e) => setSettings({
                        ...settings,
                        ai: { ...settings.ai, model: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
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
                      value={settings.ai.temperature}
                      onChange={(e) => setSettings({
                        ...settings,
                        ai: { ...settings.ai, temperature: parseFloat(e.target.value) }
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
                  <textarea
                    value={settings.ai.systemPrompt}
                    onChange={(e) => setSettings({
                      ...settings,
                      ai: { ...settings.ai, systemPrompt: e.target.value }
                    })}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    placeholder="Instruções para o comportamento da IA..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Configurações do WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    QR Code para conectar WhatsApp Business
                  </p>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Gerar QR Code
                  </Button>
                </div>
                
                <div className="text-center">
                  <Badge variant="outline" className="text-sm">
                    Status: Desconectado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
