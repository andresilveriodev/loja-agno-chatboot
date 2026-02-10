# Backend - Loja Multidepartamental

API REST em NestJS com SQLite (TypeORM).

## Pré-requisitos

- Node.js 20+

Não é necessário instalar MongoDB nem outro banco: o SQLite usa um arquivo local (`data/loja.db`).

## Setup

**Obrigatório (só uma vez):** instalar dependências.

```bash
cd backend
copy .env.example .env
# Opcional: ajuste DATABASE_PATH (padrão: data/loja.db)
npm install
```

No **PowerShell** (Windows), use `;` para encadear comandos em vez de `&&`:
```powershell
cd "C:\caminho\para\Loja multidepartamental\backend"; npm install
```

## Desenvolvimento

Rode `npm install` na pasta `backend` antes de usar `npm run start:dev` ou `npm run seed`.

```bash
npm run start:dev
```

Na primeira execução, a pasta `data/` e o arquivo `data/loja.db` são criados automaticamente (se ainda não existirem).

API em `http://localhost:3001`.

- Health: `GET http://localhost:3001/health`
- Produtos: `GET http://localhost:3001/api/products`
- Produto por ID: `GET http://localhost:3001/api/products/prod_001`

## Seed (popular produtos)

Popula o SQLite com o catálogo a partir de `PRODUTOS_CATALOGO.json` (raiz do projeto). Execute **pelo menos uma vez** após instalar:

```bash
cd backend
npm run seed
```

Ou com ts-node direto:

```bash
cd backend
npx ts-node src/scripts/seed-products.ts
```

O script recria a tabela de produtos e insere todos os itens do JSON. Mensagens do chat permanecem no banco.

## Variáveis de ambiente

| Variável         | Descrição                          | Padrão       |
|------------------|------------------------------------|--------------|
| `PORT`           | Porta do servidor                  | `3001`       |
| `NODE_ENV`       | `development` / `production`       | -            |
| `DATABASE_PATH`  | Caminho do arquivo SQLite          | `data/loja.db` |

Em produção, evite `synchronize: true` (já desativado quando `NODE_ENV=production`). Prefira migrações TypeORM para alterar o schema.
