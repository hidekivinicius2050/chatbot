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
  Clock,
  User
} from 'lucide-react'
import Link from 'next/link'

export default function TicketsPage() {
  const t = useTranslations()

  // Mock data - em produção viria de uma API
  const tickets = [
    {
      id: 'TICKET-001',
      subject: 'Problema com login no sistema',
      customer: 'João Silva',
      status: 'open',
      priority: 'high',
      assignedTo: 'Maria Santos',
      createdAt: '2024-01-15T10:00:00Z',
      lastMessage: '2 min atrás',
      unreadCount: 3
    },
    {
      id: 'TICKET-002',
      subject: 'Dúvida sobre funcionalidade',
      customer: 'Ana Costa',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'Carlos Lima',
      createdAt: '2024-01-15T09:30:00Z',
      lastMessage: '15 min atrás',
      unreadCount: 0
    },
    {
      id: 'TICKET-003',
      subject: 'Solicitação de nova feature',
      customer: 'Pedro Santos',
      status: 'closed',
      priority: 'low',
      assignedTo: 'Maria Santos',
      createdAt: '2024-01-14T16:00:00Z',
      lastMessage: '2h atrás',
      unreadCount: 0
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'default', label: t('tickets.statuses.open') },
      pending: { variant: 'warning', label: t('tickets.statuses.pending') },
      closed: { variant: 'secondary', label: t('tickets.statuses.closed') }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary', label: t('tickets.priorities.low') },
      medium: { variant: 'warning', label: t('tickets.priorities.medium') },
      high: { variant: 'destructive', label: t('tickets.priorities.high') }
    }
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('tickets.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('tickets.description')}
          </p>
        </div>
        
        <Button asChild className="flex items-center gap-2">
          <Link href="/tickets/new">
            <Plus className="h-4 w-4" />
            {t('tickets.newTicket')}
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
              placeholder="Buscar tickets por assunto, cliente ou ID..."
              className="pl-10"
              aria-label={t('common.search')}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              Todos os Status
            </Button>
            <Button variant="outline" size="sm">
              Todas as Prioridades
            </Button>
            <Button variant="outline" size="sm">
              Todos os Atendentes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="shadow-midnight hover:shadow-midnight-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link 
                      href={`/tickets/${ticket.id}`}
                      className="text-lg font-semibold text-foreground hover:text-brand transition-colors"
                    >
                      {ticket.id}
                    </Link>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    {ticket.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {ticket.unreadCount} não lidas
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {ticket.subject}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {ticket.customer}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {ticket.lastMessage}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{t('tickets.assignedTo')}: {ticket.assignedTo}</span>
                    <span>{t('tickets.createdAt')}: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/tickets/${ticket.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {tickets.length === 0 && (
        <Card className="shadow-midnight">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum ticket encontrado
            </h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros de busca ou crie um novo ticket
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
