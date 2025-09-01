# Sprint 3: PWA + Web Push/Notificações + Polimento Final

## 🎯 Objetivo
Evoluir o `apps/web` para uma experiência "produto" com PWA (instalável, offline básico), notificações (push, desktop, som), DND/quiet hours, e polimento visual no tema Midnight Violet.

## ✨ Funcionalidades Implementadas

### 1. PWA (Progressive Web App)
- **Manifest.json**: Configuração completa com ícones, shortcuts e metadados
- **Service Worker**: Cache inteligente, offline support e background sync
- **Instalação**: Prompt automático para instalar como app
- **Offline**: Página offline personalizada com funcionalidades básicas

### 2. Web Push Notifications
- **VAPID Keys**: Configuração para push notifications
- **Service Worker**: Gerenciamento de push e notificações
- **API Integration**: Endpoints para subscribe/unsubscribe
- **Background Sync**: Sincronização de mensagens offline

### 3. Sistema de Notificações
- **Desktop Notifications**: Notificações nativas do navegador
- **Push Notifications**: Notificações push via Service Worker
- **Sons**: Múltiplas opções de som com preview
- **DND/Quiet Hours**: Modo silencioso configurável

### 4. Preferências do Usuário
- **Página de Configurações**: `/settings/notifications`
- **Controles Granulares**: Master toggle, desktop, push, som
- **DND Configurável**: Horários personalizáveis
- **Teste de Notificação**: Botão para testar configurações

### 5. Painel de Notificações no Chat
- **Status em Tempo Real**: Conexão, notificações, DND
- **Controles Rápidos**: Toggle DND, teste de som
- **Indicadores Visuais**: Badges coloridos para status

## 🏗️ Arquitetura

### Service Worker (`/public/sw.js`)
```javascript
// Estratégias de cache
- static: Cache First para assets
- dynamic: Network First para dados
- page: Stale While Revalidate para páginas

// Push notifications
- Recebimento de payloads
- Exibição de notificações
- Navegação ao clicar
- Background sync
```

### Hook PWA (`/src/hooks/use-pwa.ts`)
```typescript
interface PWAState {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  swVersion: string | null;
  notificationPermission: NotificationPermission;
  isSubscribed: boolean;
  isDndActive: boolean;
  dndUntil: string | null;
}
```

### Componentes PWA
- `ServiceWorkerRegister`: Registro automático do SW
- `InstallPrompt`: Prompt de instalação PWA
- `NotificationPanel`: Painel de status no chat

## 📱 PWA Features

