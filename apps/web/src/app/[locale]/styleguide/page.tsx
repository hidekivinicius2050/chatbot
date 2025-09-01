import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Palette,
  Type,
  MousePointer,
  Layers,
  Zap
} from 'lucide-react'

export default function StyleguidePage() {
  const t = useTranslations()

  const colors = [
    { name: 'Primary', class: 'bg-primary', hex: '#6366f1' },
    { name: 'Secondary', class: 'bg-secondary', hex: '#64748b' },
    { name: 'Accent', class: 'bg-accent', hex: '#f59e0b' },
    { name: 'Success', class: 'bg-success', hex: '#22c55e' },
    { name: 'Warning', class: 'bg-warning', hex: '#f59e0b' },
    { name: 'Destructive', class: 'bg-destructive', hex: '#ef4444' },
    { name: 'Muted', class: 'bg-muted', hex: '#64748b' },
    { name: 'Border', class: 'bg-border', hex: '#334155' }
  ]

  const buttonVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'outline', label: 'Outline' },
    { variant: 'ghost', label: 'Ghost' },
    { variant: 'link', label: 'Link' },
    { variant: 'destructive', label: 'Destructive' }
  ]

  const badgeVariants = [
    { variant: 'default', label: 'Default' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'outline', label: 'Outline' },
    { variant: 'success', label: 'Success' },
    { variant: 'warning', label: 'Warning' },
    { variant: 'destructive', label: 'Destructive' }
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Guia de Estilo
        </h1>
        <p className="text-muted-foreground mt-1">
          Documentação visual dos componentes e tokens de design
        </p>
      </div>

      {/* Colors */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand" />
            Cores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div className={`w-full h-20 rounded-lg ${color.class} border border-border`} />
                <div>
                  <p className="font-medium text-sm">{color.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-brand" />
            Tipografia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1 - Título Principal</h1>
            <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Heading 2 - Subtítulo</h2>
            <p className="text-sm text-muted-foreground">text-3xl font-semibold</p>
          </div>
          <div>
            <h3 className="text-2xl font-medium">Heading 3 - Seção</h3>
            <p className="text-sm text-muted-foreground">text-2xl font-medium</p>
          </div>
          <div>
            <p className="text-lg">Body Large - Texto grande</p>
            <p className="text-sm text-muted-foreground">text-lg</p>
          </div>
          <div>
            <p className="text-base">Body - Texto padrão</p>
            <p className="text-sm text-muted-foreground">text-base</p>
          </div>
          <div>
            <p className="text-sm">Body Small - Texto pequeno</p>
            <p className="text-sm text-muted-foreground">text-sm</p>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-brand" />
            Botões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Variantes</h4>
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map((btn) => (
                <Button key={btn.variant} variant={btn.variant as any}>
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Tamanhos</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Estados</h4>
            <div className="flex flex-wrap gap-3">
              <Button>Normal</Button>
              <Button disabled>Desabilitado</Button>
              <Button>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Loading
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand" />
            Elementos de Formulário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input</label>
              <Input placeholder="Digite algo..." />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Textarea</label>
              <Textarea placeholder="Digite uma mensagem..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Input com ícone</label>
            <div className="relative">
              <Input placeholder="Buscar..." className="pl-10" />
              <MousePointer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {badgeVariants.map((badge) => (
              <Badge key={badge.variant} variant={badge.variant as any}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle>Espaçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Space 1 (0.25rem)</p>
              <div className="w-1 h-4 bg-brand rounded"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Space 2 (0.5rem)</p>
              <div className="w-2 h-4 bg-brand rounded"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Space 4 (1rem)</p>
              <div className="w-4 h-4 bg-brand rounded"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Space 6 (1.5rem)</p>
              <div className="w-6 h-4 bg-brand rounded"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Space 8 (2rem)</p>
              <div className="w-8 h-4 bg-brand rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shadows */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle>Sombras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Shadow Default</p>
              <div className="w-24 h-24 bg-card rounded-lg shadow"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Shadow Midnight</p>
              <div className="w-24 h-24 bg-card rounded-lg shadow-midnight"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Shadow Large</p>
              <div className="w-24 h-24 bg-card rounded-lg shadow-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
