# 🏪 Loja Multidepartamental com Agente IA

**Plataforma de Catálogo + Chat Inteligente + CRM com Agente IA**

```
┌─────────────────────────────────────────────────────────┐
│   🖥️ Frontend (Next.js)                                 │
│   • Catálogo de 30 produtos em 9 categorias            │
│   • Chat flutuante com IA em tempo real                │
│   • Responsivo mobile-first                            │
├─────────────────────────────────────────────────────────┤
│   🔧 Backend (NestJS)                                   │
│   • API REST com MongoDB                               │
│   • WebSocket para chat real-time                      │
│   • AGNO IA para processamento inteligente             │
│   • CRM Kanban integrado                               │
├─────────────────────────────────────────────────────────┤
│   🤖 IA Service (AGNO)                                  │
│   • Agente de Qualificação                             │
│   • Agente de Vendas                                   │
│   • Memory + Storage para histórico                    │
├─────────────────────────────────────────────────────────┤
│   📱 WhatsApp Integration                               │
│   • Evolution API para WhatsApp                        │
│   • Sincronização com chat web                        │
│   • CRM atualizado em tempo real                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Tabela de Conteúdo

- [Início Rápido](#-início-rápido)
- [Pré-requisitos](#-pré-requisitos)
- [Setup Completo](#-setup-completo)
- [Executar Projeto](#-executar-projeto)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Documentação](#-documentação)
- [FAQ](#-faq)
- [Suporte](#-suporte)

---

## 🚀 Início Rápido

**Tempo estimado:** 5-10 minutos

```bash
# 1. Clonar/preparar repositório
cd loja-multidepartamental

# 2. Instalar e rodar com Docker Compose
docker-compose up -d

# 3. Aguardar serviços iniciarem (~30 segundos)

# 4. Acessar aplicação
Frontend:  http://localhost:3002
Backend:   http://localhost:3001
MongoDB:   mongodb://localhost:27017
```

---

## ✅ Pré-requisitos

### Obrigatório
- **Docker Desktop** 4.0+ ([download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** 2.0+ (incluído no Docker Desktop)
- **Git** ([download](https://git-scm.com/))

### Opcional (desenvolvimento local)
- **Node.js** 20+ ([download](https://nodejs.org/))
- **npm** 10+ (incluído no Node.js)
- **Python** 3.12+ ([download](https://www.python.org/))
- **MongoDB Compass** ([download](https://www.mongodb.com/products/compass))
- **Postman** ou **VS Code REST Client** (testar APIs)

### Verificar Instalação

```bash
# Verificar versões
docker --version
docker-compose --version
git --version
node --version    # Se instalado
npm --version     # Se instalado
python --version  # Se instalado
```

---

## 🔧 Setup Completo

### Opção 1: Com Docker Compose (Recomendado)

**1. Clonar repositório:**
```bash
git clone <seu-repo-url>
cd loja-multidepartamental
```

**2. Criar arquivo `.env` (root):**
```bash
cp .env.example .env
```

**Editar `.env` com suas credenciais:**
```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Backend
PORT=3001
NODE_ENV=development
DATABASE_URL=mongodb://mongo:27017/loja-db
REDIS_URL=redis://redis:6379
OPENAI_API_KEY=sk-proj-xxxxx  # Sua chave aqui
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=xxxxx

# AI Service
AGNO_API_KEY=xxxxx
AGNO_MODEL=gpt-4
```

**3. Rodar Docker Compose:**
```bash
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

**4. Acessar aplicação:**
- Frontend: http://localhost:3002
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

### Opção 2: Setup Local (Desenvolvimento)

**1. Frontend:**
```bash
cd frontend
cp .env.example .env.local

# Editar .env.local com URLs locais
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001

npm install
npm run dev
# Acessar: http://localhost:3002
```

**2. Backend (em outro terminal):**
```bash
cd backend
cp .env.example .env.local

# Editar .env.local
DATABASE_URL=mongodb://localhost:27017/loja-db
REDIS_URL=redis://localhost:6379

npm install
npm run start:dev
# Acessar: http://localhost:3001 (backend)
```

**3. MongoDB Local:**
```bash
# Opção A: Com Docker
docker run -d -p 27017:27017 --name loja-mongo mongo:6

# Opção B: Já instalado localmente
mongod

# Verificar conexão
mongosh mongodb://localhost:27017
```

**4. Redis Local:**
```bash
# Opção A: Com Docker
docker run -d -p 6379:6379 --name loja-redis redis:7

# Opção B: Já instalado localmente
redis-server
```

---

## ▶️ Executar Projeto

### Iniciar Serviços

```bash
# Iniciar com Docker Compose (tudo de uma vez)
docker-compose up

# Ou em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Limpar volumes (cuidado - apaga dados)
docker-compose down -v
```

### Verificar Saúde dos Serviços

