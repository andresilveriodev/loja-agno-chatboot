# Frontend - Loja Multidepartamental

Catálogo de produtos com filtros por categoria e chat flutuante.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3002](http://localhost:3002)

## Scripts

- `npm run dev` — Desenvolvimento
- `npm run build` — Build de produção
- `npm run start` — Servir build
- `npm run lint` — ESLint

## Estrutura

- `app/` — Páginas e componentes (App Router)
- `app/components/` — Layout, Catalog, Hero, ChatWidget
- `app/store/` — Zustand (filtros, chat)
- `lib/` — types, constants, utils

## Variáveis

Copie `.env.example` para `.env.local` e ajuste se necessário (API URL quando o backend estiver rodando).
