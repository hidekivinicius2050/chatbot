"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  MessageCircle,
  MessageSquare,
  Mail,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { channelsService } from "@/services/api"
import { useChannels } from "@/contexts/AppContext"
import { notificationService } from "@/services/notification"

interface ChannelFormData {
  name: string
  type: "whatsapp-cloud" | "whatsapp-baileys" | "telegram" | "instagram" | "email" | "sms" | ""
  phoneNumber: string
  businessName: string
  email: string
  webhookUrl: string
  apiKey: string
}

interface AddChannelModalProps {
  children: React.ReactNode
}

export function AddChannelModal({ children }: AddChannelModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { loadChannels } = useChannels()

  console.log("🔧 AddChannelModal renderizado", { open, isLoading })

  const [formData, setFormData] = useState<ChannelFormData>({
    name: "",
    type: "",
    phoneNumber: "",
    businessName: "",
    email: "",
    webhookUrl: "",
    apiKey: "",
  })

  const [errors, setErrors] = useState<Partial<ChannelFormData>>({})

  const selectedType = formData.type

  const validateForm = (): boolean => {
    console.log("🔍 Validando formulário...", formData)
    const newErrors: Partial<ChannelFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }
    
    if (!formData.type) {
      newErrors.type = "Tipo é obrigatório"
    }
    
    if (formData.type === "whatsapp-cloud" || formData.type === "whatsapp-baileys") {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Número do WhatsApp é obrigatório"
      }
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Nome da empresa é obrigatório"
      }
    }
    
    if (formData.type === "telegram" || formData.type === "instagram") {
      if (!formData.apiKey.trim()) {
        newErrors.apiKey = "API Key é obrigatória"
      }
    }
    
    if (formData.type === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Email é obrigatório"
      }
    }
    
    if (formData.type === "sms") {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Número para SMS é obrigatório"
      }
    }
    
    console.log("🔍 Erros encontrados:", newErrors)
    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log("🔍 Formulário válido:", isValid)
    return isValid
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🚀 Formulário submetido!", formData)
    
    if (!validateForm()) {
      console.log("❌ Validação falhou", errors)
      return
    }
    
    console.log("✅ Validação passou, criando canal...")
    setIsLoading(true)
    try {
      // Preparar dados para envio
      const channelData = {
        name: formData.name,
        type: formData.type,
        config: {
          ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
          ...(formData.businessName && { businessName: formData.businessName }),
          ...(formData.email && { email: formData.email }),
          ...(formData.webhookUrl && { webhookUrl: formData.webhookUrl }),
          ...(formData.apiKey && { apiKey: formData.apiKey }),
        },
      }

      console.log("📤 Enviando dados:", channelData)
      await channelsService.create(channelData)
      console.log("✅ Canal criado com sucesso!")
      notificationService.success("Canal criado com sucesso!")
      setOpen(false)
      setFormData({
        name: "",
        type: "",
        phoneNumber: "",
        businessName: "",
        email: "",
        webhookUrl: "",
        apiKey: "",
      })
      setErrors({})
      loadChannels() // Recarregar lista de canais
    } catch (error) {
      console.error("❌ Erro ao criar canal:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar canal"
      notificationService.error("Erro ao criar canal", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp-cloud":
      case "whatsapp-baileys": return <MessageCircle className="h-5 w-5 text-green-500" />
      case "telegram": return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "instagram": return <MessageSquare className="h-5 w-5 text-pink-500" />
      case "email": return <Mail className="h-5 w-5 text-blue-500" />
      case "sms": return <Smartphone className="h-5 w-5 text-gray-500" />
      default: return <MessageSquare className="h-5 w-5" />
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "whatsapp-cloud": return "Conecte seu WhatsApp Business usando a API oficial do Meta"
      case "whatsapp-baileys": return "Conecte seu WhatsApp usando Baileys (não oficial)"
      case "telegram": return "Configure um bot do Telegram para mensagens automáticas"
      case "instagram": return "Conecte sua conta do Instagram para mensagens diretas"
      case "email": return "Configure um canal de email para atendimento por email"
      case "sms": return "Configure um canal SMS para mensagens de texto"
      default: return ""
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Canal
          </DialogTitle>
          <DialogDescription>
            Configure um novo canal de comunicação para seu chatbot
          </DialogDescription>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log("🧪 Teste: Preenchendo formulário automaticamente")
              setFormData({
                name: "Canal Teste",
                type: "whatsapp-baileys",
                phoneNumber: "+5511999999999",
                businessName: "Empresa Teste",
                email: "",
                webhookUrl: "",
                apiKey: "",
              })
            }}
          >
            🧪 Preencher Teste
          </Button>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6" onLoad={() => console.log("📝 Formulário carregado")}>
            {/* Tipo do Canal */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo do Canal</label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o tipo do canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp-cloud">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp Cloud API
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp-baileys">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      WhatsApp Baileys
                    </div>
                  </SelectItem>
                  <SelectItem value="telegram">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      Telegram Bot
                    </div>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-pink-500" />
                      Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>

            {/* Informações do Canal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {selectedType && getTypeIcon(selectedType)}
                  Informações do Canal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Canal</label>
                  <Input 
                    placeholder="Ex: WhatsApp Principal" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  <p className="text-sm text-muted-foreground">
                    Nome amigável para identificar o canal
                  </p>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {selectedType && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(selectedType)}
                      <span className="font-medium capitalize">{selectedType}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getTypeDescription(selectedType)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configurações Específicas */}
            {selectedType && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* WhatsApp */}
                  {(selectedType === "whatsapp-cloud" || selectedType === "whatsapp-baileys") && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Número do WhatsApp</label>
                        <Input 
                          placeholder="+55 11 99999-9999" 
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className={errors.phoneNumber ? "border-red-500" : ""}
                        />
                        <p className="text-sm text-muted-foreground">
                          Número do WhatsApp Business (com código do país)
                        </p>
                        {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome da Empresa</label>
                        <Input 
                          placeholder="Minha Empresa" 
                          value={formData.businessName}
                          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                          className={errors.businessName ? "border-red-500" : ""}
                        />
                        <p className="text-sm text-muted-foreground">
                          Nome da sua empresa no WhatsApp Business
                        </p>
                        {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
                      </div>
                    </>
                  )}

                  {/* Telegram */}
                  {selectedType === "telegram" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Token do Bot</label>
                      <Input 
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" 
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        className={errors.apiKey ? "border-red-500" : ""}
                      />
                      <p className="text-sm text-muted-foreground">
                        Token do bot obtido com @BotFather no Telegram
                      </p>
                      {errors.apiKey && <p className="text-sm text-red-500">{errors.apiKey}</p>}
                    </div>
                  )}

                  {/* Instagram */}
                  {selectedType === "instagram" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Access Token</label>
                      <Input 
                        placeholder="IGQVJ..." 
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        className={errors.apiKey ? "border-red-500" : ""}
                      />
                      <p className="text-sm text-muted-foreground">
                        Access Token do Instagram Graph API
                      </p>
                      {errors.apiKey && <p className="text-sm text-red-500">{errors.apiKey}</p>}
                    </div>
                  )}

                  {/* Email */}
                  {selectedType === "email" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        type="email"
                        placeholder="contato@empresa.com" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      <p className="text-sm text-muted-foreground">
                        Email para receber mensagens dos clientes
                      </p>
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  )}

                  {/* SMS */}
                  {selectedType === "sms" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Número para SMS</label>
                      <Input 
                        placeholder="+55 11 99999-9999" 
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className={errors.phoneNumber ? "border-red-500" : ""}
                      />
                      <p className="text-sm text-muted-foreground">
                        Número para envio e recebimento de SMS
                      </p>
                      {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
                    </div>
                  )}

                  {/* Webhook URL (opcional para todos) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Webhook URL (Opcional)</label>
                    <Input 
                      placeholder="https://api.empresa.com/webhooks/channel" 
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className={errors.webhookUrl ? "border-red-500" : ""}
                    />
                    <p className="text-sm text-muted-foreground">
                      URL para receber notificações de eventos do canal
                    </p>
                    {errors.webhookUrl && <p className="text-sm text-red-500">{errors.webhookUrl}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                onClick={() => console.log("🖱️ Botão clicado!")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Canal
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  )
}