```bash
# Frontend
curl http://localhost:3002

# Backend
curl http://localhost:3001/api/health

# MongoDB
curl http://localhost:27017  # (vai dar erro, é normal)

# Redis
curl http://localhost:6379   # (vai dar erro, é normal)
```

### Testar Endpoints

**Via REST Client (VS Code):**
```
Instalar: REST Client extension
Criar: arquivo com extensão .http
```

**Exemplo: `test-api.http`**
```http
### Listar produtos
GET http://localhost:3001/api/products

### Listar por categoria
GET http://localhost:3001/api/products?category=Ferramentas%20%26%20Máquinas%20Profissionais

### Obter um produto
GET http://localhost:3001/api/products/[ID]

### Health check
GET http://localhost:3001/api/health
```

---

## 📁 Estrutura de Pastas

```
loja-multidepartamental/
├── ARQUITETURA_PROJETO.md        ← Documentação técnica
├── ESTRUTURA_PASTAS.md           ← Estrutura detalhada
├── PLANO_DESENVOLVIMENTO.md      ← Checklist de tarefas
├── README.md                     ← Você está aqui
│
├── frontend/                     # Next.js + React
│   ├── app/                      # App Router (Next.js 15+)
│   ├── public/                   # Assets estáticos
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # NestJS + API
│   ├── src/
│   │   ├── modules/              # Módulos (products, chat, leads, crm, ai)
│   │   ├── services/             # Serviços (whatsapp, storage)
│   │   └── config/               # Configurações
│   ├── package.json
│   └── tsconfig.json
│
├── services/                     # Serviços auxiliares
│   ├── evolution-api/            # WhatsApp API
│   ├── ai-service/               # AGNO IA (Python)
│   └── mongodb/                  # MongoDB
│
├── docs/                         # Documentação adicional
│   ├── AGNO/                     # Docs AGNO
│   ├── API.md                    # API docs
│   └── endpoints/                # Exemplos de requisições
│
├── docker-compose.yml            # Orquestração
├── .env.example                  # Template de variáveis
└── .gitignore
```

---

## 📚 Documentação

### Documentos Principais

1. **ARQUITETURA_PROJETO.md**
   - Visão geral do projeto
   - Stack tecnológico
   - Fluxos de dados
   - Componentes principais

2. **ESTRUTURA_PASTAS.md**
   - Árvore de pastas completa
   - Convenções de nomes
   - Referências por fase

3. **PLANO_DESENVOLVIMENTO.md**
   - Checklist executável
   - Tarefas por fase
   - Comandos específicos

4. **API.md** (próximo a criar)
   - Documentação de endpoints
   - Exemplos de requisições
   - Códigos de resposta

### Documentação AGNO (Existente)

Na pasta `docs/` já existem:
- `INSTALACAO_AGNO.md` - Setup AGNO
- `GUIA_INTEGRACAO_AGNO_Whatsapp_Service.md` - WhatsApp + AGNO
- `DOCUMENTACAO_STORAGE_MEMORIA_RAG_AGNO.md` - Memory e Storage
- E mais...

---

## 🛠️ Comandos Úteis

### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev              # Iniciar dev server (porta 3002)
npm run build           # Build para produção
npm run start           # Rodar versão built

# Testes
npm run test            # Jest tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Linting
npm run lint           # ESLint
npm run format         # Prettier format
```

### Backend

```bash
cd backend

# Desenvolvimento
npm run start:dev       # Dev server com hot-reload (port 3001)
npm run start           # Production mode
npm run build          # Compilar TypeScript

# Testes
npm run test           # Jest tests
npm run test:watch    # Watch mode
npm run test:e2e      # End-to-end tests
npm run test:debug    # Debug mode

# Database
npm run typeorm:seed   # Executar seeds
npm run db:reset       # Resetar banco

# Linting
npm run lint          # ESLint
npm run format        # Prettier format
```

### Docker

```bash
# Iniciar
docker-compose up               # Iniciar com logs
docker-compose up -d            # Iniciar em background

# Parar
docker-compose down             # Parar containers
docker-compose down -v          # Parar + remover volumes

# Logs
docker-compose logs             # Ver todos os logs
docker-compose logs -f          # Follow logs
docker-compose logs backend     # Logs de um serviço específico

# Executar comandos
docker-compose exec backend npm run test:e2e
docker-compose exec frontend npm run build

# Rebuild
docker-compose build --no-cache
```

---

## 🐛 Troubleshooting

### "Port 3002/3001 já em uso"

```bash
# Ver processo usando porta do frontend (3002) ou backend (3001)
lsof -i :3002        # macOS/Linux - frontend
lsof -i :3001       # macOS/Linux - backend
netstat -ano | findstr :3002  # Windows - frontend
netstat -ano | findstr :3001  # Windows - backend

# Matar processo
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Ou usar porta diferente
# Editar docker-compose.yml ou .env
```

### "MongoDB connection refused"

```bash
# Verificar se MongoDB está rodando
docker ps | grep mongo

