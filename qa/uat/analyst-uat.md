# UAT - Analista

**Papel:** Analista de Dados e Relatórios  
**Data:** ___________  
**Testador:** ___________  
**Versão:** 1.0.0-rc.1  

## Pré-condições
- [ ] Acesso ao sistema como usuário com role "analyst"
- [ ] Navegador atualizado (Chrome/Firefox/Safari)
- [ ] Conexão estável com a internet
- [ ] Permissões de notificação habilitadas
- [ ] Dados de teste disponíveis no sistema

---

## 1. Login e Acesso

### 1.1 Login de Analista
**Pré-condição:** Usuário convidado pelo admin  
**Passos:**
1. Acessar `/login`
2. Inserir credenciais:
   - Email: "analyst.uat@teste.com"
   - Senha: "Teste@123"
3. Clicar em "Entrar"

**Resultado Esperado:**
- [ ] Login bem-sucedido
- [ ] Redirecionamento para `/dashboard`
- [ ] Interface de analista carregada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-1.1-login.png`

---

### 1.2 Verificar Permissões
**Pré-condição:** Usuário logado  
**Passos:**
1. Verificar menu lateral
2. Verificar páginas acessíveis
3. Verificar funcionalidades disponíveis

**Resultado Esperado:**
- [ ] Menu com foco em relatórios e análises
- [ ] Acesso a dashboard, relatórios, exportações
- [ ] Acesso limitado a configurações
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-1.2-permissoes.png`

---

## 2. Dashboard de Análise

### 2.1 Métricas Gerais
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/dashboard`
2. Verificar métricas principais:
   - Total de tickets
   - Taxa de resolução
   - Tempo médio de resposta
   - Satisfação do cliente
3. Verificar gráficos de tendência

**Resultado Esperado:**
- [ ] Métricas carregadas corretamente
- [ ] Gráficos funcionando
- [ ] Dados atualizados em tempo real
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-2.1-metricas.png`

---

### 2.2 Filtros de Período
**Pré-condição:** Dashboard carregado  
**Passos:**
1. Alterar período de análise:
   - Últimos 7 dias
   - Últimos 30 dias
   - Últimos 90 dias
   - Período personalizado
2. Verificar atualização dos dados

**Resultado Esperado:**
- [ ] Períodos selecionáveis
- [ ] Dados atualizados conforme período
- [ ] Gráficos redimensionados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-2.2-periodo.png`

---

### 2.3 Comparação de Períodos
**Pré-condição:** Dashboard carregado  
**Passos:**
1. Ativar modo de comparação
2. Selecionar período base e comparativo
3. Verificar diferenças percentuais
4. Analisar tendências

**Resultado Esperado:**
- [ ] Comparação ativada
- [ ] Diferenças calculadas
- [ ] Indicadores visuais claros
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-2.3-comparacao.png`

---

## 3. Relatórios de Tickets

### 3.1 Relatório de Volume
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/reports/tickets/volume`
2. Configurar parâmetros:
   - Período
   - Equipe
   - Canal
   - Status
3. Gerar relatório

**Resultado Esperado:**
- [ ] Relatório gerado
- [ ] Dados organizados por período
- [ ] Gráficos e tabelas funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-3.1-volume.png`

---

### 3.2 Relatório de Performance
**Pré-condição:** Relatório de volume carregado  
**Passos:**
1. Acessar aba "Performance"
2. Verificar métricas por agente:
   - Tickets atendidos
   - Tempo médio de resposta
   - SLA cumprido
   - Satisfação
3. Ordenar por diferentes critérios

**Resultado Esperado:**
- [ ] Métricas por agente visíveis
- [ ] Ordenação funcionando
- [ ] Dados consistentes
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-3.2-performance.png`

---

### 3.3 Relatório de SLA
**Pré-condição:** Relatório de performance carregado  
**Passos:**
1. Acessar aba "SLA"
2. Verificar:
   - Tickets dentro do SLA
   - Tickets em risco
   - Tickets violados
   - Tempo médio de resolução
3. Analisar tendências

**Resultado Esperado:**
- [ ] Dados de SLA carregados
- [ ] Categorização correta
- [ ] Tendências visíveis
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-3.3-sla.png`

---

## 4. Relatórios de Campanhas

### 4.1 Relatório de Campanhas
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/reports/campaigns`
2. Verificar métricas:
   - Campanhas ativas
   - Taxa de entrega
   - Taxa de resposta
   - Conversões
3. Filtrar por período

**Resultado Esperado:**
- [ ] Relatório de campanhas carregado
- [ ] Métricas calculadas corretamente
- [ ] Filtros funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-4.1-campanhas.png`

---

### 4.2 Análise de Conversão
**Pré-condição:** Relatório de campanhas carregado  
**Passos:**
1. Clicar em "Análise de Conversão"
2. Verificar funil de conversão
3. Analisar pontos de abandono
4. Verificar ROI das campanhas

**Resultado Esperado:**
- [ ] Funil de conversão visível
- [ ] Pontos de abandono identificados
- [ ] ROI calculado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-4.2-conversao.png`

---

## 5. Relatórios de Automações

### 5.1 Relatório de Automações
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/reports/automations`
2. Verificar:
   - Automações ativas
   - Taxa de execução
   - Tempo médio de processamento
   - Erros e falhas
3. Analisar eficiência

