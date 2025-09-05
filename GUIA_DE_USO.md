# 🚀 GUIA DE USO - SISTEMA DE CHATBOT IMPLEMENTADO

## 📋 **COMO INICIAR O SISTEMA**

### **Opção 1: Script Automático (Recomendado)**
```bash
# Clique duplo no arquivo:
iniciar-servidor.bat
```

### **Opção 2: Manual**
```bash
cd apps/api
node simple-channels-server.js
```

---

## 🧪 **COMO TESTAR AS FUNCIONALIDADES**

### **Opção 1: Script Automático (Recomendado)**
```bash
# Clique duplo no arquivo:
testar-funcionalidades.bat
```

### **Opção 2: Manual**
```bash
node testar-funcionalidades.js
```

---

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **1. Sistema de Fluxos com ChatGPT** ✅
- **O que faz:** Quadrados de ChatGPT integrados no fluxo
- **Como testar:** Endpoint `/chatgpt/profiles` e `/chatgpt/send-message`
- **Resultado:** Conversa direta com ChatGPT quando cliente chega nessa parte

### **2. Subperfis de ChatGPT** ✅
- **Perfis criados:**
  - 🤖 **"Suporte Técnico IPTV"** - Especialista em problemas técnicos
  - 📱 **"Instalação de Apps"** - Especialista em instalação de aplicativos
  - 💰 **"Vendas e Planos"** - Especialista em vendas de planos
  - ⚙️ **"Configuração de Dispositivos"** - Especialista em setup de equipamentos

### **3. Sistema IPTV Atualizado** ✅
- **O que mudou:** Agora apenas consulta (não gera) usuários de teste
- **Como testar:** Endpoint `/iptv/request-test-credentials`
- **Fluxo:** Consulta se número já fez teste → Se não, solicita ao sistema IPTV

### **4. Fluxo Condicional por TV** ✅
- **O que faz:** Identifica automaticamente a marca da TV do cliente
- **Como testar:** Endpoints `/tv-brands` e `/tv-brands/find/{marca}`
- **Marcas suportadas:** LG, Samsung, Roku, Xiaomi

### **5. Validação de Resposta** ✅
- **O que faz:** Valida se a resposta do cliente é válida
- **Respostas válidas:** LG, Samsung, Roku, Xiaomi, etc.
- **Respostas inválidas:** "Não sei", "Qualquer uma" → "Diga apenas o nome da marca"

---

## 🔗 **ENDPOINTS PARA TESTAR**

### **ChatGPT:**
- `GET /chatgpt/profiles` - Lista perfis ativos
- `POST /chatgpt/send-message` - Envia mensagem para ChatGPT

### **TV Brands:**
- `GET /tv-brands` - Lista marcas ativas
- `GET /tv-brands/find/lg` - Busca marca LG
- `GET /tv-brands/find/samsung` - Busca marca Samsung
- `GET /tv-brands/find/roku` - Busca marca Roku

### **IPTV:**
- `POST /iptv/request-test-credentials` - Solicita credenciais (consulta)

### **WhatsApp:**
- `POST /webhooks/whatsapp` - Processa mensagens WhatsApp

---

## 📱 **EXEMPLOS DE TESTE**

### **1. Testar ChatGPT:**
```bash
curl -X POST http://localhost:3001/chatgpt/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "profile-1",
    "message": "Como instalar o IPTV na minha TV?",
    "conversationHistory": []
  }'
```

### **2. Testar Identificação de TV:**
```bash
curl http://localhost:3001/tv-brands/find/lg
curl http://localhost:3001/tv-brands/find/samsung
```

### **3. Testar IPTV:**
```bash
curl -X POST http://localhost:3001/iptv/request-test-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "name": "Cliente Teste"
  }'
```

### **4. Testar WhatsApp:**
```bash
curl -X POST http://localhost:3001/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "5511999999999",
            "text": { "body": "Tenho uma TV LG" },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

---

## 🎉 **RESULTADOS ESPERADOS**

### **✅ Sucesso:**
- Servidor inicia na porta 3001
- Todos os endpoints respondem com status 200
- ChatGPT retorna respostas especializadas
- TV Brands identifica marcas corretamente
- IPTV consulta sistema externo
- WhatsApp processa mensagens

### **❌ Problemas Comuns:**
- **Porta 3001 ocupada:** Mude a porta no arquivo `simple-channels-server.js`
- **Erro de sintaxe:** Verifique se o arquivo foi salvo corretamente
- **Conexão recusada:** Verifique se o servidor está rodando

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Inicie o servidor:** `iniciar-servidor.bat`
2. **Teste as funcionalidades:** `testar-funcionalidades.bat`
3. **Explore os endpoints:** Use os exemplos acima
4. **Integre com seu sistema:** Use os endpoints em sua aplicação

---

## 📞 **SUPORTE**

- **Logs do servidor:** Console do `simple-channels-server.js`
- **Documentação:** `RELATORIO_IMPLEMENTACAO_COMPLETA.md`
- **Testes:** `testar-funcionalidades.js`

**🎯 Sistema 100% funcional e pronto para uso!** 🚀
