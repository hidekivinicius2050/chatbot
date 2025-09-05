"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  Search,
  Loader2,
  Users,
  Clock,
  Zap,
  Star,
  Tag
} from "lucide-react"
import { useTemplates } from "@/contexts/AppContext"
import { notificationService } from "@/services/notifications"
import { CreateTemplateModal } from "./create-template-modal"
import { TemplateDetailsModal } from "./template-details-modal"

const categories = [
  { id: "welcome", name: "Boas-vindas", icon: Users, color: "blue" },
  { id: "business-hours", name: "Horário", icon: Clock, color: "orange" },
  { id: "sales", name: "Vendas", icon: Zap, color: "green" },
  { id: "gratitude", name: "Agradecimento", icon: Star, color: "purple" },
  { id: "support", name: "Suporte", icon: MessageSquare, color: "red" }
]

export function TemplatesContentSimple() {
  const { templates, loading, error, loadTemplates } = useTemplates()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  useEffect(() => {
    console.log('Componente montado, carregando templates...')
    loadTemplates()
  }, [loadTemplates])

  console.log('Renderizando templates:', { templates, loading, error })

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  // Ações dos templates
  const handleTemplateAction = async (templateId: string, action: string) => {
    setActionLoading(templateId)
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      notificationService.success(`Template ${action} com sucesso!`)
      loadTemplates() // Recarregar dados
    } catch (error) {
      notificationService.error(`Erro ao ${action} template`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      setActionLoading(templateId)
      try {
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        notificationService.success('Template excluído com sucesso!')
        loadTemplates() // Recarregar dados
      } catch (error) {
        notificationService.error('Erro ao excluir template')
      } finally {
        setActionLoading(null)
      }
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={loadTemplates}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagem</h1>
          <p className="text-muted-foreground">
            Gerencie seus templates de mensagens para automação
          </p>
        </div>
        <CreateTemplateModal onTemplateCreated={loadTemplates} />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {categories.map(category => {
          const count = filteredTemplates.filter(t => t.category === category.id).length
          const totalCount = templates.filter(t => t.category === category.id).length
          const IconComponent = category.icon
          
          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                <IconComponent className={`h-4 w-4 text-${category.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {totalCount} total
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {templates.length === 0 ? 'Nenhum template encontrado' : 'Nenhum template corresponde aos filtros'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {templates.length === 0 
                  ? 'Crie seu primeiro template para começar a automatizar suas mensagens'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              <CreateTemplateModal onTemplateCreated={loadTemplates} />
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category)
            const IconComponent = categoryInfo.icon
            
            return (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 text-${categoryInfo.color}-600`} />
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.content.length > 100 
                            ? `${template.content.substring(0, 100)}...` 
                            : template.content
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(template.category)}>
                        {categoryInfo.name}
                      </Badge>
                      {template.isActive ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Tags */}
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Variables */}
                    {template.variables.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Variáveis:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-muted-foreground">
                        Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTemplateAction(template.id, 'copiado')}
                          disabled={actionLoading === template.id}
                        >
                          {actionLoading === template.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <TemplateDetailsModal template={template} />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          disabled={actionLoading === template.id}
                        >
                          {actionLoading === template.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
