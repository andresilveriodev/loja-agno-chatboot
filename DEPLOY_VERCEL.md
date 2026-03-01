# Deploy do frontend no Vercel

Este projeto é um **monorepo**. No Vercel você faz deploy **apenas do frontend** (Next.js). O backend (NestJS) e o ai-service (Python) devem estar em outro provedor (Railway, Render, Fly.io, etc.).

**Índice de deploy:** [docs/DEPLOY.md](docs/DEPLOY.md).

---

## Passo a passo

### 1. Conectar o repositório e Root Directory

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. **Add New** → **Project** e importe o repositório do GitHub/GitLab/Bitbucket.
3. **Root Directory (obrigatório):** em **Root Directory**, clique em **Edit** e defina: **`frontend`**.
   - Se deixar em branco ou na raiz, o build falha com *"No Next.js version detected"*, pois o Next.js está na pasta `frontend/`.
4. Confirme que o **Framework Preset** está como **Next.js**.

### 2. Variáveis de ambiente

Em **Settings → Environment Variables** do projeto, adicione:

| Nome | Valor | Ambiente |
|------|--------|----------|
| `NEXT_PUBLIC_API_URL` | URL pública do backend (ex: `https://seu-backend.railway.app`) | Production, Preview |
| `NEXT_PUBLIC_WS_URL` | Mesma URL do backend (WebSocket) | Production, Preview |

- **Não use** `localhost` em produção.
- Não coloque barra no final da URL.
- **Importante:** marque **Production** e **Preview**. Se só marcar Production, deploys de branch (ex.: `feature-xxx`) vão usar URL vazia e o app tentará `localhost`, gerando "Erro ao carregar produtos" ou "Erro ao carregar dados" no CRM.
- Após alterar variáveis, faça **Redeploy** (Deployments → ⋮ → Redeploy). As variáveis `NEXT_PUBLIC_*` são embutidas no build; um deploy antigo não as usa.

### 3. Backend em produção

Para o frontend funcionar em produção:

1. **Hospede o backend** em Railway, Render, Fly.io ou similar.
2. No backend, configure a variável **`CORS_ORIGIN`** com a URL do app no Vercel, por exemplo:
   ```bash
   CORS_ORIGIN=https://seu-app.vercel.app
   ```
   Se tiver domínio customizado, inclua também:
   ```bash
   CORS_ORIGIN=https://seu-app.vercel.app,https://seusite.com
   ```

### 4. Deploy

- **Deploy automático:** a cada push na branch conectada (ex: `main`), o Vercel faz o build e publica.
- **Build local (teste):** na pasta `frontend`, rode `npm ci` e `npm run build`. Se passar, o build no Vercel tende a passar também.

### 5. Checklist antes do primeiro deploy

- [ ] Root Directory = `frontend`
- [ ] `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_WS_URL` definidas no Vercel
- [ ] Backend no ar com `CORS_ORIGIN` incluindo a URL do frontend (ex: `https://xxx.vercel.app`)
- [ ] `npm run build` na pasta `frontend` concluindo sem erro

## Estrutura do deploy

| Parte | Onde sobe |
|-------|-----------|
| Frontend (Next.js) | **Vercel** |
| Backend (NestJS) | Railway, Render, Fly.io, etc. |
| AI Service (Python) | Mesmo host do backend ou outro serviço |

O frontend em produção chama o backend pelas URLs configuradas em `NEXT_PUBLIC_*`.

### "Erro ao carregar produtos" ou "Erro ao carregar dados" (CRM)

Se o catálogo ou o CRM mostra erro de conexão mesmo com o backend no ar:

1. **Variáveis para Preview:** Em Environment Variables, confira que `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_WS_URL` estão marcadas para **Preview** (não só Production). URLs de branch (ex.: `*-andreadams-projects.vercel.app`) usam o ambiente Preview.
2. **Redeploy:** Depois de salvar as variáveis, vá em **Deployments**, abra o menu (⋮) do deploy desejado e clique em **Redeploy**. O build precisa rodar de novo para embutir as URLs.
3. **Valor correto:** Use a URL do backend sem barra no final (ex.: `https://loja-agno-chatboot.onrender.com`). O backend deve estar acessível e com `CORS_ORIGIN` incluindo o domínio do frontend no Vercel.
