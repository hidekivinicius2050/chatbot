# Checklist de Pré-Go-Live

**Versão:** 1.0.0-rc.1  
**Data:** ___________  
**Responsável:** ___________  
**Status:** ⏳ PENDENTE  

## 📋 Visão Geral

Este checklist deve ser executado **24-48 horas antes** do go-live para garantir que todos os sistemas estejam prontos para produção.

---

## 🔒 1. Infraestrutura e DNS

### 1.1 Configuração de DNS
- [ ] **Domínio principal configurado**
  - [ ] A record apontando para IP do servidor
  - [ ] CNAME para www apontando para domínio principal
  - [ ] MX records configurados (se aplicável)
  - [ ] TXT records para verificação de domínio

- [ ] **SSL/TLS configurado**
  - [ ] Certificado válido instalado
  - [ ] Redirecionamento HTTP → HTTPS funcionando
  - [ ] HSTS configurado (opcional)
  - [ ] Validação de certificado em todos os subdomínios

### 1.2 Servidor e Rede
- [ ] **Servidor de produção**
  - [ ] Hardware dimensionado adequadamente
  - [ ] Sistema operacional atualizado
  - [ ] Firewall configurado
  - [ ] Acesso SSH restrito

- [ ] **Monitoramento**
  - [ ] Sistema de monitoramento ativo
  - [ ] Alertas configurados
  - [ ] Logs centralizados
  - [ ] Métricas de performance

---

## 🌍 2. Variáveis de Ambiente

### 2.1 Configurações Críticas
- [ ] **Banco de dados**
  - [ ] `DATABASE_URL` configurada para produção
  - [ ] `DATABASE_SSL` habilitado
  - [ ] Pool de conexões otimizado

- [ ] **API e Serviços**
  - [ ] `API_URL` apontando para produção
  - [ ] `JWT_SECRET` alterado do padrão
  - [ ] `ENCRYPTION_KEY` configurada
  - [ ] `REDIS_URL` configurada

- [ ] **WhatsApp e Canais**
  - [ ] `WHATSAPP_CLOUD_TOKEN` configurado
  - [ ] `WHATSAPP_PHONE_ID` configurado
  - [ ] Webhooks configurados e testados

### 2.2 Configurações Opcionais
- [ ] **Observabilidade**
  - [ ] `SENTRY_DSN` configurado (se aplicável)
  - [ ] `POSTHOG_KEY` configurado (se aplicável)
  - [ ] `POSTHOG_HOST` configurado

- [ ] **Onboarding e Help Center**
  - [ ] `ONBOARDING_ENABLED=true`
  - [ ] `HELP_CENTER_ENABLED=true`
  - [ ] `ONBOARDING_DEFAULT_CHANNEL` configurado

---

## 🗄️ 3. Banco de Dados

### 3.1 Migrações
- [ ] **Execução de migrações**
  - [ ] Dry-run das migrações em ambiente de teste
  - [ ] Backup completo do banco atual
  - [ ] Migrações aplicadas em produção
  - [ ] Verificação de integridade dos dados

### 3.2 Seeds e Dados Iniciais
- [ ] **Dados de configuração**
  - [ ] Planos e preços configurados
  - [ ] Templates padrão criados
  - [ ] Configurações de SLA definidas
  - [ ] Usuários administradores criados

- [ ] **Dados de teste**
  - [ ] Empresa de demonstração criada
  - [ ] Usuários de teste configurados
  - [ ] Tickets de exemplo disponíveis
  - [ ] Campanhas de teste configuradas

---

## 🧪 4. Testes e Validação

### 4.1 Testes Automatizados
- [ ] **Testes unitários**
  - [ ] Todos os testes passando
  - [ ] Cobertura de código ≥ 80%
  - [ ] Testes de integração executados

- [ ] **Testes E2E**
  - [ ] Playwright executado com sucesso
  - [ ] Cenários críticos validados
  - [ ] Testes de performance executados

### 4.2 Testes Manuais
- [ ] **Funcionalidades críticas**
  - [ ] Login e autenticação
  - [ ] Criação de tickets
  - [ ] Chat funcionando
  - [ ] Notificações push
  - [ ] PWA instalável

