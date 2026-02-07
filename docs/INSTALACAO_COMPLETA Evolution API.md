# ✅ Instalação Completa da Evolution API - Sítio Multitrem

## 📊 Status da Instalação

✅ **CONCLUÍDO COM SUCESSO!**

A Evolution API foi instalada e configurada com sucesso usando Docker Compose.

---

## 🎯 O que foi instalado

### 1. **PostgreSQL** (Container Docker)
- **Container:** `evolution_postgres`
- **Porta:** 5432 (interna)
- **Database:** `evolution`
- **User:** `evolution`
- **Password:** `evolution123`

### 2. **Redis** (Container Docker)
- **Container:** `evolution_redis`
- **Porta:** 6379 (interna)
- **Uso:** Cache e armazenamento de sessões

### 3. **Evolution API** (Container Docker)
- **Container:** `evolution_api`
- **Porta:** `http://localhost:8080`
- **Versão:** 2.3.7
- **API Key:** `W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=`

### 4. **Evolution Frontend** (Container Docker)
- **Container:** `evolution_frontend`
- **Porta:** `http://localhost:3001`
- **Uso:** Interface web para gerenciar instâncias

---

## 🚀 Como Usar

### **Passo 1: Verificar se os serviços estão rodando**

```powershell
cd "C:\Users\ilumi\Desktop\En\Adriano\E-commerce 02\services\evolution-api"
docker-compose ps
```

Todos os containers devem estar com status `Up`.

### **Passo 2: Testar a API**

```powershell
node test-api.js
```

Deve retornar:
```
✅ API está respondendo!
✅ Instâncias encontradas: 1
```

### **Passo 3: Conectar ao WhatsApp Web**

#### Opção A: Via Script (Recomendado)

```powershell
node connect-whatsapp.js
```

O script irá:
1. Iniciar a conexão
2. Gerar o QR Code
3. Exibir instruções para escanear

#### Opção B: Via Navegador

1. Abra: `http://localhost:8080/instance/connect/sitio-multitrem`
2. Escaneie o QR Code com seu WhatsApp

### **Passo 4: Escanear o QR Code**

1. Abra o **WhatsApp** no seu celular
2. Vá em **Configurações** > **Aparelhos conectados**
3. Toque em **"Conectar um aparelho"**
4. Escaneie o QR Code exibido

### **Passo 5: Testar Envio de Mensagem**

1. **Edite o arquivo** `test-send-message.js`:
   ```javascript
   const TEST_NUMBER = '5511999999999'; // ⚠️ ALTERE PARA SEU NÚMERO!
   ```

2. **Execute o teste:**
   ```powershell
   node test-send-message.js
   ```

3. **Verifique** se recebeu a mensagem no WhatsApp!

---

## 📋 Comandos Úteis

### **Gerenciar Containers**

```powershell
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs da API
docker logs evolution_api --tail 50 -f

# Reiniciar a API
docker-compose restart api

# Ver status dos containers
docker-compose ps
```

### **Gerenciar Instâncias**

```powershell
# Criar nova instância
node create-instance.js

# Conectar ao WhatsApp
node connect-whatsapp.js

# Testar envio de mensagem
node test-send-message.js

# Listar instâncias
node test-api.js
```

---

## 🔗 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API** | `http://localhost:8080` | API principal |
| **Swagger Docs** | `http://localhost:8080/docs` | Documentação interativa |
| **Frontend** | `http://localhost:3001` | Interface web |
| **QR Code** | `http://localhost:8080/instance/connect/sitio-multitrem` | QR Code para conectar |

---

## 🔑 Credenciais

### **API Key**
```
W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=
```

### **PostgreSQL**
- **Host:** `localhost` (externo) / `evolution-postgres` (interno)
- **Port:** `5432`
- **Database:** `evolution`
- **User:** `evolution`
- **Password:** `evolution123`

### **Redis**
- **Host:** `localhost` (externo) / `evolution-redis` (interno)
- **Port:** `6379`

---

## 🔧 Integração com o Projeto

### **1. Configurar o whatsapp-service**

Edite o arquivo `.env` do `whatsapp-service`:

```env
# Evolution API Configuration
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=
EVOLUTION_INSTANCE_NAME=sitio-multitrem
```

### **2. Endpoints para Integração**

#### **Enviar Mensagem de Texto**
```javascript
POST http://localhost:8080/message/sendText/sitio-multitrem
Headers: {
  "apikey": "W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=",
  "Content-Type": "application/json"
}
Body: {
  "number": "5511999999999",
  "text": "Sua mensagem aqui"
}
```

#### **Verificar Status da Conexão**
```javascript
GET http://localhost:8080/instance/connectionState/sitio-multitrem
Headers: {
  "apikey": "W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA="
}
```

#### **Configurar Webhook**
```javascript
POST http://localhost:8080/webhook/set/sitio-multitrem
Headers: {
  "apikey": "W7F32PCvoLZdi5nng3pfkEOaD3RN9o/YDrIuCmH24OA=",
  "Content-Type": "application/json"
}
Body: {
  "url": "http://localhost:3006/webhooks/whatsapp",
  "webhook_by_events": false,
  "events": [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "CONNECTION_UPDATE"
  ]
}
```

---

## 🐛 Troubleshooting

### **Problema: API não está respondendo**

```powershell
# Verificar logs
docker logs evolution_api --tail 50

# Reiniciar container
docker-compose restart api
```

### **Problema: Erro de conexão com Redis**

```powershell
# Verificar se o Redis está rodando
docker ps | Select-String "redis"

# Reiniciar Redis
docker-compose restart redis
```

### **Problema: QR Code não aparece**

1. Aguarde 10-15 segundos após criar a instância
2. Acesse diretamente: `http://localhost:8080/instance/connect/sitio-multitrem`
3. Verifique os logs: `docker logs evolution_api --tail 50`

### **Problema: Mensagem não é enviada**

1. Verifique se o WhatsApp está conectado:
   ```powershell
   node connect-whatsapp.js
   ```

2. Verifique se o número está no formato correto: `5511999999999`

3. Teste com o Swagger: `http://localhost:8080/docs`

---

## 📚 Documentação Adicional

- **Evolution API Docs:** https://doc.evolution-api.com/
- **GitHub:** https://github.com/EvolutionAPI/evolution-api
- **Swagger UI:** http://localhost:8080/docs

---

## ✅ Checklist de Instalação

- [x] Docker e Docker Compose instalados
- [x] PostgreSQL container rodando
- [x] Redis container rodando
- [x] Evolution API container rodando
- [x] API Key gerada
- [x] Instância `sitio-multitrem` criada
- [ ] QR Code escaneado
- [ ] WhatsApp conectado
- [ ] Mensagem de teste enviada
- [ ] Webhook configurado
- [ ] Integração com whatsapp-service

---

## 🎉 Próximos Passos

1. **Escanear o QR Code** para conectar o WhatsApp
2. **Testar o envio de mensagens** com `test-send-message.js`
3. **Configurar webhooks** para receber mensagens
4. **Integrar com o whatsapp-service** do projeto
5. **Testar o fluxo completo** de envio e recebimento

---

**🚀 Instalação concluída com sucesso!**

Para qualquer dúvida, consulte a documentação oficial ou os scripts de teste incluídos.

