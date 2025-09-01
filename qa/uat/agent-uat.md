# UAT - Agente

**Papel:** Agente de Atendimento  
**Data:** ___________  
**Testador:** ___________  
**Versão:** 1.0.0-rc.1  

## Pré-condições
- [ ] Acesso ao sistema como usuário com role "agent"
- [ ] Navegador atualizado (Chrome/Firefox/Safari)
- [ ] Conexão estável com a internet
- [ ] Permissões de notificação habilitadas
- [ ] Equipe configurada e usuário atribuído

---

## 1. Login e Acesso

### 1.1 Login de Agente
**Pré-condição:** Usuário convidado pelo admin  
**Passos:**
1. Acessar `/login`
2. Inserir credenciais:
   - Email: "agente.uat@teste.com"
   - Senha: "Teste@123"
3. Clicar em "Entrar"

**Resultado Esperado:**
- [ ] Login bem-sucedido
- [ ] Redirecionamento para `/dashboard`
- [ ] Interface de agente carregada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-1.1-login.png`

---

### 1.2 Verificar Permissões
**Pré-condição:** Usuário logado  
**Passos:**
1. Verificar menu lateral
2. Verificar páginas acessíveis
3. Verificar funcionalidades disponíveis

**Resultado Esperado:**
- [ ] Menu limitado ao papel de agente
- [ ] Acesso a tickets, chat, relatórios básicos
- [ ] Sem acesso a configurações administrativas
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-1.2-permissoes.png`

---

## 2. Visualização de Tickets

### 2.1 Lista de Tickets
**Pré-condição:** Agente logado  
**Passos:**
1. Acessar `/tickets`
2. Verificar filtros disponíveis
3. Testar ordenação por:
   - Prioridade
   - Data de criação
   - Status
   - Atribuído a mim
4. Verificar paginação

**Resultado Esperado:**
- [ ] Lista carregada com tickets
- [ ] Filtros funcionando
- [ ] Ordenação aplicada
- [ ] Paginação funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-2.1-lista-tickets.png`

---

### 2.2 Filtros Avançados
**Pré-condição:** Lista de tickets carregada  
**Passos:**
1. Clicar em "Filtros Avançados"
2. Aplicar filtros:
   - Status: "Aberto"
   - Prioridade: "Alta"
   - Canal: "WhatsApp"
   - Data: "Últimos 7 dias"
3. Verificar resultados

**Resultado Esperado:**
- [ ] Filtros aplicados corretamente
- [ ] Resultados filtrados
- [ ] Contador atualizado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-2.2-filtros.png`

---

### 2.3 Busca de Tickets
**Pré-condição:** Lista de tickets carregada  
**Passos:**
1. Usar barra de busca
2. Buscar por:
   - Número do ticket
   - Nome do cliente
   - Assunto
   - Conteúdo da mensagem
3. Verificar resultados

**Resultado Esperado:**
- [ ] Busca funcionando
- [ ] Resultados relevantes
- [ ] Busca em tempo real
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-2.3-busca.png`

---

## 3. Atendimento no Chat

### 3.1 Abrir Ticket
**Pré-condição:** Lista de tickets carregada  
**Passos:**
1. Clicar em um ticket da lista
2. Verificar informações do cliente
3. Verificar histórico de mensagens
4. Verificar metadados do ticket

**Resultado Esperado:**
- [ ] Ticket aberto corretamente
- [ ] Informações do cliente visíveis
- [ ] Histórico carregado
- [ ] Metadados exibidos
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-3.1-abrir-ticket.png`

---

### 3.2 Enviar Mensagem
**Pré-condição:** Ticket aberto  
**Passos:**
1. Digitar mensagem: "Olá! Como posso ajudá-lo hoje?"
2. Clicar em "Enviar"
3. Verificar envio
4. Verificar status da mensagem

**Resultado Esperado:**
- [ ] Mensagem enviada
- [ ] Status "Enviado"
- [ ] Mensagem aparece no chat
- [ ] Timestamp correto
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-3.2-enviar-msg.png`

---

### 3.3 Upload de Arquivos
**Pré-condição:** Ticket aberto  
**Passos:**
1. Clicar no ícone de anexo
2. Selecionar arquivo (PDF, imagem)
3. Verificar upload
4. Verificar exibição no chat

**Resultado Esperado:**
- [ ] Arquivo selecionado
- [ ] Upload iniciado
- [ ] Progresso visível
- [ ] Arquivo exibido no chat
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-3.3-upload.png`

---

### 3.4 Indicador de Digitação
**Pré-condição:** Ticket aberto  
**Passos:**
1. Começar a digitar mensagem
2. Verificar indicador "Agente está digitando..."
3. Parar de digitar
4. Verificar desaparecimento do indicador

