import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Users,
  Activity
} from 'lucide-react'

export default function DashboardPage() {
  const t = useTranslations()

  // Mock data - em produção viria de uma API
  const stats = [
    {
      title: t('dashboard.totalTickets'),
      value: '1,234',
      change: '+12%',
      isPositive: true,
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      title: t('dashboard.openTickets'),
      value: '89',
      change: '-5%',
      isPositive: true,
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      title: t('dashboard.resolvedTickets'),
      value: '1,145',
      change: '+8%',
      isPositive: true,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: t('dashboard.avgResponseTime'),
      value: '2.3h',
      change: '-15%',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'ticket_created',
      message: 'Novo ticket criado por João Silva',
      time: '2 min atrás',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'ticket_resolved',
      message: 'Ticket #1234 resolvido por Maria Santos',
      time: '15 min atrás',
      priority: 'low'
    },
    {
      id: 3,
      type: 'sla_breach',
      message: 'SLA vencido para ticket #1235',
      time: '1h atrás',
      priority: 'high'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard.description')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="shadow-midnight">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={stat.isPositive ? "success" : "destructive"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    vs. mês anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Compliance Chart */}
        <Card className="lg:col-span-2 shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand" />
              {t('dashboard.slaCompliance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-2xl">
              <div className="text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Gráfico de Compliance</p>
                <p className="text-sm text-muted-foreground">
                  Integração com Chart.js em breve
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={activity.priority === 'high' ? 'destructive' : 
                                activity.priority === 'medium' ? 'warning' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.priority === 'high' ? 'Alta' : 
                         activity.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
