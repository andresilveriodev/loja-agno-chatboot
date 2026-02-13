# Deploy do backend na Render – Passo a passo

Documentação para subir o **backend (NestJS)**, o **AI Service (Agno)** e a **Evolution API** na plataforma [Render](https://render.com), com o frontend já publicado na Vercel (ex.: `https://ja-agno-chatboot-v7yq.vercel.app`).

**Como usar:** siga a [ordem de execução](#2-pré-requisitos-e-ordem-de-execução) (Passos 1 → 7). Anote cada URL gerada e preencha as variáveis indicadas antes de seguir para o próximo passo.

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Pré-requisitos e ordem de execução](#2-pré-requisitos-e-ordem-de-execução)
3. [Passo 1 – PostgreSQL (Evolution API)](#3-passo-1--postgresql-evolution-api)
4. [Passo 2 – Redis (Render Key Value)](#4-passo-2--redis-render-key-value)
5. [Passo 3 – Backend NestJS](#5-passo-3--backend-nestjs)
6. [Passo 4 – AI Service (Agno)](#6-passo-4--ai-service-agno)
7. [Passo 5 – Evolution API (Docker)](#7-passo-5--evolution-api-docker)
8. [Passo 6 – Webhook e instância WhatsApp](#8-passo-6--webhook-e-instância-whatsapp)
9. [Passo 7 – Variáveis no Vercel (frontend)](#9-passo-7--variáveis-no-vercel-frontend)
10. [Checklist final e troubleshooting](#10-checklist-final-e-troubleshooting)

---

## 1. Visão geral

| Componente        | Tipo na Render   | Função principal                          |
|-------------------|------------------|-------------------------------------------|
| **Backend NestJS** | Web Service      | API REST, WebSocket, integração Evolution |
| **AI Service**    | Web Service      | Chat com Agno (IA)                        |
| **Evolution API** | Web Service      | Conexão WhatsApp                          |
| **PostgreSQL**   | Managed DB       | Banco da Evolution API                     |
| **Redis**        | Render Key Value | Cache da Evolution API                    |

- **Frontend**: Next.js na Vercel (ex.: `https://ja-agno-chatboot-v7yq.vercel.app`).
- **Região**: use a **mesma região** para todos os serviços na Render (ex.: Oregon).

---

## 2. Pré-requisitos e ordem de execução

### Pré-requisitos

- [ ] Conta em [render.com](https://render.com)
- [ ] Repositório do projeto conectado (GitHub/GitLab)
- [ ] Chave da OpenAI para o AI Service
- [ ] Frontend já publicado na Vercel

### Ordem de execução (resumo)

Siga os passos **nesta ordem** para evitar variáveis em branco:

| Ordem | O que fazer | Resultado |
|-------|----------------------------|-----------|
| 1 | [Passo 1](#3-passo-1--postgresql-evolution-api) – Criar PostgreSQL | Internal Database URL |
| 2 | [Passo 2](#4-passo-2--redis-render-key-value) – Criar Redis | Internal Redis URL |
| 3 | [Passo 3](#5-passo-3--backend-nestjs) – Deploy Backend | URL do backend (ex.: `https://loja-backend.onrender.com`) |
| 4 | [Passo 4](#6-passo-4--ai-service-agno) – Deploy AI Service | URL do AI Service → atualizar `AI_SERVICE_URL` no Backend |
| 5 | [Passo 5](#7-passo-5--evolution-api-docker) – Deploy Evolution API | URL da Evolution → atualizar `EVOLUTION_API_URL` no Backend |
| 6 | [Passo 6](#8-passo-6--webhook-e-instância-whatsapp) – Webhook e instância WhatsApp | Instância conectada e webhook apontando para o backend |
| 7 | [Passo 7](#9-passo-7--variáveis-no-vercel-frontend) – Variáveis no Vercel | Frontend apontando para o backend na Render |

---

## 3. Passo 1 – PostgreSQL (Evolution API)

O backend usa SQLite; o PostgreSQL é **apenas** para a Evolution API.

1. No Dashboard da Render: **New +** → **PostgreSQL**.
2. Preencha:
   - **Name**: `loja-evolution-db` (ou outro nome).
   - **Region**: ex. Oregon (anote; use a mesma em todos os serviços).
   - **PostgreSQL Version**: 15 (ou a sugerida).
   - **Database**: deixe o padrão ou use `evolution`.
3. Clique em **Create Database**.
4. Após criar:
   - Abra o serviço → **Info** ou **Connect**.
   - Copie a **Internal Database URL** (formato `postgresql://user:senha@host/dbname`).
   - Guarde em local seguro; será usada no **Passo 5 (Evolution)**.

Use a **Internal** URL (não a External) para a Evolution, para tráfego na rede interna da Render.

---

## 4. Passo 2 – Redis (Render Key Value)

Usado como cache pela Evolution API (Redis-compatible).

1. **New +** → **Redis** (ou **Key Value**).
2. Preencha:
   - **Name**: `loja-evolution-redis`.
   - **Region**: **mesma** do PostgreSQL.
   - **Plan**: Free ou o que preferir.
3. **Create Redis**.
4. Após criar:
   - Copie a **Internal URL** (ex.: `redis://red-xxxx:6379`).
   - Guarde para o **Passo 5 (Evolution)**.

---

## 5. Passo 3 – Backend NestJS

### 5.1 Criar o Web Service

1. **New +** → **Web Service**.
2. Conecte o repositório (se ainda não estiver).
3. Configure:
   - **Name**: `loja-backend` (ou outro).
   - **Region**: mesma dos outros serviços.
   - **Branch**: `main` (ou a branch de produção).
   - **Root Directory**: `backend` (obrigatório).
   - **Runtime**: **Node**.
   - **Build Command**: `npm ci && npm run build`.
   - **Start Command**: `npm run start` (conforme `package.json`).

### 5.2 Variáveis de ambiente

Em **Environment** do serviço, adicione:

| Key | Value | Obrigatório |
|-----|--------|-------------|
| `NODE_ENV` | `production` | Sim |
| `CORS_ORIGIN` | `https://ja-agno-chatboot-v7yq.vercel.app` | Sim |
| `AI_SERVICE_URL` | *(deixar em branco por enquanto; preencher após Passo 4 – AI Service)* | Sim |
| `EVOLUTION_API_URL` | *(deixar em branco por enquanto; preencher após Passo 5 – Evolution)* | Se usar WhatsApp |
| `EVOLUTION_API_KEY` | Uma chave forte (ex.: gerada em [randomkeygen](https://randomkeygen.com)) | Se usar WhatsApp |
| `EVOLUTION_INSTANCE_NAME` | `loja` | Se usar WhatsApp |
| `EVOLUTION_INSTANCE_API_KEY` | Token da instância (pode ser igual a `EVOLUTION_API_KEY` se configurar assim na Evolution) | Opcional |
| `BACKEND_PUBLIC_URL` | `https://loja-backend.onrender.com` *(trocar pelo nome real do seu serviço)* | Sim (Evolution/webhook) |
| `PRODUCT_IMAGES_BASE_URL` | `https://ja-agno-chatboot-v7yq.vercel.app` | Sim (fotos no WhatsApp) |

- **Não** defina `PORT`; a Render injeta automaticamente.
- Após criar o AI Service (Passo 4), volte aqui e preencha `AI_SERVICE_URL` com a URL do AI Service (ex.: `https://loja-ai-service.onrender.com`).
- Após criar a Evolution (Passo 5), preencha `EVOLUTION_API_URL` (ex.: `https://loja-evolution.onrender.com`).

### 5.3 Deploy

1. **Create Web Service**.
2. Anote a URL pública (ex.: `https://loja-backend.onrender.com`).
3. Atualize `BACKEND_PUBLIC_URL` nas variáveis com essa URL e salve (redeploy se necessário).

---

## 6. Passo 4 – AI Service (Agno)

### 6.1 Criar o Web Service

1. **New +** → **Web Service**.
2. Mesmo repositório.
3. Configure:
   - **Name**: `loja-ai-service`.
   - **Region**: mesma dos outros.
   - **Branch**: `main`.
   - **Root Directory**: `services/ai-service`.
   - **Runtime**: **Python**.
   - **Build Command**: `pip install -r requirements.txt`.
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

### 6.2 Variáveis de ambiente

| Key | Value | Obrigatório |
|-----|--------|-------------|
| `OPENAI_API_KEY` | Sua chave da OpenAI | Sim |
| `BACKEND_URL` | URL do backend (ex.: `https://loja-backend.onrender.com`) | Sim (tools de produtos) |
| `STORAGE_DB` | `tmp/loja_data.db` | Opcional |
| `OPENAI_MODEL` | `gpt-4.1-mini` (ou outro) | Opcional |

Não defina `PORT`; a Render define.

### 6.3 Deploy

1. **Create Web Service**.
2. Anote a URL (ex.: `https://loja-ai-service.onrender.com`).
3. No **Backend** (Passo 3), adicione/atualize:
   - `AI_SERVICE_URL` = `https://loja-ai-service.onrender.com`
   - Salve e faça redeploy do backend se precisar.

---

## 7. Passo 5 – Evolution API (Docker)

A Evolution usa a porta interna 8080 por padrão; na Render o Web Service recebe `PORT` dinâmico (ex.: 10000). É preciso que o container use essa porta.

### 7.1 Dockerfile (recomendado)

O repositório já inclui a pasta `evolution-render/` com o Dockerfile. Se precisar recriar:

**Arquivo:** `evolution-render/Dockerfile`

```dockerfile
FROM evoapicloud/evolution-api:latest
# Render injeta PORT (ex: 10000); Evolution usa SERVER_PORT
ENV SERVER_PORT=10000
EXPOSE 10000
```

Se a imagem da Evolution não aceitar `SERVER_PORT` por variável, consulte a [documentação oficial](https://doc.evolution-api.com/v2/en/env) para o nome correto. Na Render, Web Services Docker geralmente usam a porta **10000**; defina `SERVER_PORT=10000` nas variáveis de ambiente do serviço (abaixo) como alternativa.

### 7.2 Criar o Web Service (Docker)

1. **New +** → **Web Service**.
2. Repositório: o mesmo do projeto.
3. Configure:
   - **Name**: `loja-evolution`.
   - **Region**: mesma dos outros.
   - **Root Directory**: pasta onde está o Dockerfile (ex.: `evolution-render`) ou deixar em branco se o Dockerfile estiver na raiz.
   - **Runtime**: **Docker**.
   - **Dockerfile Path**: `Dockerfile` (ou `evolution-render/Dockerfile` conforme a raiz do serviço).

**Alternativa – imagem pronta (sem Dockerfile no repo):**

- Em **Advanced** (ou na criação), escolha **Deploy an existing image**.
- **Docker Image URL**: `evoapicloud/evolution-api:latest`.
- Ajuste apenas as variáveis de ambiente abaixo; a porta pode precisar de `SERVER_PORT=10000` (confirmar na doc da Render para Docker).

### 7.3 Variáveis de ambiente da Evolution

| Key | Value |
|-----|--------|
| `AUTHENTICATION_API_KEY` | **Mesma** que você colocou em `EVOLUTION_API_KEY` no backend |
| `SERVER_URL` | URL pública deste serviço (ex.: `https://loja-evolution.onrender.com`) |
| `SERVER_PORT` | `10000` (padrão Web Service na Render; confirme na doc) |
| `DATABASE_ENABLED` | `true` |
| `DATABASE_PROVIDER` | `postgresql` |
| `DATABASE_CONNECTION_URI` | **Internal Database URL** do PostgreSQL (Passo 1) |
| `CACHE_REDIS_ENABLED` | `true` |
| `CACHE_REDIS_URI` | **Internal URL** do Redis (Passo 2) |
| `LOG_LEVEL` | `INFO` |

### 7.4 Deploy e URL

1. **Create Web Service**.
2. Anote a URL (ex.: `https://loja-evolution.onrender.com`).
3. No **Backend** (Passo 3), defina:
   - `EVOLUTION_API_URL` = `https://loja-evolution.onrender.com`
   - Salve e redeploy do backend.

**Persistência:** Em plano sem disco persistente, o diretório `/evolution/instances` pode ser perdido em redeploy. Se a Render oferecer **persistent disk**, monte em `/evolution/instances`; senão, após cada redeploy pode ser necessário reconectar a instância WhatsApp (QR code de novo).

---

## 8. Passo 6 – Webhook e instância WhatsApp

### 8.1 Criar a instância na Evolution

1. Acesse a URL da Evolution (ex.: `https://loja-evolution.onrender.com`).
2. Com a **API Key** (mesma do backend), crie uma instância (ex.: nome `loja`) via interface ou API.
3. Conecte o WhatsApp (QR code ou número) e anote o **token da instância** se for diferente da API Key global; nesse caso, use em `EVOLUTION_INSTANCE_API_KEY` no backend.

### 8.2 Configurar o webhook

Na Evolution (Manager ou API), configure o webhook da instância:

- **URL**: `https://loja-backend.onrender.com/api/whatsapp/webhook`  
  (substitua pelo seu `BACKEND_PUBLIC_URL` + `/api/whatsapp/webhook`).
- **Eventos**: inclua pelo menos `messages.upsert` (e outros que o backend consumir).

Assim, cada mensagem recebida será enviada ao backend; o backend chama o AI Service (Agno) e envia a resposta pela Evolution.

---

## 9. Passo 7 – Variáveis no Vercel (frontend)

1. Abra o projeto no [Vercel](https://vercel.com) → **Settings** → **Environment Variables**.
2. Defina (para Production e Preview, se quiser):
   - `NEXT_PUBLIC_API_URL` = `https://loja-backend.onrender.com` (sua URL do backend).
   - `NEXT_PUBLIC_WS_URL` = `https://loja-backend.onrender.com` (mesma URL).
3. Salve e faça um **Redeploy** do frontend para aplicar.

---

## 10. Checklist final e troubleshooting

### Checklist

- [ ] PostgreSQL e Redis na mesma região; URLs internas copiadas.
- [ ] Backend: `CORS_ORIGIN` com a URL exata do frontend (Vercel).
- [ ] Backend: `AI_SERVICE_URL`, `EVOLUTION_API_URL`, `BACKEND_PUBLIC_URL`, `PRODUCT_IMAGES_BASE_URL` preenchidos.
- [ ] AI Service: `OPENAI_API_KEY` e `BACKEND_URL` definidos.
- [ ] Evolution: `AUTHENTICATION_API_KEY` igual ao `EVOLUTION_API_KEY` do backend; Postgres e Redis corretos; `SERVER_URL` com a URL pública da Evolution.
- [ ] Vercel: `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_WS_URL` apontando para o backend na Render.
- [ ] Webhook da Evolution: URL = `{BACKEND_PUBLIC_URL}/api/whatsapp/webhook`.

### Problemas comuns

| Problema | O que verificar |
|----------|------------------|
| CORS no frontend | `CORS_ORIGIN` no backend com a URL do Vercel (sem barra no final). |
| Chat não responde | `AI_SERVICE_URL` no backend; `OPENAI_API_KEY` e `BACKEND_URL` no AI Service. |
| WhatsApp não recebe/responde | `EVOLUTION_API_URL` e `EVOLUTION_API_KEY` no backend; webhook configurado na Evolution; instância conectada. |
| Evolution 401 | `AUTHENTICATION_API_KEY` (Evolution) = `EVOLUTION_API_KEY` (backend). |
| Serviço “dorme” | Free tier; primeira requisição pode demorar; para produção estável, considere plano pago. |

### Referências no projeto

- Backend: `backend/.env.example` – variáveis suportadas.
- Webhook: `docs/CONFIGURAR_WEBHOOK_EVOLUTION.md`.
- API Key: `docs/TROUBLESHOOTING_EVOLUTION_API_KEY.md`.
- Frontend/Vercel: `DEPLOY_VERCEL.md` na raiz do projeto.
