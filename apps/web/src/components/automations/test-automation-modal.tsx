"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  User,
  Hash,
  FileText,
  Loader2
} from "lucide-react"

interface TestAutomationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  automationName: string
  onTest: (eventMock: any) => Promise<TestResult>
}

interface TestResult {
  success: boolean
  actions: string[]
  error?: string
  executionTime: number
}

const eventTemplates = [
  {
    name: "Novo Ticket",
    type: "ticket.created",
    description: "Simula a criação de um novo ticket",
    icon: MessageSquare,
    template: {
      type: "ticket.created",
      data: {
        ticketId: "TICKET-123",
        customerName: "João Silva",
        customerEmail: "joao@email.com",
        subject: "Problema com login",
        channel: "web",
        priority: "medium"
      }
    }
  },
  {
    name: "Mensagem Recebida",
    type: "message.received",
    description: "Simula recebimento de uma mensagem",
    icon: MessageSquare,
    template: {
      type: "message.received",
      data: {
        messageId: "MSG-456",
        ticketId: "TICKET-123",
        content: "Olá, preciso de ajuda com meu login",
        sender: "customer",
        timestamp: new Date().toISOString()
      }
    }
  },
  {
    name: "Contato Criado",
    type: "contact.created",
    description: "Simula criação de um novo contato",
    icon: User,
    template: {
      type: "contact.created",
      data: {
        contactId: "CONTACT-789",
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "+5511999999999",
        tags: ["novo", "potencial"]
      }
    }
  },
  {
    name: "Campanha Enviada",
    type: "campaign.sent",
    description: "Simula envio de uma campanha",
    icon: Hash,
    template: {
      type: "campaign.sent",
      data: {
        campaignId: "CAMP-101",
        name: "Boas-vindas",
        recipients: 150,
        sentAt: new Date().toISOString()
      }
    }
  }
]

export function TestAutomationModal({ 
  open, 
  onOpenChange, 
  automationName, 
  onTest 
}: TestAutomationModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof eventTemplates[0] | null>(null)
  const [customEvent, setCustomEvent] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const handleTest = async () => {
    if (!selectedTemplate && !customEvent.trim()) return

    setIsTesting(true)
    setTestResult(null)

    try {
      let eventMock
      
      if (selectedTemplate) {
        eventMock = selectedTemplate.template
      } else {
        try {
          eventMock = JSON.parse(customEvent)
        } catch (error) {
          setTestResult({
            success: false,
            actions: [],
            error: "JSON inválido no evento customizado",
            executionTime: 0
          })
          return
        }
      }

      const result = await onTest(eventMock)
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        actions: [],
        error: error instanceof Error ? error.message : "Erro desconhecido",
        executionTime: 0
      })
    } finally {
      setIsTesting(false)
    }
  }

  const resetTest = () => {
    setSelectedTemplate(null)
    setCustomEvent("")
    setTestResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-brand" />
            Testar Automação: {automationName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Templates de Eventos */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Templates de Eventos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eventTemplates.map((template) => (
                <Card
                  key={template.type}
                  className={`cursor-pointer transition-all hover:shadow-midnight ${
                    selectedTemplate?.type === template.type 
                      ? "ring-2 ring-brand shadow-midnight" 
                      : "hover:ring-1 hover:ring-border"
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center">
                        <template.icon className="h-5 w-5 text-brand" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {template.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Evento Customizado */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Evento Customizado
            </h3>
            <div className="space-y-2">
              <Label htmlFor="customEvent" className="text-sm">
                JSON do evento (opcional se usar template)
              </Label>
              <Textarea
                id="customEvent"
                placeholder='{"type": "custom.event", "data": {...}}'
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                className="font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use este campo para testar eventos personalizados ou modificar templates existentes
              </p>
            </div>
          </div>

          {/* Botão de Teste */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleTest}
              disabled={isTesting || (!selectedTemplate && !customEvent.trim())}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isTesting ? "Testando..." : "Executar Teste"}
            </Button>

            <Button
              variant="outline"
              onClick={resetTest}
              disabled={isTesting}
            >
              Limpar
            </Button>
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <Card className="shadow-midnight">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  Resultado do Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <Badge variant={testResult.success ? "success" : "destructive"}>
                    {testResult.success ? "Sucesso" : "Falha"}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {testResult.executionTime}ms
                  </div>
                </div>

                {/* Ações Executadas */}
                {testResult.success && testResult.actions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Ações que seriam executadas:
                    </h4>
                    <div className="space-y-2">
                      {testResult.actions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Erro */}
                {!testResult.success && testResult.error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Erro:</span>
                    </div>
                    <p className="text-sm text-destructive mt-1">{testResult.error}</p>
                  </div>
                )}

                {/* Evento Testado */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Evento Testado:</h4>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
                      {JSON.stringify(
                        selectedTemplate ? selectedTemplate.template : JSON.parse(customEvent || "{}"),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instruções */}
          <Card className="bg-muted/20">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground mb-2">Como usar:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Selecione um template de evento ou crie um evento customizado</li>
                <li>Clique em "Executar Teste" para simular a execução da automação</li>
                <li>Veja quais ações seriam executadas e o tempo de processamento</li>
                <li>Use os resultados para validar e ajustar sua automação</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
