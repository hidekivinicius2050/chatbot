# UAT - Marketing

**Papel:** Equipe de Marketing  
**Data:** ___________  
**Testador:** ___________  
**Versão:** 1.0.0-rc.1  

## Pré-condições
- [ ] Acesso ao sistema como usuário com role "marketing"
- [ ] Navegador atualizado (Chrome/Firefox/Safari)
- [ ] Conexão estável com a internet
- [ ] Permissões de notificação habilitadas
- [ ] Lista de contatos disponível para campanhas

---

## 1. Login e Acesso

### 1.1 Login de Marketing
**Pré-condição:** Usuário convidado pelo admin  
**Passos:**
1. Acessar `/login`
2. Inserir credenciais:
   - Email: "marketing.uat@teste.com"
   - Senha: "Teste@123"
3. Clicar em "Entrar"

**Resultado Esperado:**
- [ ] Login bem-sucedido
- [ ] Redirecionamento para `/dashboard`
- [ ] Interface de marketing carregada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-1.1-login.png`

---

### 1.2 Verificar Permissões
**Pré-condição:** Usuário logado  
**Passos:**
1. Verificar menu lateral
2. Verificar páginas acessíveis
3. Verificar funcionalidades disponíveis

**Resultado Esperado:**
- [ ] Menu com foco em campanhas e marketing
- [ ] Acesso a campanhas, listas, relatórios
- [ ] Acesso limitado a configurações
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-1.2-permissoes.png`

---

## 2. Gestão de Listas de Contatos

### 2.1 Criar Lista de Contatos
**Pré-condição:** Usuário de marketing logado  
**Passos:**
1. Acessar `/marketing/lists`
2. Clicar em "Nova Lista"
3. Preencher dados:
   - Nome: "Lista UAT Marketing"
   - Descrição: "Lista para testes UAT"
   - Categoria: "Prospecção"
4. Clicar em "Criar"

**Resultado Esperado:**
- [ ] Lista criada com sucesso
- [ ] Aparece na lista de listas
- [ ] Status "Ativa"
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-2.1-criar-lista.png`

---

### 2.2 Importar Contatos
**Pré-condição:** Lista criada  
**Passos:**
1. Clicar na lista criada
2. Clicar em "Importar Contatos"
3. Selecionar arquivo CSV de exemplo
4. Mapear colunas:
   - Nome
   - Email
   - Telefone
   - Empresa
5. Confirmar importação

**Resultado Esperado:**
- [ ] Arquivo selecionado
- [ ] Mapeamento de colunas
- [ ] Contatos importados
- [ ] Confirmação visual
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-2.2-importar.png`

---

### 2.3 Editar Contatos
**Pré-condição:** Contatos importados  
**Passos:**
1. Selecionar contato da lista
2. Clicar em "Editar"
3. Atualizar informações:
   - Nome: "João Silva Atualizado"
   - Email: "joao.silva@empresa.com"
   - Telefone: "+55 11 99999-9999"
4. Salvar alterações

**Resultado Esperado:**
- [ ] Contato selecionado
- [ ] Formulário de edição
- [ ] Alterações salvas
- [ ] Lista atualizada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-2.3-editar.png`

---

### 2.4 Segmentar Lista
**Pré-condição:** Lista com contatos  
**Passos:**
1. Clicar em "Segmentar"
2. Criar segmento:
   - Critério: "Empresa = 'Empresa Teste'"
   - Nome: "Segmento UAT"
3. Aplicar segmento
4. Verificar contatos filtrados

**Resultado Esperado:**
- [ ] Segmento criado
- [ ] Critérios aplicados
- [ ] Contatos filtrados
- [ ] Contador atualizado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-2.4-segmentar.png`

---

## 3. Criação de Campanhas

