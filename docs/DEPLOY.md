# Deploy – Loja Multidepartamental

O frontend é um **Next.js** dentro da pasta `frontend/` (monorepo). Para Vercel e Netlify funcionarem, siga os passos abaixo.

---

## 1. Backend em produção

Antes do frontend, o backend precisa estar no ar (ex.: Render, Railway) e você precisa da URL base, por exemplo:

- `https://seu-backend.onrender.com`
- `https://seu-backend.railway.app`

Guarde essa URL para as variáveis de ambiente do frontend.

---

## 2. Vercel

1. Conecte o repositório ao projeto na Vercel.
2. **Root Directory (obrigatório):**
   - Em **Project Settings → General**, em **Root Directory**, clique em **Edit**.
   - Defina como **`frontend`** (e salve).
   - Se deixar a raiz do repo, o build falha porque o Next.js está em `frontend/`.
3. **Variáveis de ambiente** (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_API_URL` = URL do backend (ex.: `https://seu-backend.onrender.com`)
   - `NEXT_PUBLIC_WS_URL` = mesma URL do backend (ex.: `https://seu-backend.onrender.com`)
4. **Build:** deixe o comando padrão (`npm run build` ou `next build`). Não é preciso definir **Output Directory**.
5. Faça um novo deploy (Redeploy) após salvar Root Directory e variáveis.

---

## 3. Netlify

1. Conecte o repositório ao site no Netlify.
2. O arquivo **`netlify.toml`** na raiz já está configurado:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Plugin:** `@netlify/plugin-nextjs`
3. **Variáveis de ambiente** (Site settings → Environment variables):
   - `NEXT_PUBLIC_API_URL` = URL do backend
   - `NEXT_PUBLIC_WS_URL` = mesma URL do backend
4. **Node:** o `netlify.toml` já define `NODE_VERSION = "20"`.
5. Faça um novo deploy (Trigger deploy) após definir as variáveis.

---

## Resumo

| Plataforma | O que conferir |
|------------|----------------|
| **Vercel** | Root Directory = **`frontend`** + `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_WS_URL` |
| **Netlify** | Base = **`frontend`** (já no `netlify.toml`) + mesmas variáveis de ambiente |

Sem a **URL do backend** em produção, a loja carrega mas não consegue listar produtos, chat nem CRM (tudo fica em localhost). Defina sempre as duas variáveis com a URL do backend em produção.
