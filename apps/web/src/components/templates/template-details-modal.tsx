"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Eye, 
  MessageSquare, 
  Tag, 
  Calendar,
  Copy,
  Users,
  Clock,
  Zap,
  Star
} from "lucide-react"

interface MessageTemplate {
  id: string
  name: string
  content: string
  category: string
  tags: string[]
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TemplateDetailsModalProps {
  template: MessageTemplate
}

const categories = [
  { id: "welcome", name: "Boas-vindas", icon: Users, color: "blue" },
  { id: "business-hours", name: "Horário", icon: Clock, color: "orange" },
  { id: "sales", name: "Vendas", icon: Zap, color: "green" },
  { id: "gratitude", name: "Agradecimento", icon: Star, color: "purple" },
  { id: "support", name: "Suporte", icon: MessageSquare, color: "red" }
]

export function TemplateDetailsModal({ template }: TemplateDetailsModalProps) {
  const [open, setOpen] = useState(false)

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  const getCategoryColor = (categoryId: string) => {
    const category = getCategoryInfo(categoryId)
    switch (category.color) {
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'red': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(template.content)
    // Aqui você poderia adicionar uma notificação de sucesso
  }

  const generatePreview = () => {
    let preview = template.content
    
    // Substituir variáveis por exemplos
    template.variables.forEach(variable => {
      const examples: { [key: string]: string } = {
        'nome': 'João Silva',
        'empresa': 'Nossa Empresa',
        'produto': 'Produto Premium',
        'desconto': '20%',
        'validade': '31/12/2024',
        'problema': 'problema técnico',
        'prazo': '24 horas'
      }
      
      const example = examples[variable] || `[${variable}]`
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), example)
    })
    
    return preview
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            {template.name}
            <Badge className={getCategoryColor(template.category)}>
              {getCategoryInfo(template.category).name}
            </Badge>
            {template.isActive ? (
              <Badge variant="default">Ativo</Badge>
            ) : (
              <Badge variant="secondary">Inativo</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do template de mensagem
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Informações do Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm font-mono">{template.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Categoria</label>
                  <p className="text-sm capitalize">{getCategoryInfo(template.category).name}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {template.isActive ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo da Mensagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conteúdo da Mensagem
                </span>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md border">
                <pre className="whitespace-pre-wrap text-sm">{template.content}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview da Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="text-sm text-blue-600 mb-2">Exemplo com dados reais:</div>
                <div className="text-sm">{generatePreview()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {template.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variáveis */}
          {template.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variáveis Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Use estas variáveis no conteúdo da mensagem:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, index) => (
                      <Badge key={index} variant="outline" className="font-mono">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Criado em</label>
                <p className="text-sm">{formatDate(template.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Última atualização</label>
                <p className="text-sm">{formatDate(template.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}


