import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/ui/skeleton'

// Lazy loading dos componentes pesados
const SlaReports = dynamic(
  () => import('@/components/reports/sla-reports').then(mod => ({ default: mod.SlaReports })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Desabilita SSR para componentes com gráficos
  }
)

const AutomationReports = dynamic(
  () => import('@/components/reports/automation-reports').then(mod => ({ default: mod.AutomationReports })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export default function ReportsPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('reports.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('reports.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatórios de SLA */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle>{t('reports.slaReports')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <SlaReports 
                slaReport={{
                  period: "Último mês",
                  slaConfig: { firstResponseMins: 15, resolutionMins: 240 },
                  totalTickets: 150,
                  firstResponseCompliance: 92.5,
                  resolutionCompliance: 88.3,
                  avgFirstResponseTime: 12,
                  avgResolutionTime: 180,
                  firstResponseBreaches: 11,
                  resolutionBreaches: 17
                }}
                previousPeriod={{
                  period: "Mês anterior",
                  slaConfig: { firstResponseMins: 15, resolutionMins: 240 },
                  totalTickets: 142,
                  firstResponseCompliance: 89.4,
                  resolutionCompliance: 85.2,
                  avgFirstResponseTime: 14,
                  avgResolutionTime: 195,
                  firstResponseBreaches: 15,
                  resolutionBreaches: 21
                }}
                breaches={[
                  {
                    id: "1",
                    ticketId: "TICKET-001",
                    customerName: "João Silva",
                    type: "first_response",
                    dueAt: new Date("2024-01-15T10:00:00Z"),
                    breachedAt: new Date("2024-01-15T10:30:00Z"),
                    overdueMinutes: 30,
                    agent: "Maria Santos",
                    priority: "high"
                  }
                ]}
                onExport={async (format) => {
                  console.log(`Exportando ${format}...`)
                }}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Relatórios de Automações */}
        <Card className="shadow-midnight">
          <CardHeader>
            <CardTitle>Relatórios de Automações</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <AutomationReports 
                automations={[]}
                onExport={async (format) => {
                  console.log(`Exportando ${format}...`)
                }}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
