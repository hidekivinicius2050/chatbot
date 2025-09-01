# Checklist de Cutover - Go-Live

**Versão:** 1.0.0-rc.1  
**Data do Go-Live:** ___________  
**Janela de Manutenção:** ___________  
**Responsável:** ___________  
**Status:** ⏳ PENDENTE  

## 🎯 Visão Geral

Este checklist deve ser executado **durante a janela de cutover** para garantir uma transição segura para produção.

---

## ⏰ 1. Pré-Cutover (1 hora antes)

### 1.1 Comunicação
- [ ] **Notificação aos usuários**
  - [ ] Email de manutenção enviado
  - [ ] Banner no sistema ativo
  - [ ] Status page atualizada
  - [ ] Equipe de suporte notificada

### 1.2 Preparação Final
- [ ] **Verificações de segurança**
  - [ ] Acesso SSH restrito
  - [ ] Firewall configurado
  - [ ] Monitoramento ativo
  - [ ] Backup automático configurado

- [ ] **Equipe de plantão**
  - [ ] DevOps online
  - [ ] Desenvolvedor de plantão
  - [ ] QA disponível
  - [ ] Product Owner acessível

---

## 🚀 2. Início do Cutover

### 2.1 Congelamento de Mudanças
- [ ] **Repositório**
  - [ ] Branch principal bloqueada
  - [ ] Pull requests pausados
  - [ ] Deploy automático desabilitado
  - [ ] Tag v1.0.0 criada

### 2.2 Backup Final
- [ ] **Banco de dados**
  - [ ] Backup completo executado
  - [ ] Verificação de integridade
  - [ ] Backup transferido para local seguro
  - [ ] Tempo de backup registrado

- [ ] **Arquivos e configurações**
  - [ ] Configurações de ambiente
  - [ ] Uploads de usuários
  - [ ] Logs do sistema
  - [ ] Certificados SSL

---

## 🔄 3. Deploy da Nova Versão

### 3.1 Aplicação da Tag
- [ ] **Versionamento**
  - [ ] Tag v1.0.0 aplicada
  - [ ] CHANGELOG atualizado
  - [ ] Release notes publicados
  - [ ] Version bump executado

### 3.2 Deploy da Aplicação
- [ ] **Container/Deploy**
  - [ ] `docker compose pull` executado
  - [ ] `docker compose up -d` executado
  - [ ] Health checks verificados
  - [ ] Logs monitorados

### 3.3 Verificação de Serviços
- [ ] **Serviços críticos**
  - [ ] API respondendo em `/api/v1/health`
  - [ ] WebSocket funcionando
  - [ ] Banco de dados conectado
  - [ ] Redis funcionando

---

## 🧪 4. Testes Pós-Deploy

### 4.1 Smoke Tests Automatizados
- [ ] **Playwright E2E**
  - [ ] Login funcionando
  - [ ] Dashboard carregando
  - [ ] Tickets acessíveis
  - [ ] Chat funcionando

- [ ] **k6 Performance**
  - [ ] `/tickets` respondendo < 2s
  - [ ] `/messages/send` funcionando
  - [ ] Throughput adequado
  - [ ] Sem erros 5xx

### 4.2 Testes Manuais Críticos
- [ ] **Funcionalidades core**
  - [ ] Login de usuário existente
  - [ ] Criação de novo ticket
  - [ ] Envio de mensagem
  - [ ] Notificação push

- [ ] **Integrações**
  - [ ] WhatsApp conectado
  - [ ] Webhooks funcionando
  - [ ] PWA instalável
  - [ ] Offline funcionando

---

## 📊 5. Validação de Métricas

### 5.1 SLOs e KPIs
- [ ] **Performance**
  - [ ] Tempo de resposta < 2s
  - [ ] Uptime > 99.9%
  - [ ] Error rate < 0.1%
  - [ ] Throughput adequado

- [ ] **Funcionalidade**
  - [ ] Todos os endpoints respondendo
  - [ ] WebSocket estável
  - [ ] Notificações funcionando
  - [ ] PWA instalável

### 5.2 Monitoramento
- [ ] **Alertas**
  - [ ] Alertas críticos configurados
  - [ ] Dashboards atualizados
  - [ ] Logs sendo coletados
  - [ ] Métricas sendo enviadas

