# Deploy do frontend no Netlify

Este projeto é um **monorepo**. No Netlify você faz deploy **apenas do frontend** (Next.js). O backend (NestJS) e o ai-service (Python) devem estar em outro provedor (Railway, Render, Fly.io, etc.).

A configuração do build está no **`netlify.toml`** na raiz do repositório (base = `frontend`).

---

## Importante: não use deploy manual (drag-and-drop)

**Next.js não funciona com “Deploy manual” (arrastar pasta).** No deploy manual o Netlify só serve os arquivos que você enviou e **não** roda `npm install` nem `npm run build`. O Next.js precisa ser construído no servidor; sem o build, não existe site (tudo dá “Page not found”).

**Use sempre “Import an existing project”** e conecte o repositório Git. O Netlify vai clonar o repo, rodar o build na pasta `frontend` e publicar o resultado. O `netlify.toml` na raiz já está configurado para isso.

---

## Passo a passo

### 1. Conectar o repositório (obrigatório)

1. Acesse [netlify.com](https://www.netlify.com) e faça login.
2. **Add new site** → **Import an existing project** e conecte o repositório (GitHub/GitLab/Bitbucket).
3. O Netlify usa o **`netlify.toml`** na raiz:
   - **Base directory:** `frontend` (obrigatório para monorepo)
   - **Build command:** `npm run build`
   - **Plugin:** `@netlify/plugin-nextjs` (declarado no toml; dependência no `frontend/package.json`)

Não altere **Publish directory** — o plugin Next.js define isso automaticamente.

**Se ainda der "Page not found":** em **Site configuration** → **Build & deploy** → **Build settings** → **Edit settings**, confirme que **Base directory** está `frontend`. Se estiver vazio, o build roda na raiz e o Next.js não é encontrado. Salve e faça **Trigger deploy**.

### 2. Variáveis de ambiente

Em **Site configuration** → **Environment variables** (ou **Site settings** → **Environment variables**), adicione:

| Nome | Valor | Escopo |
|------|--------|--------|
| `NEXT_PUBLIC_API_URL` | URL pública do backend (ex: `https://seu-backend.railway.app`) | All scopes (Production, Deploy previews, Branch deploys) |
| `NEXT_PUBLIC_WS_URL` | Mesma URL do backend (WebSocket) | All scopes |

- **Não use** `localhost` em produção.
- Não coloque barra no final da URL.
- Após alterar variáveis, faça **Trigger deploy** → **Deploy site** para aplicar.

### 3. Backend em produção

Para o frontend funcionar em produção:

1. **Hospede o backend** em Railway, Render, Fly.io ou similar.
2. No backend, configure a variável **`CORS_ORIGIN`** com a URL do app no Netlify, por exemplo:
   ```bash
   CORS_ORIGIN=https://seu-app.netlify.app
   ```
   Se tiver domínio customizado, inclua também:
   ```bash
   CORS_ORIGIN=https://seu-app.netlify.app,https://seusite.com
   ```

### 4. Deploy

- **Deploy automático:** a cada push na branch conectada (ex: `main`), o Netlify faz o build e publica.
- **Build local (teste):** na pasta `frontend`, rode `npm ci` e `npm run build`. Se passar, o build no Netlify tende a passar também.

### 5. Checklist antes do primeiro deploy

- [ ] Repositório conectado e `netlify.toml` na raiz (com `base = "frontend"`)
- [ ] `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_WS_URL` definidas no Netlify
- [ ] Backend no ar com `CORS_ORIGIN` incluindo a URL do frontend (ex: `https://xxx.netlify.app`)
- [ ] `npm run build` na pasta `frontend` concluindo sem erro
- [ ] No log do deploy no Netlify: build concluído com sucesso e mensagem do tipo "Using Next.js Runtime" ou "@netlify/plugin-nextjs"

## Estrutura do deploy

| Parte | Onde sobe |
|-------|-----------|
| Frontend (Next.js) | **Netlify** |
| Backend (NestJS) | Railway, Render, Fly.io, etc. |
| AI Service (Python) | Mesmo host do backend ou outro serviço |

O frontend em produção chama o backend pelas URLs configuradas em `NEXT_PUBLIC_*`.

## Referências

- [Next.js on Netlify (overview)](https://docs.netlify.com/frameworks/next-js/overview/)
- [Deploy Next.js 15 on Netlify](https://www.netlify.com/blog/deploy-nextjs-15/)