### Manifest.json
- **Nome**: AtendeChat - Suporte Inteligente
- **Tema**: Midnight Violet (#8B5CF6)
- **Display**: standalone
- **Shortcuts**: Tickets, Dashboard, Automações
- **Ícones**: 72x72 até 512x512 (maskable)

### Service Worker
- **Cache Estático**: Assets, fontes, páginas principais
- **Cache Dinâmico**: Dados de tickets e mensagens
- **Offline Support**: Fallback para páginas offline
- **Push Handling**: Notificações push com ações

### Instalação
- **Prompt Automático**: Aparece quando PWA pode ser instalada
- **Benefícios**: Lista vantagens da instalação
- **Dismiss**: Opção para não mostrar novamente

## 🔔 Sistema de Notificações

### Tipos de Notificação
1. **Desktop**: Notificações nativas do navegador
2. **Push**: Notificações push via Service Worker
3. **Som**: Múltiplas opções com preview

### Configurações
- **Master Toggle**: Controla todas as notificações
- **Granular**: Desktop e push separadamente
- **Som**: Seleção com preview
- **DND**: Horários configuráveis

### DND (Do Not Disturb)
- **Horários**: Início e fim configuráveis
- **Status Visual**: Indicação clara quando ativo
- **Respeito**: API não envia notificações durante DND
- **Exceções**: Notificações de alta prioridade

## 🎨 Polimento Visual (Midnight Violet)

### Tema
- **Cores**: Violeta (#8B5CF6) como cor principal
- **Gradientes**: Transições suaves entre tons
- **Sombras**: Sombras violetas para profundidade
- **Focus**: Ring violeta em todos os componentes

### Componentes
- **Cards**: Bordas arredondadas e sombras suaves
- **Botões**: Variantes com gradientes violetas
- **Badges**: Status coloridos e informativos
- **Formulários**: Inputs com bordas arredondadas

## 🚀 Como Usar

### 1. Instalação PWA
```bash
# O prompt aparece automaticamente
# Ou use o menu do navegador (3 pontos > Instalar app)
```

### 2. Configurar Notificações
```bash
# Navegue para /settings/notifications
# Ative as permissões necessárias
# Configure sons e DND
```

### 3. Testar Funcionalidades
```bash
# Teste de notificação
# Toggle DND
# Preview de sons
# Modo offline
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# .env.local
WEB_PUSH_ENABLED=true
WEB_PUBLIC_VAPID_PUBLIC_KEY=BFl9bBh4V1HvIYFPBRfEhx3YwwetsrgKCPMuF9uBuN04TUG1nhl4fg9FPTQBUX7yiRv0GpyUjj_YSvnIkosIioA
WEB_PUSH_VAPID_PRIVATE_KEY=McDv8UTA8k4b7WEJK5H7MMHS9KxOnojeWfKKni0v3To
WEB_PUSH_SUBJECT=mailto:contato@seudominio.com
NOTIFY_DEFAULT_SOUND=ping-1
NOTIFY_QUIET_HOURS_START=22:00
NOTIFY_QUIET_HOURS_END=07:00
```

### VAPID Keys
```bash
# Gerar chaves (uma vez)
npx web-push generate-vapid-keys

# Copiar para .env.local
```

## 📁 Estrutura de Arquivos

```
apps/web/
├── public/
│   ├── manifest.json          # Configuração PWA
│   ├── sw.js                  # Service Worker
│   └── offline.html           # Página offline
├── src/
│   ├── components/
│   │   ├── pwa/
│   │   │   ├── service-worker-register.tsx
│   │   │   └── install-prompt.tsx
│   │   ├── chat/
│   │   │   └── notification-panel.tsx
│   │   └── ui/
│   │       ├── tooltip.tsx
│   │       ├── popover.tsx
│   │       ├── switch.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       └── card.tsx
│   ├── hooks/
│   │   ├── use-pwa.ts         # Hook principal PWA
│   │   └── use-toast.ts       # Hook para toasts
│   ├── app/[locale]/
│   │   ├── settings/
│   │   │   └── notifications/ # Página de configurações
│   │   └── layout.tsx         # Layout com PWA
│   └── messages/
│       ├── pt-BR.json         # Traduções PT
│       └── en-US.json         # Traduções EN
├── next.config.js             # Configuração PWA
├── package.json               # Scripts PWA
└── env.example                # Variáveis de ambiente
```

## 🧪 Testes

### E2E (Playwright)
```bash
# Testar instalação PWA
pnpm test:e2e --grep "PWA"

# Testar notificações
pnpm test:e2e --grep "notifications"

# Testar modo offline
pnpm test:e2e --grep "offline"
```

### Lighthouse
```bash
# Testar PWA
pnpm lighthouse

# Verificar métricas
# - PWA: Installable
# - Performance: ≥ 90
# - Accessibility: ≥ 95
```

## 📊 Métricas de Aceitação

### ✅ PWA
- [x] Manifest.json configurado
- [x] Service Worker registrado
- [x] Instalável como app
- [x] Funciona offline
- [x] Ícones corretos

### ✅ Notificações
- [x] Push notifications funcionando
- [x] Desktop notifications
- [x] Sons configuráveis
- [x] DND respeitado
- [x] Preferências por usuário

### ✅ Visual
- [x] Tema Midnight Violet
- [x] Focus rings visíveis
- [x] Sombras suaves
- [x] Componentes polidos
- [x] Responsivo

### ✅ Funcionalidades
- [x] Offline básico
- [x] Background sync
- [x] Teste de notificação
- [x] Configurações salvas
- [x] i18n completo

## 🚀 Scripts Disponíveis

```json
{
  "scripts": {
    "pwa:icons": "pwa-asset-generator ./public/logo.png ./public --background '#0E0E11' --favicon",
    "pwa:build": "npm run build && npm run pwa:icons",
    "lighthouse": "lighthouse http://localhost:3000 --preset=desktop --quiet --output=json --output-path=./.lighthouse/report.json"
  }
}
```

## 🔄 Próximos Passos

### Sprint 4 (Futuro)
- **Mobile App Wrapper**: App nativo para iOS/Android
- **Notificações por Email**: Fallback para push
- **Analytics**: Métricas de uso PWA
- **A/B Testing**: Testar diferentes configurações

### Melhorias Contínuas
- **Performance**: Otimizar cache e bundle
- **UX**: Refinar fluxos de instalação
- **Acessibilidade**: Melhorar suporte a leitores de tela
- **Internacionalização**: Mais idiomas

## 🐛 Troubleshooting

### PWA não instala
```bash
# Verificar manifest.json
# Verificar Service Worker
# Verificar HTTPS (necessário para PWA)
# Verificar permissões do navegador
```

### Notificações não funcionam
```bash
# Verificar permissões
# Verificar VAPID keys
# Verificar Service Worker
# Verificar console para erros
```

### Offline não funciona
```bash
# Verificar cache do Service Worker
# Verificar estratégias de cache
# Verificar fallback offline
```

## 📚 Recursos

### Documentação
- [MDN PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Ferramentas
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web Push](https://web-push-codelab.glitch.me/)

---

**Status**: ✅ Concluído  
**Data**: Dezembro 2024  
**Versão**: 1.0.0  
**Equipe**: Frontend Team