### 3.1 Criar Campanha
**Pré-condição:** Lista de contatos disponível  
**Passos:**
1. Acessar `/marketing/campaigns`
2. Clicar em "Nova Campanha"
3. Preencher dados básicos:
   - Nome: "Campanha UAT Marketing"
   - Descrição: "Campanha para testes UAT"
   - Lista: "Lista UAT Marketing"
   - Canal: "WhatsApp"
4. Clicar em "Próximo"

**Resultado Esperado:**
- [ ] Campanha criada
- [ ] Dados salvos
- [ ] Avanço para próximo passo
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-3.1-criar-campanha.png`

---

### 3.2 Configurar Mensagem
**Pré-condição:** Campanha criada  
**Passos:**
1. No passo de mensagem, configurar:
   - Assunto: "Oferta Especial UAT"
   - Mensagem: "Olá! Temos uma oferta especial para você. Clique para saber mais!"
   - Template: "Promoção"
2. Adicionar variáveis personalizadas:
   - {{nome}}
   - {{empresa}}
3. Clicar em "Próximo"

**Resultado Esperado:**
- [ ] Mensagem configurada
- [ ] Variáveis adicionadas
- [ ] Template aplicado
- [ ] Avanço para próximo passo
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-3.2-mensagem.png`

---

### 3.3 Configurar Agendamento
**Pré-condição:** Mensagem configurada  
**Passos:**
1. No passo de agendamento, configurar:
   - Data: "Amanhã"
   - Horário: "10:00"
   - Fuso horário: "America/Sao_Paulo"
   - Frequência: "Uma vez"
2. Clicar em "Próximo"

**Resultado Esperado:**
- [ ] Agendamento configurado
- [ ] Data e horário definidos
- [ ] Fuso horário aplicado
- [ ] Avanço para próximo passo
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-3.3-agendamento.png`

---

### 3.4 Revisar e Enviar
**Pré-condição:** Agendamento configurado  
**Passos:**
1. Revisar campanha completa
2. Verificar:
   - Dados da campanha
   - Mensagem
   - Lista de destinatários
   - Agendamento
3. Clicar em "Enviar Campanha"

**Resultado Esperado:**
- [ ] Revisão completa
- [ ] Dados corretos
- [ ] Campanha enviada
- [ ] Confirmação visual
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-3.4-revisar.png`

---

## 4. Gestão de Campanhas

### 4.1 Listar Campanhas
**Pré-condição:** Campanha criada  
**Passos:**
1. Acessar `/marketing/campaigns`
2. Verificar campanha na lista
3. Verificar status "Agendada"
4. Verificar informações básicas

**Resultado Esperado:**
- [ ] Campanha listada
- [ ] Status correto
- [ ] Informações visíveis
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-4.1-listar.png`

---

### 4.2 Editar Campanha
**Pré-condição:** Campanha agendada  
**Passos:**
1. Clicar na campanha
2. Clicar em "Editar"
3. Alterar horário para "14:00"
4. Salvar alterações

**Resultado Esperado:**
- [ ] Campanha editada
- [ ] Horário alterado
- [ ] Alterações salvas
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-4.2-editar-campanha.png`

---

### 4.3 Pausar/Retomar Campanha
**Pré-condição:** Campanha agendada  
**Passos:**
1. Clicar em "Pausar"
2. Verificar status "Pausada"
3. Clicar em "Retomar"
4. Verificar status "Agendada"

**Resultado Esperado:**
- [ ] Campanha pausada
- [ ] Status atualizado
- [ ] Campanha retomada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-4.3-pausar.png`

---

### 4.4 Duplicar Campanha
**Pré-condição:** Campanha existente  
**Passos:**
1. Clicar em "Duplicar"
2. Preencher novo nome: "Campanha UAT Marketing - Cópia"
3. Alterar data para "Próxima semana"
4. Salvar cópia

**Resultado Esperado:**
- [ ] Campanha duplicada
- [ ] Nome alterado
- [ ] Data alterada
- [ ] Nova campanha criada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-4.4-duplicar.png`

---

