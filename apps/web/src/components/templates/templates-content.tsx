"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Save,
  X,
  MessageSquare,
  Zap,
  Users,
  Clock,
  Star,
  Tag,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  Loader2
} from "lucide-react"
import { useTemplates } from "@/contexts/AppContext"
import { useApp } from "@/contexts/AppContext"

const categories = [
  { id: "welcome", name: "Boas-vindas", icon: Users, color: "blue" },
  { id: "business-hours", name: "Horário", icon: Clock, color: "orange" },
  { id: "sales", name: "Vendas", icon: Zap, color: "green" },
  { id: "gratitude", name: "Agradecimento", icon: Star, color: "purple" },
  { id: "support", name: "Suporte", icon: MessageSquare, color: "red" }
]

export function TemplatesContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "welcome",
    content: "",
    tags: ""
  })
  
  const { templates, loadTemplates } = useTemplates()
  const { state } = useApp()

  useEffect(() => {
    // Carregar templates ao montar o componente
    loadTemplates()
  }, [loadTemplates])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setFormData({
      name: "",
      category: "welcome",
      content: "",
      tags: ""
    })
    setShowForm(true)
  }

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name || "",
      category: template.category || "welcome",
      content: template.content || "",
      tags: template.tags?.join(", ") || ""
    })
    setShowForm(true)
  }

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.content) return

    setIsLoading(true)
    try {
      const templateData = {
        id: editingTemplate?.id || Date.now().toString(),
        name: formData.name,
        category: formData.category,
        content: formData.content,
        variables: extractVariables(formData.content),
        usage: editingTemplate?.usage || 0,
        lastUsed: editingTemplate?.lastUsed || new Date().toISOString().split('T')[0],
        status: "active",
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
      }

      // Aqui você implementaria o salvamento na API
      // if (editingTemplate) {
      //   await updateTemplateAPI(editingTemplate.id, templateData)
      // } else {
      //   await createTemplateAPI(templateData)
      // }

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Recarregar templates
      loadTemplates()

      setShowForm(false)
      setEditingTemplate(null)
      setFormData({ name: "", category: "welcome", content: "", tags: "" })

    } catch (error) {
      console.error('Erro ao salvar template:', error)
      // Mostrar toast de erro
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return

    try {
      // Aqui você implementaria a exclusão na API
      // await deleteTemplateAPI(id)

      // Simular exclusão
      await new Promise(resolve => setTimeout(resolve, 500))

      // Recarregar templates
      loadTemplates()

    } catch (error) {
      console.error('Erro ao excluir template:', error)
      // Mostrar toast de erro
    }
  }

  const extractVariables = (content: string) => {
    const regex = /\{\{([^}]+)\}\}/g
    const variables: string[] = []
    let match
    while ((match = regex.exec(content)) !== null) {
      variables.push(match[1])
    }
    return variables
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.icon : MessageSquare
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? `text-${category.color}-600` : "text-gray-600"
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : "Categoria"
  }

  if (state.loading.templates) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagens</h1>
            <p className="text-muted-foreground">
              Crie e gerencie mensagens padrão para automatizar seu atendimento
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagens</h1>
          <p className="text-muted-foreground">
            Crie e gerencie mensagens padrão para automatizar seu atendimento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card className="shadow-midnight">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          
          {/* Filtros por categoria */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Todas ({templates.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name} ({templates.filter(t => t.category === category.id).length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates */}
      {filteredTemplates.length === 0 ? (
        <Card className="text-center py-12 shadow-midnight">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Crie seu primeiro template para começar a automatizar suas mensagens"
              }
            </p>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-midnight-lg transition-shadow shadow-midnight">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getCategoryColor(template.category)} bg-gray-50`}>
                      {React.createElement(getCategoryIcon(template.category), { className: "h-5 w-5" })}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name || "Sem nome"}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(template.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Conteúdo */}
                <div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content || "Sem conteúdo"}
                  </p>
                </div>

                {/* Variáveis */}
                {template.variables && template.variables.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Variáveis:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Tags:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 text-center pt-2">
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {template.metrics?.usage || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Usos</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Último uso: {template.lastUsedAt ? 
                        new Date(template.lastUsedAt).toLocaleDateString('pt-BR') : 
                        "Nunca"
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas Gerais */}
      {templates.length > 0 && (
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle>Resumo dos Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{templates.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              {categories.map((category) => (
                <div key={category.id} className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {templates.filter(t => t.category === category.id).length}
                  </div>
                  <div className="text-sm text-muted-foreground">{category.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingTemplate ? "Editar Template" : "Novo Template"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Template</label>
                <Input
                  placeholder="Ex: Boas-vindas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Conteúdo da Mensagem</label>
                <Textarea
                  placeholder="Digite sua mensagem... Use {{variavel}} para variáveis dinâmicas"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use chaves duplas para variáveis: {{nome}}, {{empresa}}, {{data}}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                <Input
                  placeholder="Ex: boas-vindas, primeiro-contato, atendimento"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
