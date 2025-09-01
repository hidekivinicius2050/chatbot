"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle, CheckCircle, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SlaFormProps {
  initialData?: {
    firstResponseMins: number
    resolutionMins: number
  }
  onSave: (data: { firstResponseMins: number; resolutionMins: number }) => Promise<void>
}

const defaultSla = {
  firstResponseMins: 15,
  resolutionMins: 240, // 4 horas
}

export function SlaForm({ initialData, onSave }: SlaFormProps) {
  const [firstResponseMins, setFirstResponseMins] = useState(
    initialData?.firstResponseMins || defaultSla.firstResponseMins
  )
  const [resolutionMins, setResolutionMins] = useState(
    initialData?.resolutionMins || defaultSla.resolutionMins
  )
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const initial = JSON.stringify(initialData || defaultSla)
    const current = JSON.stringify({ firstResponseMins, resolutionMins })
    setHasChanges(initial !== current)
  }, [firstResponseMins, resolutionMins, initialData])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave({
        firstResponseMins,
        resolutionMins
      })
      setHasChanges(false)
    } catch (error) {
      console.error("Erro ao salvar SLA:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes < 1440) { // menos de 24 horas
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (mins === 0) {
        return `${hours}h`
      }
      return `${hours}h ${mins}min`
    } else {
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      if (hours === 0) {
        return `${days} dia${days > 1 ? 's' : ''}`
      }
      return `${days} dia${days > 1 ? 's' : ''} ${hours}h`
    }
  }

  const getSlaStatus = (minutes: number, type: "first" | "resolution") => {
    const thresholds = type === "first" 
      ? { warning: 30, critical: 60 }
      : { warning: 480, critical: 1440 }
    
    if (minutes <= thresholds.warning) return "normal"
    if (minutes <= thresholds.critical) return "warning"
    return "critical"
  }

  const getFirstResponseStatus = () => getSlaStatus(firstResponseMins, "first")
  const getResolutionStatus = () => getSlaStatus(resolutionMins, "resolution")

  const examples = [
    { time: 5, label: "5 min = 1/12 hora" },
    { time: 15, label: "15 min = 1/4 hora" },
    { time: 30, label: "30 min = 1/2 hora" },
    { time: 60, label: "60 min = 1 hora" },
    { time: 120, label: "120 min = 2 horas" },
    { time: 240, label: "240 min = 4 horas" },
    { time: 480, label: "480 min = 8 horas" },
    { time: 1440, label: "1440 min = 1 dia" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuração de SLA</h2>
          <p className="text-muted-foreground mt-1">
            Configure os tempos de resposta e resolução para seus tickets
          </p>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primeira Resposta */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand" />
                Primeira Resposta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="firstResponse" className="text-sm font-medium">
                  Tempo máximo para primeira resposta (minutos)
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    id="firstResponse"
                    type="number"
                    min="1"
                    step="5"
                    value={firstResponseMins}
                    onChange={(e) => setFirstResponseMins(parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                  <Badge variant={getFirstResponseStatus() === "normal" ? "sla_normal" : 
                                getFirstResponseStatus() === "warning" ? "sla_warning" : "sla_critical"}>
                    {formatTime(firstResponseMins)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Tempo máximo para um agente responder ao primeiro contato do cliente
                </p>
              </div>

              {/* Status visual */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                {getFirstResponseStatus() === "normal" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : getFirstResponseStatus() === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm">
                  {getFirstResponseStatus() === "normal" && "Tempo adequado para primeira resposta"}
                  {getFirstResponseStatus() === "warning" && "Tempo elevado - considere reduzir"}
                  {getFirstResponseStatus() === "critical" && "Tempo muito alto - ação imediata necessária"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Resolução */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-brand" />
                Resolução
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resolution" className="text-sm font-medium">
                  Tempo máximo para resolução (minutos)
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    id="resolution"
                    type="number"
                    min="1"
                    step="5"
                    value={resolutionMins}
                    onChange={(e) => setResolutionMins(parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                  <Badge variant={getResolutionStatus() === "normal" ? "sla_normal" : 
                                getResolutionStatus() === "warning" ? "sla_warning" : "sla_critical"}>
                    {formatTime(resolutionMins)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Tempo máximo para resolver completamente o ticket
                </p>
              </div>

              {/* Status visual */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                {getResolutionStatus() === "normal" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : getResolutionStatus() === "warning" ? (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm">
                  {getResolutionStatus() === "normal" && "Tempo adequado para resolução"}
                  {getResolutionStatus() === "warning" && "Tempo elevado - considere otimizar processos"}
                  {getResolutionStatus() === "critical" && "Tempo muito alto - revisão de processos necessária"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Exemplos */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-brand" />
                Exemplos de Tempos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {examples.map((example) => (
                  <div
                    key={example.time}
                    className="p-2 text-center bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => {
                      if (example.time <= 60) {
                        setFirstResponseMins(example.time)
                      } else {
                        setResolutionMins(example.time)
                      }
                    }}
                  >
                    <div className="text-sm font-medium">{example.time} min</div>
                    <div className="text-xs text-muted-foreground">{example.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                Clique em um exemplo para aplicar ao campo apropriado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="shadow-midnight sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand" />
                Resumo do SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primeira Resposta */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Primeira Resposta</h4>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm">Tempo máximo:</span>
                  <Badge variant={getFirstResponseStatus() === "normal" ? "sla_normal" : 
                                getFirstResponseStatus() === "warning" ? "sla_warning" : "sla_critical"}>
                    {formatTime(firstResponseMins)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getFirstResponseStatus() === "normal" && "✅ Dentro dos padrões"}
                  {getFirstResponseStatus() === "warning" && "⚠️ Acima do recomendado"}
                  {getFirstResponseStatus() === "critical" && "🚨 Muito acima do recomendado"}
                </div>
              </div>

              {/* Resolução */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Resolução</h4>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm">Tempo máximo:</span>
                  <Badge variant={getResolutionStatus() === "normal" ? "sla_normal" : 
                                getResolutionStatus() === "warning" ? "sla_warning" : "sla_critical"}>
                    {formatTime(resolutionMins)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getResolutionStatus() === "normal" && "✅ Dentro dos padrões"}
                  {getResolutionStatus() === "warning" && "⚠️ Acima do recomendado"}
                  {getResolutionStatus() === "critical" && "🚨 Muito acima do recomendado"}
                </div>
              </div>

              {/* Validação */}
              <div className="pt-4 border-t border-border">
                <div className="space-y-2">
                  {firstResponseMins >= resolutionMins && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Tempo de primeira resposta deve ser menor que tempo de resolução
                    </div>
                  )}
                  
                  {firstResponseMins <= 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Tempo de primeira resposta deve ser maior que zero
                    </div>
                  )}
                  
                  {resolutionMins <= 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Tempo de resolução deve ser maior que zero
                    </div>
                  )}
                  
                  {firstResponseMins > 0 && resolutionMins > 0 && firstResponseMins < resolutionMins && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle className="h-4 w-4" />
                      Configuração válida
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