## 5. Monitoramento em Tempo Real

### 5.1 Dashboard de Campanha
**Pré-condição:** Campanha ativa  
**Passos:**
1. Clicar na campanha ativa
2. Acessar aba "Dashboard"
3. Verificar métricas em tempo real:
   - Enviados
   - Entregues
   - Lidos
   - Respostas
4. Verificar gráficos

**Resultado Esperado:**
- [ ] Dashboard carregado
- [ ] Métricas atualizadas
- [ ] Gráficos funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-5.1-dashboard.png`

---

### 5.2 Relatório de Entrega
**Pré-condição:** Campanha com envios  
**Passos:**
1. Acessar aba "Relatório"
2. Verificar:
   - Taxa de entrega
   - Taxa de leitura
   - Taxa de resposta
   - Horários de melhor engajamento
3. Exportar relatório

**Resultado Esperado:**
- [ ] Relatório carregado
- [ ] Métricas calculadas
- [ ] Exportação funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-5.2-relatorio.png`

---

### 5.3 Respostas e Interações
**Pré-condição:** Campanha com respostas  
**Passos:**
1. Acessar aba "Respostas"
2. Verificar mensagens recebidas
3. Verificar status das respostas
4. Responder a interações

**Resultado Esperado:**
- [ ] Respostas visíveis
- [ ] Status atualizado
- [ ] Possibilidade de resposta
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-5.3-respostas.png`

---

## 6. Templates e Automações

### 6.1 Criar Template
**Pré-condição:** Usuário de marketing logado  
**Passos:**
1. Acessar `/marketing/templates`
2. Clicar em "Novo Template"
3. Configurar:
   - Nome: "Template UAT"
   - Categoria: "Promoção"
   - Conteúdo: "Olá {{nome}}! {{mensagem}}"
   - Variáveis: nome, mensagem
4. Salvar template

**Resultado Esperado:**
- [ ] Template criado
- [ ] Categoria definida
- [ ] Variáveis configuradas
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-6.1-template.png`

---

### 6.2 Usar Template
**Pré-condição:** Template criado  
**Passos:**
1. Criar nova campanha
2. Selecionar template "Template UAT"
3. Preencher variáveis:
   - nome: "João"
   - mensagem: "Temos uma oferta especial!"
4. Verificar preview

**Resultado Esperado:**
- [ ] Template selecionado
- [ ] Variáveis preenchidas
- [ ] Preview correto
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-6.2-usar-template.png`

---

### 6.3 Automação de Follow-up
**Pré-condição:** Template disponível  
**Passos:**
1. Acessar `/marketing/automations`
2. Criar automação:
   - Nome: "Follow-up UAT"
   - Trigger: "Não respondeu em 24h"
   - Ação: "Enviar mensagem de follow-up"
3. Configurar mensagem
4. Ativar automação

**Resultado Esperado:**
- [ ] Automação criada
- [ ] Trigger configurado
- [ ] Ação definida
- [ ] Automação ativada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-6.3-automacao.png`

---

## 7. Relatórios e Analytics

### 7.1 Relatório de Performance
**Pré-condição:** Campanhas executadas  
**Passos:**
1. Acessar `/marketing/reports/performance`
2. Selecionar período: "Últimos 30 dias"
3. Verificar métricas:
   - Taxa de entrega
   - Taxa de leitura
   - Taxa de resposta
   - ROI
4. Comparar com período anterior

**Resultado Esperado:**
- [ ] Relatório carregado
- [ ] Período selecionado
- [ ] Métricas calculadas
- [ ] Comparação disponível
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-7.1-performance.png`

---

### 7.2 Análise de Segmentação
**Pré-condição:** Relatório de performance carregado  
**Passos:**
1. Acessar aba "Segmentação"
2. Analisar performance por:
   - Demografia
   - Comportamento
   - Canal
   - Horário
3. Identificar melhores segmentos

**Resultado Esperado:**
- [ ] Análise de segmentação
- [ ] Performance por segmento
- [ ] Insights identificados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-7.2-segmentacao.png`