- [ ] **Fluxos de negócio**
  - [ ] Onboarding wizard
  - [ ] Criação de campanhas
  - [ ] Relatórios e dashboards
  - [ ] Configurações de usuário

---

## 📊 5. Performance e Monitoramento

### 5.1 Métricas de Performance
- [ ] **Lighthouse**
  - [ ] Performance ≥ 90
  - [ ] Acessibilidade ≥ 95
  - [ ] SEO ≥ 90
  - [ ] PWA "Installable"

- [ ] **Testes de carga**
  - [ ] k6 executado com sucesso
  - [ ] Sistema suporta carga esperada
  - [ ] Tempo de resposta < 2s
  - [ ] Throughput adequado

### 5.2 Monitoramento
- [ ] **Health checks**
  - [ ] `/api/v1/health` respondendo
  - [ ] `/metrics` disponível
  - [ ] SLOs configurados
  - [ ] Alertas funcionando

---

## 🔐 6. Segurança

### 6.1 Configurações de Segurança
- [ ] **Autenticação**
  - [ ] Rate limiting configurado
  - [ ] CORS configurado adequadamente
  - [ ] Headers de segurança configurados
  - [ ] Validação de entrada implementada

- [ ] **Dados sensíveis**
  - [ ] Chaves de API não expostas
  - [ ] Logs não contêm PII
  - [ ] Backup criptografado
  - [ ] Acesso restrito a dados críticos

---

## 📱 7. PWA e Notificações

### 7.1 PWA
- [ ] **Manifest e Service Worker**
  - [ ] `manifest.json` configurado
  - [ ] Service Worker registrado
  - [ ] Ícones gerados corretamente
  - [ ] Offline funcionando

### 7.2 Notificações
- [ ] **Web Push**
  - [ ] VAPID keys configuradas
  - [ ] Notificações funcionando
  - [ ] DND configurável
  - [ ] Sons configuráveis

---

## 📋 8. Documentação e Treinamento

### 8.1 Documentação
- [ ] **Documentação técnica**
  - [ ] README atualizado
  - [ ] CHANGELOG publicado
  - [ ] API docs atualizados
  - [ ] Runbooks criados

### 8.2 Treinamento
- [ ] **Equipe preparada**
  - [ ] UAT executado com sucesso
  - [ ] Equipe treinada nas funcionalidades
  - [ ] Processos documentados
  - [ ] Contatos de suporte definidos

---

## 🚀 9. Preparação para Go-Live

### 9.1 Comunicação
- [ ] **Stakeholders notificados**
  - [ ] Data e horário confirmados
  - [ ] Plano de rollback comunicado
  - [ ] Contatos de emergência definidos
  - [ ] Cronograma compartilhado

### 9.2 Rollback
- [ ] **Plano de rollback**
  - [ ] Tag anterior identificada
  - [ ] Scripts de rollback testados
  - [ ] Procedimento documentado
  - [ ] Equipe treinada

---

## ✅ 10. Checklist Final

### 10.1 Validação Final
- [ ] **Sistema estável**
  - [ ] Todos os testes passando
  - [ ] Performance dentro do esperado
  - [ ] Monitoramento ativo
  - [ ] Backup recente realizado

- [ ] **Equipe pronta**
  - [ ] Todos os checklists completados
  - [ ] Equipe de plantão definida
  - [ ] Procedimentos de emergência conhecidos
  - [ ] Go-live aprovado

---

## 📝 Observações

**Problemas encontrados:**
- 

**Ações tomadas:**
- 

**Próximos passos:**
- 

---

## 🎯 Status Final

- [ ] **APROVADO PARA GO-LIVE**
- [ ] **PENDENTE DE CORREÇÕES**
- [ ] **REPROVADO**

**Responsável pela aprovação:** ___________  
**Data:** ___________  
**Assinatura:** ___________

---

## 📞 Contatos de Emergência

**DevOps/Infraestrutura:** ___________  
**Desenvolvimento:** ___________  
**QA/Testes:** ___________  
**Product Owner:** ___________  
**Stakeholder Principal:** ___________