**Resultado Esperado:**
- [ ] Relatório de automações carregado
- [ ] Métricas de execução visíveis
- [ ] Análise de eficiência disponível
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-5.1-automacoes.png`

---

### 5.2 Análise de Impacto
**Pré-condição:** Relatório de automações carregado  
**Passos:**
1. Clicar em "Análise de Impacto"
2. Verificar:
   - Tickets processados automaticamente
   - Tempo economizado
   - Redução de trabalho manual
   - ROI das automações
3. Gerar insights

**Resultado Esperado:**
- [ ] Análise de impacto carregada
- [ ] Métricas de economia visíveis
- [ ] Insights gerados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-5.2-impacto.png`

---

## 6. Exportação de Dados

### 6.1 Exportar Relatório
**Pré-condição:** Relatório carregado  
**Passos:**
1. Clicar em "Exportar"
2. Selecionar formato:
   - PDF
   - Excel (XLSX)
   - CSV
   - JSON
3. Configurar opções de exportação
4. Baixar arquivo

**Resultado Esperado:**
- [ ] Opções de exportação disponíveis
- [ ] Arquivo gerado corretamente
- [ ] Download iniciado
- [ ] Formato correto
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-6.1-exportar.png`

---

### 6.2 Agendamento de Relatórios
**Pré-condição:** Relatório carregado  
**Passos:**
1. Clicar em "Agendar"
2. Configurar:
   - Frequência (diário, semanal, mensal)
   - Horário de envio
   - Destinatários
   - Formato
3. Salvar agendamento

**Resultado Esperado:**
- [ ] Configuração de agendamento
- [ ] Agendamento salvo
- [ ] Confirmação visual
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-6.2-agendar.png`

---

## 7. Análise Avançada

### 7.1 Análise de Tendências
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/reports/trends`
2. Selecionar métricas para análise:
   - Volume de tickets
   - Tempo de resposta
   - Satisfação
   - SLA
3. Aplicar algoritmos de tendência
4. Verificar previsões

**Resultado Esperado:**
- [ ] Análise de tendências carregada
- [ ] Algoritmos aplicados
- [ ] Previsões geradas
- [ ] Gráficos de tendência
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-7.1-tendencias.png`

---

### 7.2 Análise de Correlação
**Pré-condição:** Análise de tendências carregada  
**Passos:**
1. Selecionar variáveis para correlação
2. Aplicar análise estatística
3. Verificar coeficientes de correlação
4. Interpretar resultados

**Resultado Esperado:**
- [ ] Análise de correlação executada
- [ ] Coeficientes calculados
- [ ] Interpretação disponível
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-7.2-correlacao.png`

---

## 8. Dashboards Personalizados

### 8.1 Criar Dashboard
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/reports/dashboards`
2. Clicar em "Novo Dashboard"
3. Adicionar widgets:
   - Gráfico de linha
   - Tabela de dados
   - Métrica em destaque
   - Filtros
4. Salvar dashboard

**Resultado Esperado:**
- [ ] Dashboard criado
- [ ] Widgets adicionados
- [ ] Configuração salva
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-8.1-criar-dashboard.png`

---

### 8.2 Compartilhar Dashboard
**Pré-condição:** Dashboard criado  
**Passos:**
1. Clicar em "Compartilhar"
2. Configurar permissões:
   - Visualizar
   - Editar
   - Administrar
3. Adicionar usuários/equipes
4. Salvar configurações

**Resultado Esperado:**
- [ ] Configuração de compartilhamento
- [ ] Permissões aplicadas
- [ ] Usuários adicionados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-8.2-compartilhar.png`

---

## 9. Alertas e Notificações

### 9.1 Configurar Alertas
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/settings/alerts`
2. Criar alerta:
   - Métrica: "SLA violado"
   - Condição: "> 5%"
   - Frequência: "Em tempo real"
   - Destinatários: "Equipe de Suporte"
3. Salvar alerta

**Resultado Esperado:**
- [ ] Alerta configurado
- [ ] Condições definidas
- [ ] Destinatários configurados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-9.1-alertas.png`

---

### 9.2 Testar Alerta
**Pré-condição:** Alerta configurado  
**Passos:**
1. Simular condição de alerta
2. Verificar notificação recebida
3. Verificar formato da notificação
4. Verificar ação tomada

**Resultado Esperado:**
- [ ] Alerta disparado
- [ ] Notificação recebida
- [ ] Formato correto
- [ ] Ação executada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-9.2-teste-alerta.png`

---

## 10. Integração com Ferramentas Externas

### 10.1 Conectar BI Tool
**Pré-condição:** Analista logado  
**Passos:**
1. Acessar `/settings/integrations`
2. Selecionar "Power BI" ou "Tableau"
3. Configurar conexão:
   - URL da API
   - Chave de autenticação
   - Frequência de sincronização
4. Testar conexão

**Resultado Esperado:**
- [ ] Configuração de integração
- [ ] Conexão testada
- [ ] Sincronização configurada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-10.1-bi-tool.png`

---

### 10.2 Sincronização de Dados
**Pré-condição:** Integração configurada  
**Passos:**
1. Iniciar sincronização manual
2. Verificar progresso
3. Verificar dados na ferramenta externa
4. Verificar logs de sincronização

**Resultado Esperado:**
- [ ] Sincronização iniciada
- [ ] Progresso visível
- [ ] Dados sincronizados
- [ ] Logs disponíveis
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/analyst-10.2-sincronizacao.png`

---

## Resumo dos Testes

**Total de Testes:** 22  
**Passou:** ___  
**Falhou:** ___  
**Taxa de Sucesso:** ___%  

**Observações:**
- 

**Problemas Encontrados:**
- 

**Recomendações:**
- 

---

**Testador:** ___________  
**Data:** ___________  
**Assinatura:** ___________