**Resultado Esperado:**
- [ ] Indicador aparece ao digitar
- [ ] Indicador desaparece ao parar
- [ ] Animação suave
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-3.4-typing.png`

---

### 3.5 Status do Ticket
**Pré-condição:** Ticket aberto  
**Passos:**
1. Verificar status atual
2. Alterar status para "Em andamento"
3. Verificar atualização
4. Alterar para "Resolvido"

**Resultado Esperado:**
- [ ] Status atual visível
- [ ] Alteração aplicada
- [ ] Histórico de mudanças
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-3.5-status.png`

---

## 4. Gestão de SLA

### 4.1 Visualizar SLA
**Pré-condição:** Ticket aberto  
**Passos:**
1. Verificar indicador de SLA
2. Verificar tempo restante
3. Verificar cor do indicador
4. Verificar alertas

**Resultado Esperado:**
- [ ] SLA visível
- [ ] Tempo restante correto
- [ ] Cores conforme regras
- [ ] Alertas funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-4.1-sla.png`

---

### 4.2 SLA Crítico
**Pré-condição:** Ticket com SLA próximo do limite  
**Passos:**
1. Identificar ticket com SLA crítico
2. Verificar alertas visuais
3. Verificar notificações
4. Ação para resolver

**Resultado Esperado:**
- [ ] Alertas visuais claros
- [ ] Notificações recebidas
- [ ] Destaque no ticket
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-4.2-sla-critico.png`

---

## 5. Atribuição e Transferência

### 5.1 Atribuir Ticket
**Pré-condição:** Ticket aberto  
**Passos:**
1. Clicar em "Atribuir"
2. Selecionar colega da equipe
3. Adicionar comentário
4. Confirmar atribuição

**Resultado Esperado:**
- [ ] Lista de colegas carregada
- [ ] Atribuição realizada
- [ ] Comentário salvo
- [ ] Notificação enviada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-5.1-atribuir.png`

---

### 5.2 Transferir Ticket
**Pré-condição:** Ticket atribuído ao agente  
**Passos:**
1. Clicar em "Transferir"
2. Selecionar equipe de destino
3. Adicionar motivo
4. Confirmar transferência

**Resultado Esperado:**
- [ ] Equipes disponíveis listadas
- [ ] Transferência realizada
- [ ] Motivo registrado
- [ ] Notificação enviada
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-5.2-transferir.png`

---

## 6. Notificações e PWA

### 6.1 Notificações Push
**Pré-condição:** PWA instalada  
**Passos:**
1. Receber notificação de novo ticket
2. Clicar na notificação
3. Verificar abertura do ticket
4. Verificar som da notificação

**Resultado Esperado:**
- [ ] Notificação recebida
- [ ] Clique abre o ticket
- [ ] Som reproduzido
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-6.1-notificacao.png`

---

### 6.2 Modo Offline
**Pré-condição:** PWA instalada  
**Passos:**
1. Desconectar internet
2. Tentar acessar tickets
3. Verificar cache offline
4. Reconectar e sincronizar

**Resultado Esperado:**
- [ ] Modo offline ativado
- [ ] Tickets cacheados visíveis
- [ ] Sincronização ao reconectar
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-6.2-offline.png`

---

## 7. Relatórios Básicos

### 7.1 Dashboard Pessoal
**Pré-condição:** Agente logado  
**Passos:**
1. Acessar `/dashboard`
2. Verificar métricas pessoais:
   - Tickets atendidos hoje
   - Tempo médio de resposta
   - SLA cumprido
   - Satisfação do cliente
3. Verificar gráficos

**Resultado Esperado:**
- [ ] Métricas carregadas
- [ ] Gráficos funcionando
- [ ] Dados atualizados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-7.1-dashboard.png`

---

### 7.2 Relatório de Performance
**Pré-condição:** Dashboard carregado  
**Passos:**
1. Clicar em "Ver Relatório Completo"
2. Selecionar período
3. Verificar dados detalhados
4. Exportar relatório

**Resultado Esperado:**
- [ ] Relatório carregado
- [ ] Período selecionável
- [ ] Dados detalhados
- [ ] Exportação funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-7.2-relatorio.png`

---

## 8. Preferências Pessoais

### 8.1 Configurar Notificações
**Pré-condição:** Agente logado  
**Passos:**
1. Acessar `/settings/notifications`
2. Configurar:
   - Som das notificações
   - Horário de silêncio
   - Tipos de notificação
3. Salvar configurações

**Resultado Esperado:**
- [ ] Configurações aplicadas
- [ ] Preferências salvas
- [ ] Teste de notificação funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-8.1-notificacoes.png`

---

### 8.2 Configurar Perfil
**Pré-condição:** Agente logado  
**Passos:**
1. Acessar `/settings/profile`
2. Atualizar:
   - Nome de exibição
   - Foto de perfil
   - Status de disponibilidade
3. Salvar alterações

**Resultado Esperado:**
- [ ] Dados atualizados
- [ ] Foto carregada
- [ ] Status aplicado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/agent-8.2-perfil.png`

---

## Resumo dos Testes

**Total de Testes:** 24  
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
