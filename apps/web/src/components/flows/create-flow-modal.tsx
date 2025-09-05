"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { MessageSquare, Zap, Clock, Users, Loader2 } from "lucide-react"
import { flowsService } from "@/services/api"
import { notificationService } from "@/services/notification"

const flowTypes = [
  { id: "support", name: "Suporte", icon: MessageSquare, description: "Atendimento ao cliente" },
  { id: "sales", name: "Vendas", icon: Zap, description: "Qualificação e conversão de leads" },
  { id: "appointment", name: "Agendamento", icon: Clock, description: "Agendamento de consultas" },
  { id: "marketing", name: "Marketing", icon: Users, description: "Campanhas promocionais" }
]

interface CreateFlowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFlowCreated: () => void
}

export function CreateFlowModal({ open, onOpenChange, onFlowCreated }: CreateFlowModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "support" as "support" | "sales" | "appointment" | "marketing"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      notificationService.error('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      await flowsService.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: 'draft',
        steps: {
          triggers: [],
          actions: [],
          conditions: [],
          edges: []
        }
      })
      
      notificationService.success('Fluxo criado com sucesso!')
      onFlowCreated()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "support"
      })
    } catch (error) {
      notificationService.error('Erro ao criar fluxo', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = flowTypes.find(t => t.id === formData.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Fluxo</DialogTitle>
          <DialogDescription>
            Crie um novo fluxo de conversa para automatizar suas interações
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Fluxo *</Label>
            <Input
              id="name"
              placeholder="Ex: Boas-vindas para novos usuários"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito deste fluxo..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Fluxo</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {flowTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <selectedType.icon className="h-4 w-4" />
                <span className="font-medium">{selectedType.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedType.description}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Fluxo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


