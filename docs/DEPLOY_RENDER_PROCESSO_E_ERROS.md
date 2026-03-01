# Documentação: processo de deploy no Render (o que funcionou) e erros resolvidos

Este documento descreve o **processo de deploy no Render que deu certo** para o projeto Loja Multidepartamental, os **erros encontrados** e **como foram resolvidos**. Serve como histórico e referência para futuros deploys.

---

## Índice

1. [Visão geral do que foi implantado](#1-visão-geral-do-que-foi-implantado)
2. [Ordem de execução que funcionou](#2-ordem-de-execução-que-funcionou)
3. [Erros e soluções – Backend (NestJS)](#3-erros-e-soluções--backend-nestjs)
4. [Erros e soluções – AI Service (Agno)](#4-erros-e-soluções--ai-service-agno)
5. [Erros e soluções – Evolution API](#5-erros-e-soluções--evolution-api)
6. [Erros e soluções – Integração e frontend](#6-erros-e-soluções--integração-e-frontend)
7. [Checklist final e referências](#7-checklist-final-e-referências)

---

## 1. Visão geral do que foi implantado

| Componente        | Tipo na Render   | Observação |
|-------------------|------------------|------------|
| Backend NestJS    | Web Service (Node) | Root Directory: `backend` |
| AI Service (Agno) | Web Service (Python) | Root Directory: `services/ai-service` |
| Evolution API     | Web Service (Docker) | Root Directory: `evolution-render` ou imagem `evoapicloud/evolution-api:latest` |
| PostgreSQL        | Managed Database | Só para Evolution API (Internal Database URL) |
| Redis             | Render Key Value | Cache da Evolution (Internal URL) |
| Frontend          | Vercel           | Já publicado; variáveis apontam para o backend na Render |

**Região:** use a **mesma região** para todos os serviços (ex.: Oregon).

---

## 2. Ordem de execução que funcionou

A ordem abaixo evita variáveis em branco e dependências quebradas:

1. **PostgreSQL** → anotar **Internal Database URL**.
2. **Redis** → anotar **Internal URL**.
3. **Backend NestJS** → anotar URL pública (ex.: `https://loja-backend.onrender.com`).
4. **AI Service** → anotar URL → preencher `AI_SERVICE_URL` no Backend e redeploy do backend.
5. **Evolution API (Docker)** → anotar URL → preencher `EVOLUTION_API_URL` no Backend e redeploy do backend.
6. **Webhook e instância WhatsApp** na Evolution (URL do webhook = backend + `/api/whatsapp/webhook`).
7. **Variáveis no Vercel** (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`) → redeploy do frontend.

---

## 3. Erros e soluções – Backend (NestJS)

### Erro: "no such table: leads" (SQLite)

**Sintoma:** Após o deploy, ao receber mensagem no WhatsApp ou acessar endpoints que usam leads, o backend retorna erro do tipo `no such table: leads` (ou outra tabela).

**Causa:** Na Render o disco é efêmero. Em cada deploy o diretório `data/` pode estar vazio; o Nest sobe antes de as tabelas do TypeORM existirem.

**Soluções aplicadas:**

1. **Start Command no Render** incluir sincronização antes de subir o Nest:
   - **Start Command:** `npm run sync-db && npm run start`
   - O script `backend/scripts/sync-db.js` usa as entities em `dist/entities`, cria o diretório do DB se precisar e roda `synchronize: true` no SQLite. Por isso o **Build** deve rodar antes (gerar `dist/`).

2. **TypeORM** no `app.module.ts` já está com `synchronize: true` para criar/atualizar tabelas quando o app sobe.

3. **Fallback no webhook:** Em `whatsapp.controller.ts`, na primeira vez que ocorre erro com mensagem contendo `"no such table"`, o código chama `this.dataSource.synchronize()` e tenta de novo. Isso cobre o caso em que o sync-db não rodou ou o DB foi recriado.

**Referência no código:**  
`backend/scripts/sync-db.js` (uso no Render comentado no topo);  
`backend/src/app.module.ts` (comentário sobre disco efêmero e "no such table: leads");  
`backend/src/modules/whatsapp/whatsapp.controller.ts` (retry com `synchronize` em "no such table").

---

### Erro: CORS ao chamar o backend a partir do frontend (Vercel)

**Sintoma:** O frontend na Vercel faz requisições ao backend na Render e o navegador bloqueia por CORS (origem não permitida).

**Causa:** `CORS_ORIGIN` no backend não incluir a origem exata do frontend (URL da Vercel).

**Solução:** No **Environment** do Web Service do backend na Render, definir:
- **Key:** `CORS_ORIGIN`
- **Value:** URL exata do frontend na Vercel (ex.: `https://ja-agno-chatboot-v7yq.vercel.app`), **sem barra no final**.

Depois salvar e fazer redeploy do backend.

---

### Erro: Backend não encontra AI Service ou Evolution

**Sintoma:** Chat não responde ou integração WhatsApp não funciona; logs indicam falha ao chamar `AI_SERVICE_URL` ou `EVOLUTION_API_URL`.

**Causa:** Essas variáveis foram deixadas em branco no primeiro deploy (AI Service e Evolution ainda não existiam).

**Solução:** Após criar o AI Service e a Evolution na Render e anotar as URLs:
1. No serviço do **Backend** → **Environment** → preencher:
   - `AI_SERVICE_URL` = URL do AI Service (ex.: `https://loja-ai-service.onrender.com`)
   - `EVOLUTION_API_URL` = URL da Evolution (ex.: `https://loja-evolution.onrender.com`)
2. Salvar e fazer **Redeploy** do backend para carregar as novas variáveis.

---

## 4. Erros e soluções – AI Service (Agno)

### Erro: Build do AI Service falha por incompatibilidade de versão do Python (ChromaDB / Agno)

**Sintoma:** Deploy do AI Service (Python) falha na etapa de build; mensagens relacionadas a ChromaDB ou Agno e versão do Python (ex.: 3.14).

**Causa:** ChromaDB/Agno não são compatíveis com Python 3.14 (ou versão muito nova); a Render pode usar uma versão padrão inadequada.

**Solução:** Fixar a versão do Python no serviço:
- No **Environment** do AI Service na Render:
  - **Key:** `PYTHON_VERSION`
  - **Value:** `3.12.7`
- No repositório, em `services/ai-service/runtime.txt`, manter:
  - `python-3.12.7`

Depois refazer o deploy do AI Service.

---

### Erro: AI Service não escuta na porta correta (Render)

**Sintoma:** Serviço sobe mas não responde; Render indica que a aplicação não está ouvindo na porta esperada.

**Causa:** A Render injeta a variável `PORT` dinamicamente; o comando de start precisa usar essa porta (ex.: 10000), e o host deve ser `0.0.0.0`.

**Solução:** No **Start Command** do AI Service usar uma das opções:
- `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Ou:  
  `python -c "import os; import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))"`

Não definir `PORT` manualmente no Environment; deixar a Render definir.

---

## 5. Erros e soluções – Evolution API

### Erro: Evolution API retorna 401 Unauthorized

**Sintoma:** Backend ou Evolution Manager retornam 401 ao chamar a Evolution API.

**Causa:** A chave usada no header `apikey` não é a mesma configurada na Evolution. No backend usamos `EVOLUTION_API_KEY`; na Evolution a variável é `AUTHENTICATION_API_KEY`. Se forem diferentes, a Evolution rejeita a requisição.

**Solução:** Garantir que:
- No **Backend** (Environment): `EVOLUTION_API_KEY` = uma chave forte (ex.: gerada em randomkeygen.com).
- No **Evolution API** (Environment): `AUTHENTICATION_API_KEY` = **exatamente o mesmo valor** que `EVOLUTION_API_KEY` no backend.

Salvar e redeploy do backend e da Evolution se necessário.  
Detalhes: `docs/TROUBLESHOOTING_EVOLUTION_API_KEY.md`.

---

### Erro: Evolution não sobe ou não responde na porta (Docker na Render)

**Sintoma:** Web Service Docker da Evolution fica "Unhealthy" ou não atende na porta que a Render espera.

**Causa:** A Evolution por padrão usa a porta 8080; na Render o Web Service recebe uma `PORT` dinâmica (ex.: 10000). O container precisa usar essa porta.

**Solução:**

1. **Dockerfile** (repositório já tem em `evolution-render/Dockerfile`):
   - Base: `evoapicloud/evolution-api:latest`
   - Definir `ENV SERVER_PORT=10000` e `EXPOSE 10000` para alinhar com o que a Render costuma usar.

2. **Variáveis de ambiente** do serviço Evolution na Render:
   - `SERVER_PORT` = `10000`
   - `SERVER_URL` = URL pública do próprio serviço Evolution (ex.: `https://loja-evolution.onrender.com`)

Se a imagem oficial usar outro nome de variável para a porta, conferir a documentação da Evolution API (env).

---

### Uso de PostgreSQL e Redis: Internal vs External URL

**Problema:** Usar a URL "External" do PostgreSQL ou do Redis para a Evolution pode causar lentidão, falhas ou custos desnecessários, pois o tráfego sai da rede interna da Render.

**Solução:** No **Environment** da Evolution, usar sempre:
- **Database:** **Internal Database URL** do PostgreSQL (Passo 1).
- **Redis:** **Internal URL** do Redis (Passo 2).

Assim o tráfego fica na rede interna da Render.

---

### Instância WhatsApp desconecta após redeploy da Evolution

**Sintoma:** Após um novo deploy da Evolution, a instância WhatsApp deixa de estar conectada; é preciso escanear o QR code de novo.

**Causa:** Em plano sem disco persistente, o diretório onde a Evolution guarda dados das instâncias (ex.: `/evolution/instances`) é efêmero e é perdido no redeploy.

**Solução (comportamento conhecido):**  
Reconectar a instância via QR code após cada redeploy da Evolution. Se a Render oferecer **persistent disk**, configurar montagem nesse diretório para persistir as instâncias (consultar documentação da Render e da Evolution).

---

## 6. Erros e soluções – Integração e frontend

### Webhook da Evolution não recebe eventos

**Sintoma:** Mensagens chegam no WhatsApp mas o backend não reage; webhook não é chamado.

**Causas comuns:**
1. URL do webhook incorreta ou inacessível.
2. Eventos não marcados (ex.: `MESSAGES_UPSERT`).

**Solução:**
1. Na Evolution (Manager ou API), configurar o webhook da instância:
   - **URL:** `https://loja-backend.onrender.com/api/whatsapp/webhook` (substituir pelo seu `BACKEND_PUBLIC_URL` + `/api/whatsapp/webhook`).
   - **Eventos:** incluir pelo menos **MESSAGES_UPSERT**.
2. No backend, `BACKEND_PUBLIC_URL` deve ser exatamente a URL pública do backend na Render (a mesma que a Evolution usa para chamar o webhook).  
Referência: `docs/CONFIGURAR_WEBHOOK_EVOLUTION.md`.

---

### Frontend (Vercel) não fala com o backend

**Sintoma:** O site na Vercel não carrega dados ou não conecta ao backend.

**Causa:** Variáveis de ambiente do frontend ainda apontam para localhost ou para outro backend.

**Solução:** No projeto no Vercel → **Settings** → **Environment Variables**:
- `NEXT_PUBLIC_API_URL` = URL do backend na Render (ex.: `https://loja-backend.onrender.com`)
- `NEXT_PUBLIC_WS_URL` = mesma URL do backend

Salvar e fazer **Redeploy** do frontend.

---

## 7. Checklist final e referências

### Checklist do deploy que funcionou

- [ ] PostgreSQL e Redis criados na mesma região; URLs **internas** usadas na Evolution.
- [ ] Backend: Root Directory = `backend`; Build = `npm ci && npm run build`; Start = `npm run sync-db && npm run start`.
- [ ] Backend: `CORS_ORIGIN`, `AI_SERVICE_URL`, `EVOLUTION_API_URL`, `BACKEND_PUBLIC_URL`, `PRODUCT_IMAGES_BASE_URL` preenchidos; não definir `PORT`.
- [ ] AI Service: Root Directory = `services/ai-service`; `PYTHON_VERSION=3.12.7`; `OPENAI_API_KEY` e `BACKEND_URL` definidos; Start usando `$PORT`.
- [ ] Evolution: Dockerfile em `evolution-render/` com `SERVER_PORT=10000`; `AUTHENTICATION_API_KEY` igual ao `EVOLUTION_API_KEY` do backend; Postgres e Redis com URLs internas; `SERVER_URL` com a URL pública da Evolution.
- [ ] Vercel: `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_WS_URL` apontando para o backend na Render.
- [ ] Webhook da Evolution: URL = `{BACKEND_PUBLIC_URL}/api/whatsapp/webhook`; evento MESSAGES_UPSERT habilitado.

### Resumo rápido de erros e soluções

| Problema | Solução |
|----------|--------|
| "no such table: leads" | Start Command com `npm run sync-db && npm run start`; TypeORM `synchronize: true`; fallback no webhook. |
| CORS no frontend | `CORS_ORIGIN` com a URL exata do frontend (Vercel), sem barra no final. |
| Chat/WhatsApp não responde | Preencher `AI_SERVICE_URL` e `EVOLUTION_API_URL` no backend e redeploy. |
| Evolution 401 | `AUTHENTICATION_API_KEY` (Evolution) = `EVOLUTION_API_KEY` (backend). |
| AI Service build Python | `PYTHON_VERSION=3.12.7` e `runtime.txt` com `python-3.12.7`. |
| AI Service porta | Start com `uvicorn ... --port $PORT` e `--host 0.0.0.0`. |
| Evolution porta Docker | Dockerfile e env com `SERVER_PORT=10000`; `SERVER_URL` com URL pública. |
| Webhook não dispara | URL = `{BACKEND_PUBLIC_URL}/api/whatsapp/webhook`; MESSAGES_UPSERT habilitado. |
| Serviço "dorme" (free tier) | Comportamento esperado; primeira requisição pode demorar; para produção estável, considerar plano pago. |

### Referências no repositório

- Passo a passo completo: `docs/DEPLOY_RENDER.md`
- Webhook: `docs/CONFIGURAR_WEBHOOK_EVOLUTION.md`
- API Key Evolution: `docs/TROUBLESHOOTING_EVOLUTION_API_KEY.md`
- Backend env: `backend/.env.example`
- Sync DB: `backend/scripts/sync-db.js`
- Evolution Docker: `evolution-render/Dockerfile`
- AI Service runtime: `services/ai-service/runtime.txt`

---

**Última atualização:** Março 2026  
**Contexto:** Deploy na Render (backend, AI Service, Evolution API) com frontend na Vercel.
