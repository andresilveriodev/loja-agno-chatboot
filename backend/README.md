# Backend - Loja Multidepartamental

API REST em NestJS com MongoDB.

## Pré-requisitos

- Node.js 20+
- MongoDB (local ou via Docker)
- Redis (opcional, para fases futuras)

## Setup

**Obrigatório (só uma vez):** instalar dependências. Sem isso, `nest` e `ts-node` não são encontrados.

```bash
cd backend
copy .env.example .env
# Ajuste DATABASE_URL se necessário (Windows: use copy em vez de cp)
npm install
```

No **PowerShell** (Windows), use `;` para encadear comandos em vez de `&&`:
```powershell
cd "C:\caminho\para\Loja multidepartamental\backend"; npm install
```

## Rodar com Docker (Mongo + Redis)

Na **raiz do projeto**:

```bash
docker-compose up -d
```

Isso sobe MongoDB (porta 27017) e Redis (apenas na rede Docker; o backend ainda não usa Redis). Depois inicie o backend localmente.

## Desenvolvimento

Os scripts usam o CLI do projeto (`node_modules`). **Rode `npm install` na pasta `backend` antes** de usar `npm run start:dev` ou `npm run seed`.

```bash
npm run start:dev
```

API em `http://localhost:3001`.

- Health: `GET http://localhost:3001/health`
- Produtos: `GET http://localhost:3001/api/products`
- Produto por ID: `GET http://localhost:3001/api/products/prod_001`

## Seed (popular produtos)

Com MongoDB rodando (e backend na pasta `backend`):

```bash
cd backend
npm run seed
```

Ou com ts-node direto (a partir da raiz do repositório):

```bash
cd backend
DATABASE_URL=mongodb://localhost:27017/loja-db npx ts-node src/scripts/seed-products.ts
```

O script usa o arquivo `PRODUTOS_CATALOGO.json` da raiz do projeto.

## Erro de conexão com o banco (ECONNREFUSED 127.0.0.1:27017)

Se aparecer `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`:

- **MongoDB não está em execução.** O backend espera um MongoDB em `localhost:27017` (ou na URL em `DATABASE_URL`).
- **Soluções:**
  1. Subir o MongoDB localmente (instalação nativa ou via Docker: `docker-compose up -d` na raiz do projeto).
  2. Usar MongoDB Atlas (ou outro serviço) e definir no `.env`: `DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/loja-db`.
  3. Se usar Docker, aguardar o container do MongoDB estar pronto antes de iniciar o backend.
