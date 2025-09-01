import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Globe, 
  Shield, 
  Bell,
  Palette,
  Languages
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const t = useTranslations()

  const settingsSections = [
    {
      title: t('settings.businessHours'),
      description: 'Configure horários de funcionamento e fuso horário',
      icon: Clock,
      href: '/settings/business-hours',
      color: 'text-blue-500'
    },
    {
      title: t('settings.sla'),
      description: 'Configure acordos de nível de serviço',
      icon: Shield,
      href: '/settings/sla',
      color: 'text-green-500'
    },
    {
      title: t('settings.timezone'),
      description: 'Configure fuso horário da empresa',
      icon: Globe,
      href: '/settings/timezone',
      color: 'text-purple-500'
    },
    {
      title: t('settings.language'),
      description: 'Configure idioma da interface',
      icon: Languages,
      href: '/settings/language',
      color: 'text-orange-500'
    },
    {
      title: t('settings.theme'),
      description: 'Personalize aparência da interface',
      icon: Palette,
      href: '/settings/theme',
      color: 'text-pink-500'
    },
    {
      title: t('settings.notifications'),
      description: 'Configure notificações e alertas',
      icon: Bell,
      href: '/settings/notifications',
      color: 'text-red-500'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('settings.description')}
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon
          return (
            <Card key={index} className="shadow-midnight hover:shadow-midnight-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={section.href}>
                    Configurar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Exportar Configurações
            </Button>
            <Button variant="outline">
              Importar Configurações
            </Button>
            <Button variant="outline">
              Restaurar Padrões
            </Button>
            <Button variant="outline">
              Backup Automático
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