---

### 7.3 Relatório de ROI
**Pré-condição:** Campanhas com conversões  
**Passos:**
1. Acessar aba "ROI"
2. Verificar:
   - Custo por campanha
   - Receita gerada
   - ROI calculado
   - Break-even
3. Exportar relatório

**Resultado Esperado:**
- [ ] Relatório de ROI
- [ ] Métricas financeiras
- [ ] Cálculos corretos
- [ ] Exportação funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-7.3-roi.png`

---

## 8. Integrações e Webhooks

### 8.1 Configurar Webhook
**Pré-condição:** Usuário de marketing logado  
**Passos:**
1. Acessar `/marketing/settings/webhooks`
2. Criar webhook:
   - URL: "https://webhook.site/marketing-uat"
   - Eventos: campaign.sent, message.delivered, message.read
   - Secret: "marketing-webhook-secret"
3. Testar webhook

**Resultado Esperado:**
- [ ] Webhook configurado
- [ ] Eventos selecionados
- [ ] Teste bem-sucedido
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-8.1-webhook.png`

---

### 8.2 Testar Integração
**Pré-condição:** Webhook configurado  
**Passos:**
1. Enviar campanha de teste
2. Verificar webhook.site
3. Verificar payload recebido
4. Verificar logs do sistema

**Resultado Esperado:**
- [ ] Campanha enviada
- [ ] Webhook disparado
- [ ] Payload correto
- [ ] Logs registrados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-8.2-teste-webhook.png`

---

## 9. Configurações e Preferências

### 9.1 Configurar Limites
**Pré-condição:** Usuário de marketing logado  
**Passos:**
1. Acessar `/marketing/settings/limits`
2. Configurar:
   - Mensagens por dia: 1000
   - Taxa de envio: 10/min
   - Horário de envio: 8h-20h
3. Salvar configurações

**Resultado Esperado:**
- [ ] Limites configurados
- [ ] Taxa definida
- [ ] Horário configurado
- [ ] Configurações salvas
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-9.1-limites.png`

---

### 9.2 Configurar Assinatura
**Pré-condição:** Limites configurados  
**Passos:**
1. Acessar `/marketing/settings/signature`
2. Configurar:
   - Nome da empresa: "Empresa UAT"
   - Endereço: "Rua Teste, 123"
   - Unsubscribe: "Para cancelar, responda STOP"
3. Salvar assinatura

**Resultado Esperado:**
- [ ] Assinatura configurada
- [ ] Dados da empresa
- [ ] Unsubscribe configurado
- [ ] Configurações salvas
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-9.2-assinatura.png`

---

## 10. Testes A/B

### 10.1 Criar Teste A/B
**Pré-condição:** Template disponível  
**Passos:**
1. Acessar `/marketing/ab-testing`
2. Clicar em "Novo Teste A/B"
3. Configurar:
   - Nome: "Teste UAT A/B"
   - Variante A: "Template UAT"
   - Variante B: "Template UAT Modificado"
   - Tamanho da amostra: 100
4. Iniciar teste

**Resultado Esperado:**
- [ ] Teste A/B criado
- [ ] Variantes configuradas
- [ ] Amostra definida
- [ ] Teste iniciado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-10.1-ab-test.png`

---

### 10.2 Monitorar Resultados
**Pré-condição:** Teste A/B ativo  
**Passos:**
1. Acessar teste A/B
2. Verificar métricas:
   - Taxa de entrega
   - Taxa de leitura
   - Taxa de resposta
3. Identificar vencedor
4. Finalizar teste

**Resultado Esperado:**
- [ ] Métricas visíveis
- [ ] Vencedor identificado
- [ ] Teste finalizado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/marketing-10.2-resultados-ab.png`

---

## Resumo dos Testes

**Total de Testes:** 30  
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
