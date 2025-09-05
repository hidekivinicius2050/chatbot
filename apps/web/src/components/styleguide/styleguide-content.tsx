"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Palette,
  Type,
  Layout,
  MessageSquare,
  Eye,
  MousePointer
} from "lucide-react"

export function StyleguideContent() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Styleguide</h1>
        <p className="text-muted-foreground text-lg">
          Sistema de Design Chatbot 2.0 - Tema "Midnight Blue"
        </p>
      </div>

      {/* Color Palette */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand" />
            Paleta de Cores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Background */}
            <div className="space-y-2">
              <div className="h-20 bg-background border border-border rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Background</p>
                <p className="text-xs text-muted-foreground">--bg</p>
              </div>
            </div>
            
            {/* Foreground */}
            <div className="space-y-2">
              <div className="h-20 bg-foreground rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Foreground</p>
                <p className="text-xs text-muted-foreground">--fg</p>
              </div>
            </div>
            
            {/* Brand */}
            <div className="space-y-2">
              <div className="h-20 bg-brand rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Brand</p>
                <p className="text-xs text-muted-foreground">--brand</p>
              </div>
            </div>
            
            {/* Primary */}
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Primary</p>
                <p className="text-xs text-muted-foreground">--primary</p>
              </div>
            </div>
            
            {/* Muted */}
            <div className="space-y-2">
              <div className="h-20 bg-muted rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Muted</p>
                <p className="text-xs text-muted-foreground">--muted</p>
              </div>
            </div>
            
            {/* Success */}
            <div className="space-y-2">
              <div className="h-20 bg-success rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Success</p>
                <p className="text-xs text-muted-foreground">--success</p>
              </div>
            </div>
            
            {/* Warning */}
            <div className="space-y-2">
              <div className="h-20 bg-warning rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Warning</p>
                <p className="text-xs text-muted-foreground">--warning</p>
              </div>
            </div>
            
            {/* Destructive */}
            <div className="space-y-2">
              <div className="h-20 bg-destructive rounded-2xl"></div>
              <div className="text-center">
                <p className="font-medium text-foreground">Destructive</p>
                <p className="text-xs text-muted-foreground">--destructive</p>
              </div>
            </div>
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
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Fontes</h2>
            <div className="space-y-2">
              <p className="font-ui text-base">Inter (UI) - Fonte principal para interface</p>
              <p className="font-mono text-base">JetBrains Mono - Para IDs, código e dados técnicos</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Tamanhos</h2>
            <div className="space-y-2">
              <p className="text-base">text-base (14px) - Texto padrão</p>
              <p className="text-headline">text-headline (16px) - Títulos e destaques</p>
              <p className="text-sm">text-sm (12px) - Texto pequeno</p>
              <p className="text-xs">text-xs (10px) - Texto muito pequeno</p>
            </div>
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
          {/* Variants */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Variantes</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="brand">Brand</Button>
            </div>
          </div>
          
          {/* Sizes */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Tamanhos</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🎯</Button>
              <Button size="compact">Compact</Button>
            </div>
          </div>
          
          {/* States */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Estados</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button className="opacity-70">Loading...</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-brand" />
            Elementos de Formulário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Inputs</h3>
            <div className="space-y-3 max-w-md">
              <Input placeholder="Input padrão" />
              <Input placeholder="Input com valor" value="Texto de exemplo" />
              <Input placeholder="Input desabilitado" disabled />
              <Input placeholder="Input com erro" className="border-destructive" />
            </div>
          </div>
          
          {/* Textarea */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Textarea</h3>
            <div className="max-w-md">
              <Textarea placeholder="Digite sua mensagem aqui..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badges */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Status de Tickets</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="open">Aberto</Badge>
              <Badge variant="pending">Pendente</Badge>
              <Badge variant="closed">Fechado</Badge>
            </div>
          </div>
          
          {/* Connection Badges */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Status de Conexão</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="online">Online</Badge>
              <Badge variant="offline">Offline</Badge>
              <Badge variant="error">Erro</Badge>
            </div>
          </div>
          
          {/* SLA Badges */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">SLA</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="sla_normal">Normal</Badge>
              <Badge variant="sla_warning">Atenção</Badge>
              <Badge variant="sla_critical">Crítico</Badge>
            </div>
          </div>
          
          {/* Default Badges */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Badges Padrão</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Bubbles */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand" />
            Chat Bubbles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Types */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Tipos de Mensagem</h3>
            <div className="space-y-4">
              {/* My message */}
              <div className="flex justify-end">
                <div className="chat-bubble chat-bubble-mine max-w-[70%]">
                  <p>Esta é uma mensagem minha</p>
                  <div className="message-meta">
                    <span>14:30</span>
                    <span>✓</span>
                  </div>
                </div>
              </div>
              
              {/* Other message */}
              <div className="flex justify-start">
                <div className="chat-bubble chat-bubble-other max-w-[70%]">
                  <p>Esta é uma mensagem de outra pessoa</p>
                  <div className="message-meta">
                    <span>14:32</span>
                  </div>
                </div>
              </div>
              
              {/* Message with attachment */}
              <div className="flex justify-end">
                <div className="chat-bubble chat-bubble-mine max-w-[70%]">
                  <p>Mensagem com anexo</p>
                  <div className="mt-2 p-2 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <span>📎</span>
                      <span>documento.pdf</span>
                      <span className="text-muted-foreground">(245 KB)</span>
                    </div>
                  </div>
                  <div className="message-meta">
                    <span>14:35</span>
                    <span>✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Message States */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Estados da Mensagem</h3>
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="chat-bubble chat-bubble-mine chat-bubble-sending max-w-[70%]">
                  <p>Mensagem sendo enviada...</p>
                  <div className="message-meta">
                    <span>Enviando...</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="chat-bubble chat-bubble-mine chat-bubble-failed max-w-[70%]">
                  <p>Mensagem com erro</p>
                  <div className="message-meta">
                    <span>14:40</span>
                    <span>❌ Tentar novamente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Typing Indicator */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Indicador de Digitação</h3>
            <div className="flex justify-start">
              <div className="chat-bubble chat-bubble-other max-w-[70%]">
                <div className="typing-indicator">
                  <span>João está digitando</span>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Example */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-brand" />
            Tabela Compacta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-foreground">ID</th>
                  <th className="text-left p-3 font-medium text-foreground">Cliente</th>
                  <th className="text-left p-3 font-medium text-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-foreground">SLA</th>
                  <th className="text-left p-3 font-medium text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-3 font-mono text-foreground">#1234</td>
                  <td className="p-3 text-foreground">João Silva</td>
                  <td className="p-3">
                    <Badge variant="open">Aberto</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="sla_warning">30m</Badge>
                  </td>
                  <td className="p-3">
                    <Button variant="outline" size="sm">Ver</Button>
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-3 font-mono text-foreground">#1235</td>
                  <td className="p-3 text-foreground">Ana Costa</td>
                  <td className="p-3">
                    <Badge variant="pending">Pendente</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="sla_normal">2h</Badge>
                  </td>
                  <td className="p-3">
                    <Button variant="outline" size="sm">Ver</Button>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-foreground">#1236</td>
                  <td className="p-3 text-foreground">Pedro Santos</td>
                  <td className="p-3">
                    <Badge variant="closed">Fechado</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="sla_normal">Resolvido</Badge>
                  </td>
                  <td className="p-3">
                    <Button variant="outline" size="sm">Ver</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Design Tokens */}
      <Card className="shadow-midnight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand" />
            Design Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Espaçamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-brand rounded"></div>
                  <span>4px (1rem)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand rounded"></div>
                  <span>6px (1.5rem)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand rounded"></div>
                  <span>8px (2rem)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-brand rounded"></div>
                  <span>12px (3rem)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Border Radius</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand rounded-lg"></div>
                  <span>16px (rounded-2xl)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand rounded-xl"></div>
                  <span>12px (rounded-xl)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand rounded"></div>
                  <span>6px (rounded)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
