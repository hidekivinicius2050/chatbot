"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2, Tag, MessageSquare } from "lucide-react"
import { notificationService } from "@/services/notifications"

const categories = [
  { id: "welcome", name: "Boas-vindas", icon: "👋" },
  { id: "business-hours", name: "Horário", icon: "🕒" },
  { id: "sales", name: "Vendas", icon: "💰" },
  { id: "gratitude", name: "Agradecimento", icon: "🙏" },
  { id: "support", name: "Suporte", icon: "🛠️" }
]

interface CreateTemplateModalProps {
  onTemplateCreated?: () => void
}

export function CreateTemplateModal({ onTemplateCreated }: CreateTemplateModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "welcome",
    content: "",
    tags: "",
    variables: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      notificationService.success('Template criado com sucesso!')
      setOpen(false)
      setFormData({
        name: "",
        category: "welcome",
        content: "",
        tags: "",
        variables: ""
      })
      
      if (onTemplateCreated) {
        onTemplateCreated()
      }
    } catch (error) {
      notificationService.error('Erro ao criar template')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const parseTags = (tagsString: string) => {
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  }

  const parseVariables = (variablesString: string) => {
    return variablesString.split(',').map(variable => variable.trim()).filter(variable => variable.length > 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Criar Novo Template
          </DialogTitle>
          <DialogDescription>
            Crie um novo template de mensagem para automatizar suas comunicações.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                placeholder="Ex: Boas-vindas para novos clientes"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo da Mensagem</Label>
            <Textarea
              id="content"
              placeholder="Digite o conteúdo da sua mensagem..."
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis como {"{{nome}}"}, {"{{empresa}}"} para personalizar as mensagens
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Ex: boas-vindas, inicial, cliente"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separe as tags por vírgula
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variables">Variáveis</Label>
              <Input
                id="variables"
                placeholder="Ex: nome, empresa, produto"
                value={formData.variables}
                onChange={(e) => handleInputChange("variables", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separe as variáveis por vírgula
              </p>
            </div>
          </div>

          {/* Preview */}
          {formData.content && (
            <div className="space-y-2">
              <Label>Preview da Mensagem</Label>
              <div className="p-4 bg-gray-50 rounded-md border">
                <div className="text-sm text-gray-600 mb-2">Exemplo:</div>
                <div className="text-sm">
                  {formData.content
                    .replace(/\{\{nome\}\}/g, 'João')
                    .replace(/\{\{empresa\}\}/g, 'Nossa Empresa')
                    .replace(/\{\{produto\}\}/g, 'Produto')
                  }
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


