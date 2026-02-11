# 🔧 Como Configurar Webhook da Evolution API

Este projeto usa o **backend NestJS** como receptor do webhook (não um serviço separado). O endpoint é:

- **URL do webhook:** `POST /api/whatsapp/webhook`
- **Evento esperado:** `messages.upsert` (mensagens recebidas)

---

## 1. Conferir o `.env` do backend

No `backend/.env` (ou raiz, conforme seu setup), tenha:

```env
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_API_KEY=change-me
EVOLUTION_INSTANCE_NAME=loja
```

Use a mesma `EVOLUTION_API_KEY` que está no `docker-compose` (variável `EVOLUTION_API_KEY` ou `AUTHENTICATION_API_KEY` no container).

---

## 2. Escolher a URL do webhook

- **Backend rodando no seu PC (fora do Docker):**  
  A Evolution roda dentro do Docker e precisa alcançar o host. Use:
  - **Windows/Mac:** `http://host.docker.internal:3001/api/whatsapp/webhook`
- **Backend rodando dentro do Docker (no mesmo docker-compose):**  
  Use o nome do serviço, ex.: `http://backend:3001/api/whatsapp/webhook`.

Neste guia assumimos backend **no host** e Evolution no Docker, então a URL é:

`http://host.docker.internal:3001/api/whatsapp/webhook`

---

## 3. Configurar o webhook na Evolution API

### Opção A: Evolution Manager (recomendado)

1. Abra no navegador: **http://localhost:8081/manager**
2. Faça login:
   - **Server URL:** `http://localhost:8081`
   - **API Key:** a mesma do seu `.env` (`EVOLUTION_API_KEY`)
3. Clique na instância (ex.: **loja**).
4. Vá na aba **Webhooks** (ou **Configurações**).
5. Preencha:
   - **URL:** `http://host.docker.internal:3001/api/whatsapp/webhook`
   - **Enabled:** ✅ habilitado
   - **Events:** marque pelo menos:
     - ✅ **MESSAGES_UPSERT** (novas mensagens — obrigatório para o bot responder)
     - Opcional: **MESSAGES_UPDATE**, **CONNECTION_UPDATE**
6. Salve.

### Opção B: Via API (PowerShell)

Substitua `loja` pelo nome da sua instância (sem espaços) e `SUA_API_KEY` pela `EVOLUTION_API_KEY`:

```powershell
$headers = @{
    'apikey' = 'SUA_API_KEY'
    'Content-Type' = 'application/json'
}

$body = @{
    webhook = @{
        enabled = $true
        url = 'http://host.docker.internal:3001/api/whatsapp/webhook'
        webhook_by_events = $false
        events = @('MESSAGES_UPSERT')
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri 'http://localhost:8081/webhook/set/loja' -Method POST -Headers $headers -Body $body
```

---

## 4. Testar

1. Subir o backend: `cd backend && npm run start:dev`
2. Verificar status: `GET http://localhost:3001/api/whatsapp/status` → deve retornar `{ "configured": true }`
3. Enviar uma mensagem de WhatsApp para o número conectado na instância.
4. O webhook será chamado, o backend processa com o AGNO e envia a resposta pelo WhatsApp.

Se não responder, confira os logs do backend no terminal onde rodou `npm run start:dev`.

---

## 5. Verificar configuração atual do webhook

```powershell
$headers = @{ 'apikey' = 'SUA_API_KEY' }
$response = Invoke-WebRequest -Uri 'http://localhost:8081/webhook/find/loja' -Method GET -Headers $headers
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

Confirme que `enabled` é `true` e que `MESSAGES_UPSERT` está em `events`.

---

## Resumo

| Item        | Valor                                                                 |
|------------|-----------------------------------------------------------------------|
| URL        | `http://host.docker.internal:3001/api/whatsapp/webhook` (backend no host) |
| Evento     | `MESSAGES_UPSERT`                                                     |
| Backend    | Rodando em `http://localhost:3001`                                    |
| Endpoint   | `POST /api/whatsapp/webhook` (não chamar manualmente; só Evolution)   |
| Status     | `GET /api/whatsapp/status` → `{ "configured": true }`                 |

**Referência:** `GUIA_RAPIDO.md` (seção 6.3 – Construindo a Fase 6).