---

## 🌐 6. Ativação de Tráfego

### 6.1 DNS e Load Balancer
- [ ] **Redirecionamento de tráfego**
  - [ ] DNS atualizado (se aplicável)
  - [ ] Load balancer configurado
  - [ ] SSL funcionando
  - [ ] Redirecionamentos ativos

### 6.2 Verificação de Acesso
- [ ] **Usuários externos**
  - [ ] Login funcionando
  - [ ] Funcionalidades acessíveis
  - [ ] Performance adequada
  - [ ] Sem erros visíveis

---

## ✅ 7. Validação Final

### 7.1 Checklist de Aceitação
- [ ] **Funcionalidades críticas**
  - [ ] ✅ Login e autenticação
  - [ ] ✅ Criação de tickets
  - [ ] ✅ Chat funcionando
  - [ ] ✅ Notificações push
  - [ ] ✅ PWA instalável
  - [ ] ✅ Onboarding wizard
  - [ ] ✅ Criação de campanhas
  - [ ] ✅ Relatórios funcionando

### 7.2 Performance e Estabilidade
- [ ] **Métricas**
  - [ ] ✅ Tempo de resposta < 2s
  - [ ] ✅ Uptime > 99.9%
  - [ ] ✅ Error rate < 0.1%
  - [ ] ✅ PWA "Installable"

---

## 📢 8. Comunicação de Sucesso

### 8.1 Notificação aos Stakeholders
- [ ] **Comunicação interna**
  - [ ] Equipe notificada
  - [ ] Status page atualizada
  - [ ] Slack/Discord atualizado
  - [ ] Email de confirmação

### 8.2 Comunicação Externa
- [ ] **Usuários e clientes**
  - [ ] Banner de manutenção removido
  - [ ] Status page atualizada
  - [ ] Email de go-live enviado
  - [ ] Redes sociais atualizadas

---

## 🔍 9. Monitoramento Pós-Go-Live

### 9.1 Primeiras 24 Horas
- [ ] **Monitoramento intensivo**
  - [ ] Equipe de plantão ativa
  - [ ] Alertas configurados
  - [ ] Logs sendo analisados
  - [ ] Métricas sendo coletadas

### 9.2 Verificações Periódicas
- [ ] **A cada 2 horas**
  - [ ] Health checks
  - [ ] Performance metrics
  - [ ] Error logs
  - [ ] User feedback

---

## 📝 10. Documentação e Lições Aprendidas

### 10.1 Documentação do Processo
- [ ] **Registro do cutover**
  - [ ] Tempo total documentado
  - [ ] Problemas encontrados
  - [ ] Soluções aplicadas
  - [ ] Melhorias identificadas

### 10.2 Atualização de Procedimentos
- [ ] **Runbooks e checklists**
  - [ ] Procedimentos atualizados
  - [ ] Lições aprendidas documentadas
  - [ ] Próximos passos definidos
  - [ ] Treinamento planejado

---

## 🎯 Status Final do Cutover

- [ ] **CUTOVER CONCLUÍDO COM SUCESSO**
- [ ] **CUTOVER CONCLUÍDO COM PROBLEMAS MENORES**
- [ ] **CUTOVER FALHOU - ROLLBACK NECESSÁRIO**

**Tempo total do cutover:** ___________  
**Problemas encontrados:** ___________  
**Ações tomadas:** ___________  

---

## 📞 Contatos Durante o Cutover

**DevOps Lead:** ___________  
**Desenvolvedor de Plantão:** ___________  
**QA Lead:** ___________  
**Product Owner:** ___________  
**Stakeholder Principal:** ___________  

**Equipe de Emergência:** ___________  
**Número de Emergência:** ___________  

---

## 🚨 Procedimento de Rollback

**Se o cutover falhar:**
1. **Imediatamente:** Notificar equipe de emergência
2. **5 minutos:** Executar rollback para tag anterior
3. **10 minutos:** Verificar estabilidade do sistema
4. **15 minutos:** Comunicar stakeholders
5. **30 minutos:** Análise post-mortem iniciada

**Tag de rollback:** ___________  
**Comando de rollback:** ___________  
**Responsável pelo rollback:** ___________
