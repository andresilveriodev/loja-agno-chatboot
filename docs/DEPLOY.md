# Deploy – Loja Multidepartamental

Ponto de entrada para deploy do projeto (monorepo: frontend Next.js + backend NestJS + AI Service + Evolution API).

---

## Ordem recomendada

1. **Backend na Render** (ou outro host) → ver [Deploy na Render](#documentos-detalhados).
2. **Frontend na Vercel** → configurar Root Directory e variáveis; ver [Deploy no Vercel](#documentos-detalhados).

---

## Vercel – configuração rápida

| Onde | O que definir |
|------|----------------|
| **Root Directory** | **`frontend`** (obrigatório; sem isso o build falha com "No Next.js version detected") |
| **Environment Variables** | `NEXT_PUBLIC_API_URL` = URL do backend (ex.: `https://loja-agno-chatboot.onrender.com`) |
| | `NEXT_PUBLIC_WS_URL` = mesma URL do backend |
| **Environments** | Marque **Production** e **Preview** (para deploys de branch funcionarem) |
| **Após alterar** | **Redeploy** (variáveis `NEXT_PUBLIC_*` são embutidas no build) |

- Não use barra no final da URL. Não use `localhost` em produção.
- Guia completo: [DEPLOY_VERCEL.md](../DEPLOY_VERCEL.md) (na raiz do projeto).

---

## Backend em produção

O frontend chama o backend pela URL definida em `NEXT_PUBLIC_API_URL`. O backend precisa:

- Estar no ar (Render, Railway, etc.).
- Ter **CORS_ORIGIN** com a URL do app na Vercel (ex.: `https://seu-app.vercel.app`).

Sem a URL do backend configurada no Vercel, o catálogo e o CRM mostram erro de conexão (o app tenta `localhost`).

---

## Documentos detalhados

| Documento | Conteúdo |
|-----------|----------|
| [**DEPLOY_VERCEL.md**](../DEPLOY_VERCEL.md) (raiz) | Passo a passo Vercel, variáveis, CORS, troubleshooting "Erro ao carregar produtos" |
| [**DEPLOY_RENDER.md**](DEPLOY_RENDER.md) | Passo a passo completo: Backend, AI Service, Evolution API, PostgreSQL, Redis, webhook, variáveis no Vercel |
| [**DEPLOY_RENDER_PROCESSO_E_ERROS.md**](DEPLOY_RENDER_PROCESSO_E_ERROS.md) | O que funcionou no Render, erros encontrados e como foram resolvidos (ex.: seed de produtos, "no such table", IA sem produtos) |

Outros: [CONFIGURAR_WEBHOOK_EVOLUTION.md](CONFIGURAR_WEBHOOK_EVOLUTION.md), [TROUBLESHOOTING_EVOLUTION_API_KEY.md](TROUBLESHOOTING_EVOLUTION_API_KEY.md).

---

## Resumo por plataforma

| Parte | Onde sobe | Doc principal |
|-------|-----------|----------------|
| Frontend (Next.js) | **Vercel** | [DEPLOY_VERCEL.md](../DEPLOY_VERCEL.md) |
| Backend (NestJS) | Render / Railway / etc. | [DEPLOY_RENDER.md](DEPLOY_RENDER.md) |
| AI Service (Agno) | Render / mesmo host | [DEPLOY_RENDER.md](DEPLOY_RENDER.md) |
| Evolution API | Render (Docker) | [DEPLOY_RENDER.md](DEPLOY_RENDER.md) |
