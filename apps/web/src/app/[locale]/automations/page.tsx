import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Plus,
  MessageSquare,
  User,
  Hash,
  Play,
  Pause,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function AutomationsPage() {
  const t = useTranslations()

  // Mock data - em produção viria de uma API
  const automations = [
    {
      id: 'AUTO-001',
      name: 'Boas-vindas para novos clientes',
      description: 'Envia mensagem de boas-vindas automaticamente quando um novo cliente é criado',
      enabled: true,
      type: 'contact',
      triggers: 1,
      conditions: 2,
      actions: 3,
      lastRun: '2024-01-15T10:00:00Z',
      executions: 45,
      successRate: 98.5
    },
    {
      id: 'AUTO-002',
      name: 'Escalação de tickets urgentes',
      description: 'Escala automaticamente tickets com prioridade alta para supervisores',
      enabled: true,
      type: 'ticket',
      triggers: 2,
      conditions: 1,
      actions: 2,
      lastRun: '2024-01-15T09:30:00Z',
      executions: 12,
      successRate: 100
    },
    {
      id: 'AUTO-003',
      name: 'Lembrete de follow-up',
      description: 'Envia lembretes para atendentes sobre tickets que precisam de follow-up',
      enabled: false,
      type: 'ticket',
      triggers: 1,
      conditions: 3,
      actions: 1,
      lastRun: '2024-01-14T16:00:00Z',
      executions: 28,
      successRate: 95.2
    }
  ]

  const getTypeIcon = (type: string) => {
    const iconMap = {
      contact: User,
      ticket: MessageSquare,
      campaign: Hash
    }
    return iconMap[type as keyof typeof iconMap] || MessageSquare
  }

  const getTypeLabel = (type: string) => {
    const labelMap = {
      contact: 'Contato',
      ticket: 'Ticket',
      campaign: 'Campanha'
    }
    return labelMap[type as keyof typeof labelMap] || type
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('automations.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('automations.description')}
          </p>
        </div>
        
        <Button asChild className="flex items-center gap-2">
          <Link href="/automations/new">
            <Plus className="h-4 w-4" />
            {t('automations.newAutomation')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar automações por nome ou descrição..."
              className="pl-10"
              aria-label={t('common.search')}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              Todas as Automações
            </Button>
            <Button variant="outline" size="sm">
              Apenas Ativas
            </Button>
            <Button variant="outline" size="sm">
              Todos os Tipos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => {
          const TypeIcon = getTypeIcon(automation.type)
          return (
            <Card key={automation.id} className="shadow-midnight hover:shadow-midnight-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        href={`/automations/${automation.id}`}
                        className="text-lg font-semibold text-foreground hover:text-brand transition-colors"
                      >
                        {automation.name}
                      </Link>
                      <Badge variant={automation.enabled ? "success" : "secondary"}>
                        {automation.enabled ? t('automations.enabled') : t('automations.disabled')}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TypeIcon className="h-3 w-3" />
                        {getTypeLabel(automation.type)}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {automation.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {automation.executions} execuções
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {automation.successRate}% sucesso
                      </div>
                      {automation.lastRun && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Última execução: {new Date(automation.lastRun).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{automation.triggers} trigger(s)</span>
                      <span>{automation.conditions} condição(ões)</span>
                      <span>{automation.actions} ação(ões)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={automation.enabled ? 'text-orange-600' : 'text-green-600'}
                    >
                      {automation.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/automations/${automation.id}`}>
                        Ver
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {automations.length === 0 && (
        <Card className="shadow-midnight">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma automação encontrada
            </h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros de busca ou crie sua primeira automação
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
