# Deploy do frontend no Vercel

Este projeto é um **monorepo**. No Vercel você faz deploy **apenas do frontend** (Next.js). O backend (NestJS) e o ai-service (Python) devem estar em outro provedor (Railway, Render, Fly.io, etc.).

## Passo a passo

### 1. Conectar o repositório

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. **Add New** → **Project** e importe o repositório do GitHub/GitLab/Bitbucket.
3. **Importante:** em **Root Directory**, clique em **Edit** e defina: `frontend`.
4. Confirme que o **Framework Preset** está como **Next.js**.

### 2. Variáveis de ambiente

Em **Settings → Environment Variables** do projeto, adicione:

| Nome | Valor | Ambiente |
|------|--------|----------|
| `NEXT_PUBLIC_API_URL` | URL pública do backend (ex: `https://seu-backend.railway.app`) | Production, Preview |
| `NEXT_PUBLIC_WS_URL` | Mesma URL do backend (WebSocket) | Production, Preview |

- **Não use** `localhost` em produção.
- Não coloque barra no final da URL.
- Após alterar variáveis, faça um novo deploy.

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
