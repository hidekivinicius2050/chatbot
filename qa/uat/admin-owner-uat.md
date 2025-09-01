# UAT - Admin/Owner

**Papel:** Administrador/Proprietário da empresa  
**Data:** ___________  
**Testador:** ___________  
**Versão:** 1.0.0-rc.1  

## Pré-condições
- [ ] Acesso ao sistema como usuário com role "owner" ou "admin"
- [ ] Navegador atualizado (Chrome/Firefox/Safari)
- [ ] Conexão estável com a internet
- [ ] Permissões de notificação habilitadas

---

## 1. Registro e Autenticação

### 1.1 Registro de Nova Empresa
**Pré-condição:** Usuário não cadastrado  
**Passos:**
1. Acessar `/register`
2. Preencher dados da empresa:
   - Nome da empresa: "Empresa Teste UAT"
   - Nome completo: "Admin UAT"
   - Email: "admin.uat@teste.com"
   - Senha: "Teste@123"
3. Clicar em "Criar Conta"
4. Verificar email de confirmação
5. Clicar no link de confirmação

**Resultado Esperado:**
- [ ] Conta criada com sucesso
- [ ] Redirecionamento para `/onboarding`
- [ ] Email de confirmação recebido
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-1.1-registro.png`

---

### 1.2 Login SSO
**Pré-condição:** Usuário já cadastrado  
**Passos:**
1. Acessar `/login`
2. Inserir credenciais:
   - Email: "admin.uat@teste.com"
   - Senha: "Teste@123"
3. Clicar em "Entrar"

**Resultado Esperado:**
- [ ] Login bem-sucedido
- [ ] Redirecionamento para `/dashboard`
- [ ] Token JWT armazenado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-1.2-login.png`

---

## 2. Configuração da Empresa

### 2.1 Onboarding Wizard - Passo 1: Empresa & Preferências
**Pré-condição:** Usuário logado, primeira vez  
**Passos:**
1. Verificar redirecionamento para `/onboarding`
2. Preencher dados da empresa:
   - Nome: "Empresa Teste UAT"
   - Fuso horário: "America/Sao_Paulo"
   - Idioma: "Português (Brasil)"
   - Tema: "Escuro"
   - Cor da marca: "#8B5CF6"
3. Clicar em "Próximo"

**Resultado Esperado:**
- [ ] Dados salvos corretamente
- [ ] Avanço para próximo passo
- [ ] Company.flags.onboardedStep = 1
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-2.1-empresa.png`

---

### 2.2 Onboarding Wizard - Passo 2: Usuários & Equipes
**Pré-condição:** Passo 1 concluído  
**Passos:**
1. Criar equipe "Suporte Técnico"
2. Adicionar usuário:
   - Nome: "Agente UAT"
   - Email: "agente.uat@teste.com"
   - Role: "agent"
3. Clicar em "Próximo"

**Resultado Esperado:**
- [ ] Equipe criada
- [ ] Usuário convidado
- [ ] Email de convite enviado
- [ ] Avanço para próximo passo
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-2.2-usuarios.png`

---

### 2.3 Onboarding Wizard - Passo 3: Canais
**Pré-condição:** Passo 2 concluído  
**Passos:**
1. Selecionar "WhatsApp Cloud"
2. Seguir instruções de configuração
3. Ou selecionar "Pular por enquanto"
4. Clicar em "Próximo"

**Resultado Esperado:**
- [ ] Canal configurado ou opção de pular funcionando
- [ ] Avanço para próximo passo
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-2.3-canais.png`

---

### 2.4 Onboarding Wizard - Passo 4: IA & Notificações
**Pré-condição:** Passo 3 concluído  
**Passos:**
1. Configurar chave da API OpenAI
2. Selecionar modelo: "gpt-3.5-turbo"
3. Habilitar notificações push
4. Habilitar PWA
5. Clicar em "Finalizar"

**Resultado Esperado:**
- [ ] Configurações salvas
- [ ] Onboarding concluído
- [ ] Redirecionamento para `/dashboard`
- [ ] Company.flags.onboardedStep = 4
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-2.4-ia.png`

---

## 3. Gestão de Usuários e Equipes

### 3.1 Criar Nova Equipe
**Pré-condição:** Onboarding concluído  
**Passos:**
1. Acessar `/settings/teams`
2. Clicar em "Nova Equipe"
3. Preencher:
   - Nome: "Vendas"
   - Descrição: "Equipe de vendas e prospecção"
4. Clicar em "Criar"