# Reiniciar MongoDB
docker-compose restart mongo

# Ou checar logs
docker-compose logs mongo
```

### "Socket connection failed"

```bash
# Verificar se WebSocket está funcionando
# Checar CORS em backend
# Verificar firewall

# Logs do frontend
npm run dev  # Ver console
```

### "AGNO API Key inválida"

```bash
# Verificar .env
cat .env | grep OPENAI_API_KEY

# Gerar nova chave em:
# https://platform.openai.com/api-keys

# Verificar que começa com "sk-proj-"
```

### "Out of memory"

```bash
# Docker pode estar sem RAM suficiente
# Aumentar em Docker Desktop > Preferences > Resources

# Ou rodar serviços localmente
docker-compose down  # Parar tudo
npm run dev          # Rodar frontend local
```

---

## 📊 Monitorar Aplicação

### Dashboard de Health Check

```bash
# Frontend
curl http://localhost:3002

# Backend
curl http://localhost:3001/api/health

# Resposta esperada:
# {
#   "status": "ok",
#   "timestamp": "2026-02-04T...",
#   "database": "connected",
#   "redis": "connected"
# }
```

### Verificar Banco de Dados

```bash
# MongoDB
docker-compose exec mongo mongosh
show dbs
use loja-db
db.products.find()
db.leads.find()

# Sair: exit()
```

### Redis CLI

```bash
docker-compose exec redis redis-cli
PING        # Verificar conexão
KEYS *      # Ver todas as keys
GET key     # Ver valor de uma key
FLUSHALL    # Limpar todos os dados (cuidado!)
```

---

## 🚀 Deploy

### Deploy em Produção

1. **Preparar ambiente:**
   ```bash
   # Copiar .env.production
   cp .env.example .env.production
   # Editar com credenciais de produção
   ```

2. **Construir images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Rodar em produção:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verificar:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs
   ```

Consulte `docs/DEPLOYMENT.md` para instruções detalhadas.

---

## ❓ FAQ

### P: Qual é o padrão de branch para git?
**R:** 
```
main/master - produção
develop     - staging
feature/*   - novas features
bugfix/*    - correções
```

### P: Como adicionar um novo produto ao catálogo?
**R:** 
```bash
# Editar seeds em backend/src/modules/products/seeds/products.seed.ts
# Rodar:
npm run typeorm:seed
```

### P: Como criar um novo módulo no backend?
**R:** 
```bash
cd backend
nest generate module modules/novo-modulo
nest generate controller modules/novo-modulo
nest generate service modules/novo-modulo
```

### P: Posso usar variáveis de ambiente diferentes por ambiente?
**R:** Sim! Use `.env.local` (dev), `.env.production` (prod)

### P: Como resetar o banco de dados?
**R:**
```bash
# Com Docker
docker-compose down -v
docker-compose up -d

# Local
# Deletar tmp/ e reiniciar serviços
```

### P: Onde obtenho uma chave OPENAI_API_KEY?
**R:** Acesse https://platform.openai.com/api-keys e crie uma nova chave

### P: Qual é o limite de requisições para a IA?
**R:** Depende do seu plano OpenAI. Configure rate limiting em backend se necessário.

---

## 📞 Suporte

### Recursos

- **Documentação Técnica:** `docs/ARQUITETURA_PROJETO.md`
- **Plano de Desenvolvimento:** `docs/PLANO_DESENVOLVIMENTO.md`
- **Estrutura de Pastas:** `docs/ESTRUTURA_PASTAS.md`
- **Docs AGNO:** `docs/AGNO/` (existentes)

### Contato

Para issues, dúvidas ou sugestões:

1. Consulte este README
2. Leia a documentação em `docs/`
3. Crie uma issue no GitHub

---

## 📝 Changelog

### v1.0 (Fevereiro 2026)
- ✅ Setup inicial com Docker Compose
- ✅ Frontend com catálogo
- ✅ Backend com API REST
- ✅ Chat básico
- 🔄 IA AGNO (em progresso)
- 🔄 CRM Kanban (em progresso)
- 🔄 WhatsApp Integration (em progresso)

---

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

---

## 👥 Contribuidores

- Frontend: Next.js + React
- Backend: NestJS + MongoDB
- IA: AGNO + OpenAI
- Infraestrutura: Docker

---

## 🎯 Próximos Passos

1. **Leia** `ARQUITETURA_PROJETO.md` para entender a arquitetura
2. **Consulte** `PLANO_DESENVOLVIMENTO.md` para começar o desenvolvimento
3. **Use** `ESTRUTURA_PASTAS.md` como referência durante codificação
4. **Execute** os comandos deste README para rodar localmente

---

**Boa sorte com o desenvolvimento! 🚀**

Última atualização: Fevereiro 2026  
Versão: 1.0