**Resultado Esperado:**
- [ ] Equipe criada com sucesso
- [ ] Aparece na lista de equipes
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-3.1-nova-equipe.png`

---

### 3.2 Gerenciar Permissões
**Pré-condição:** Equipe criada  
**Passos:**
1. Clicar na equipe "Vendas"
2. Adicionar usuário existente
3. Definir permissões:
   - Ver tickets: ✅
   - Responder tickets: ✅
   - Criar campanhas: ✅
   - Ver relatórios: ✅
4. Salvar alterações

**Resultado Esperado:**
- [ ] Permissões aplicadas corretamente
- [ ] Usuário aparece na equipe
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-3.2-permissoes.png`

---

## 4. Configuração de Canais

### 4.1 WhatsApp Cloud
**Pré-condição:** Onboarding concluído  
**Passos:**
1. Acessar `/settings/channels`
2. Clicar em "Configurar WhatsApp Cloud"
3. Inserir:
   - Phone Number ID
   - Access Token
   - Webhook URL
4. Testar conexão
5. Salvar configuração

**Resultado Esperado:**
- [ ] Conexão testada com sucesso
- [ ] Configuração salva
- [ ] Webhook funcionando
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-4.1-whatsapp-cloud.png`

---

### 4.2 Baileys (QR Code)
**Pré-condição:** WhatsApp Cloud configurado  
**Passos:**
1. Clicar em "Adicionar Baileys"
2. Gerar QR Code
3. Escanear com WhatsApp
4. Verificar status "Conectado"

**Resultado Esperado:**
- [ ] QR Code gerado
- [ ] Conexão estabelecida
- [ ] Status "Conectado"
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-4.2-baileys.png`

---

## 5. Webhooks e Integrações

### 5.1 Configurar Webhook
**Pré-condição:** Canal configurado  
**Passos:**
1. Acessar `/settings/webhooks`
2. Clicar em "Novo Webhook"
3. Configurar:
   - URL: "https://webhook.site/uat-test"
   - Eventos: message.created, ticket.assigned
   - Secret: "webhook-secret-uat"
4. Salvar e testar

**Resultado Esperado:**
- [ ] Webhook criado
- [ ] Teste bem-sucedido
- [ ] Eventos sendo enviados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-5.1-webhook.png`

---

### 5.2 Testar Integração
**Pré-condição:** Webhook configurado  
**Passos:**
1. Criar ticket de teste
2. Enviar mensagem
3. Verificar webhook.site
4. Verificar logs do sistema

**Resultado Esperado:**
- [ ] Eventos recebidos no webhook
- [ ] Payload correto
- [ ] Logs registrados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-5.2-teste-webhook.png`

---

## 6. Marketplace de Apps

### 6.1 Explorar Apps Disponíveis
**Pré-condição:** Sistema configurado  
**Passos:**
1. Acessar `/marketplace`
2. Verificar apps disponíveis
3. Filtrar por categoria
4. Ver detalhes de um app

**Resultado Esperado:**
- [ ] Lista de apps carregada
- [ ] Filtros funcionando
- [ ] Detalhes exibidos
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-6.1-marketplace.png`

---

### 6.2 Instalar App
**Pré-condição:** App selecionado  
**Passos:**
1. Clicar em "Instalar"
2. Configurar permissões
3. Confirmar instalação
4. Verificar status "Instalado"

**Resultado Esperado:**
- [ ] App instalado com sucesso
- [ ] Permissões configuradas
- [ ] Status atualizado
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-6.2-instalar-app.png`

---

## 7. Planos e Quotas

### 7.1 Verificar Plano Atual
**Pré-condição:** Conta ativa  
**Passos:**
1. Acessar `/settings/billing`
2. Verificar plano atual
3. Verificar uso de recursos
4. Verificar limites

**Resultado Esperado:**
- [ ] Plano exibido corretamente
- [ ] Uso de recursos visível
- [ ] Limites claros
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-7.1-plano.png`

---

### 7.2 Upgrade de Plano
**Pré-condição:** Plano atual visível  
**Passos:**
1. Clicar em "Upgrade"
2. Selecionar novo plano
3. Preencher dados de pagamento
4. Confirmar upgrade

**Resultado Esperado:**
- [ ] Upgrade processado
- [ ] Plano atualizado
- [ ] Limites aumentados
- [ ] Status: ✅ PASS / ❌ FAIL

**Screenshot:** `screenshots/admin-7.2-upgrade.png`

---

## Resumo dos Testes

**Total de Testes:** 20  
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
