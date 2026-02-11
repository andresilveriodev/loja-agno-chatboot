# 🚀 GUIA RÁPIDO DE REFERÊNCIA

**Acesso rápido aos documentos e comandos principais**

---

## 📚 Documentos Criados

| Documento | Tamanho | Tempo de Leitura | Propósito |
|-----------|---------|-----------------|-----------|
| **RESUMO_EXECUTIVO.md** | 20 KB | 5-10 min | Visão geral, cronograma, próximos passos |
| **ARQUITETURA_PROJETO.md** | 150 KB | 30-45 min | Stack técnico, componentes, integração |
| **ESTRUTURA_PASTAS.md** | 80 KB | 15-20 min | Organização de código, convenções |
| **PLANO_DESENVOLVIMENTO.md** | 200 KB | 5 min + executar | Checklist sequencial de tarefas |
| **README.md** | 120 KB | 20-30 min | Setup, troubleshooting, comandos |
| **PRODUTOS_CATALOGO.json** | 15 KB | - | 30 produtos em JSON para importação |
| **GUIA_RÁPIDO.md** | Este arquivo | 3-5 min | Referência rápida |

---

## 🎯 Para Começar AGORA

### 1. Preparar Ambiente (5 min)

```bash
# Verificar pré-requisitos
docker --version        # ✅ Docker 4.0+
node --version         # ✅ Node 20+
npm --version          # ✅ npm 10+
git --version          # ✅ Git

# Clonar e configurar
git clone <repo-url>
cd loja-multidepartamental
cp .env.example .env
# EDITAR .env com suas credenciais
```

### 2. Rodar com Docker (30 seg)

```bash
docker-compose up -d
# Aguardar ~30 segundos

# Acessar
# Frontend: http://localhost:3002
# Backend: http://localhost:3001
```

### 3. Ler Documentação (1 hora)

```
1. RESUMO_EXECUTIVO.md (5 min)
   └─ Entender visão geral

2. ARQUITETURA_PROJETO.md (30 min)
   └─ Entender stack e componentes

3. README.md (15 min)
   └─ Setup detalhado

4. PLANO_DESENVOLVIMENTO.md (10 min + começar)
   └─ Começar tarefas
```

### 4. Começar Desenvolvimento

```bash
# Fase 0: Setup (1-2 dias)
# ✅ Já feito com Docker

# Fase 1: Frontend - Catálogo (3-4 dias)
cd frontend
npm install
npm run dev
# Seguir PLANO_DESENVOLVIMENTO.md seção 1.1-1.10
```

---

## 🔑 Conceitos-Chave em 60 Segundos

```
🖥️ Frontend (Next.js)
├─ Catálogo: 30 produtos em 9 categorias
├─ Chat flutuante: botão verde canto inferior direito
├─ Filtros: por categoria (sidebar/modal)
└─ Responsivo: mobile-first

🔧 Backend (NestJS)
├─ REST API: /api/products, /api/chat, /api/leads
├─ WebSocket: chat real-time
├─ MongoDB: produtos, leads, mensagens
└─ Redis: cache e sessões

🤖 IA (AGNO)
├─ Qualificador: identifica necessidade do cliente
├─ Vendedor: recomenda produtos
├─ Memory: lembra do usuário
├─ Storage: histórico de conversas
└─ Knowledge Base: documentos e FAQ

📊 CRM
├─ Kanban: 7 estágios de funil
├─ Leads: com histórico completo
├─ Timeline: mensagens sincronizadas
└─ Agendamentos: call, visita, retorno

📱 WhatsApp
├─ Evolution API: integração WhatsApp
├─ Webhook: recebe mensagens
├─ Sincronização: com CRM
└─ Omnichannel: web + WhatsApp mesmo contexto
```

---

## ⚡ Comandos Principais

### Frontend

```bash
cd frontend

# Setup
npm install
npm run dev              # Desenvolvimento

# Build
npm run build           # Produção
npm start              # Rodar build

# Qualidade
npm run lint           # ESLint
npm run format         # Prettier
npm run test           # Jest
```

### Backend

```bash
cd backend

# Setup
npm install
npm run start:dev      # Desenvolvimento

# Build
npm run build          # Compilar

# Testes
npm run test           # Jest
npm run test:e2e       # End-to-end

# Qualidade
npm run lint           # ESLint
npm run format         # Prettier
```

### Docker

```bash
# Iniciar
docker-compose up -d

# Ver status
docker-compose ps
docker-compose logs -f

# Parar
docker-compose down

# Limpar (⚠️ apaga dados!)
docker-compose down -v
```

---

## 📋 Checklist de Tarefas por Fase

### ✅ Fase 0: Setup (Concluída)
- [x] Docker configurado
- [x] Variáveis de ambiente
- [x] Estrutura de pastas
- [x] Documentação pronta

### 📌 Fase 1: Frontend - Catálogo
- [ ] Next.js project criado
- [ ] Layout global
- [ ] Grid de produtos
- [ ] Filtros funcionando
- [ ] Performance otimizada

### ✅ Fase 2: Backend - API (concluída)
- [x] NestJS project criado
- [x] MongoDB conectado
- [x] Endpoints de produtos
- [x] 30 produtos no banco (seed)
- [x] Frontend consumindo API (React Query)

### ✅ Fase 3: Frontend - Chat (concluída)
- [x] Chat button flutuante
- [x] Chat window abre/fecha
- [x] Mensagens trocadas (Socket.IO)
- [x] Socket.IO integrado (backend ChatGateway + frontend useChat)
- [x] UX do chat funcional

### 📌 Fase 4: IA - AGNO
- [x] AGNO instalado (services/ai-service com agno + FastAPI)
- [x] Agentes criados (Assistente de Vendas em agent.py)
- [x] Memory + Storage (SqliteDb + Memory/SqliteMemoryDb)
- [x] Tools integradas (get_products_by_category, get_product_details)
- [x] Respostas inteligentes (backend chama ai-service; ver Construindo a Fase 4 abaixo)

---

## 🔨 Construindo a Fase 4 (IA - AGNO)

Siga esta ordem para implementar a Fase 4. Cada subseção corresponde a uma parte do PLANO e da ARQUITETURA.

### 4.1 Setup AGNO (ai-service)

| Tarefa | Onde | Comando / Arquivo |
|--------|------|-------------------|
| Criar projeto Python do serviço de IA | `services/ai-service/` | Ver estrutura abaixo |
| Instalar AGNO e dependências | `services/ai-service/` | `uv sync` ou `pip install agno openai fastapi uvicorn python-dotenv httpx` |
| Configurar OpenAI API Key | `.env` do ai-service | `OPENAI_API_KEY=sk-...` |
| Configurar URL do Backend | `.env` do ai-service | `BACKEND_URL=http://localhost:3001` (para as tools chamarem produtos) |

**Estrutura sugerida:**
```
services/ai-service/
├── pyproject.toml ou requirements.txt
├── .env.example
├── main.py              # FastAPI app + POST /chat
├── agent.py             # Agente AGNO (Storage + Memory + Tools)
└── tools.py             # get_products_by_category, get_product_details (HTTP ao backend)
```

### 4.2 Agente de Qualificação + Vendas

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| Prompt do agente | `agent.py` | Identificar necessidade, categoria, urgência, budget; resposta consultiva |
| Intent + Categoria | Resposta do agente | Estrutura opcional no JSON de resposta (para futuro CRM) |

**Prompt base (em `agent.py`):**
```
Você é um assistente de vendas que qualifica clientes.
Analise a mensagem e identifique: necessidade principal, categoria de produto, urgência, budget estimado.
Responda de forma consultiva. Use as ferramentas para buscar produtos quando o cliente pedir.
```

### 4.3 Memory + Storage

| Tarefa | Onde | Descrição |
|--------|------|-----------|
| SqliteDb | `agent.py` | Histórico de sessão (`add_history_to_context`, `num_history_runs`) |
| Memory + SqliteMemoryDb | `agent.py` | Lembrar do usuário entre sessões (`enable_agentic_memory`, `enable_user_memories`) |
| ChromaDB/RAG | Opcional nesta fase | Pode ser adicionado na Fase 4.6 (Knowledge Base) |

Consulte: `docs/GUIA_RAPIDO_TEMPLATES_AGNO.md` (Template 4 = Storage + Memória).

### 4.4 Tools integradas

| Tool | Função | Chamada |
|------|--------|---------|
| `get_products_by_category(category)` | Listar produtos por categoria | `GET {BACKEND_URL}/api/products?category=...` |
| `get_product_details(product_id)` | Detalhes de um produto | `GET {BACKEND_URL}/api/products/:id` |

Implementar em `tools.py` como funções Python com docstring; passar em `Agent(tools=[...])`. O agente usará para recomendar produtos.

### 4.5 Backend (NestJS) – Integração

| Tarefa | Arquivo | Descrição |
|--------|---------|-----------|
| Módulo AI | `backend/src/modules/ai/` | AiModule, AiService, AiController (opcional) |
| AiService | `ai.service.ts` | Cliente HTTP: `POST {AI_SERVICE_URL}/chat` com `message`, `sessionId`, `userId` |
| ChatGateway | `chat.gateway.ts` | Em `handleMessage`: chamar AiService; se falhar, manter resposta de fallback |
| Variável de ambiente | `backend/.env` | `AI_SERVICE_URL=http://localhost:8000` (ou onde o ai-service sobe) |

**Contrato esperado do ai-service:**
```json
POST /chat
Body: { "message": "...", "sessionId": "...", "userId": "..." }
Response: { "reply": "texto da resposta do agente" }
```

### 4.6 Knowledge Base (opcional nesta fase)

- Documentar produtos (specs, casos de uso) em `docs/` ou JSON.
- Integrar RAG (ChromaDB + Knowledge) no agente depois que 4.1–4.5 estiverem estáveis.

---

**Ordem prática:** 4.1 → 4.4 (tools) → 4.2 (prompt) → 4.3 (storage+memory) → 4.5 (backend) → 4.6 quando quiser.

**Referência:** `ARQUITETURA_PROJETO.md` (Fase 4), `docs/AGNO/*.md`, `PLANO_DESENVOLVIMENTO.md` (Fase 4).

**Como rodar a Fase 4 (chat com IA):**
1. Backend e MongoDB rodando (`cd backend && npm run start:dev`).
2. Em outro terminal: `cd services/ai-service`, criar `.env` (OPENAI_API_KEY, BACKEND_URL=http://localhost:3001), `pip install -r requirements.txt`, `python main.py`.
3. No backend, definir `AI_SERVICE_URL=http://localhost:8000` no `.env`.
4. Frontend: abrir o chat e enviar mensagens; as respostas vêm do agente AGNO.

---

### 📌 Fase 5: CRM - Kanban
- [ ] Entities criadas
- [ ] Kanban UI
- [ ] Drag-and-drop
- [ ] Lead details modal
- [ ] Agendamentos

### 📌 Fase 6: WhatsApp
- [x] Evolution API no Docker (evolution-api + evolution-postgres)
- [x] Módulo WhatsApp no backend (webhook + envio via Evolution)
- [x] Webhook `POST /api/whatsapp/webhook` e status `GET /api/whatsapp/status`
- [ ] Conectar instância (QR Code) e configurar webhook na Evolution
- [ ] Mensagens trocadas (testar envio/recebimento)
- [ ] Sincronização com CRM (quando Fase 5 estiver pronta)
- [ ] Omnichannel (mesmo sessionId/contexto web + WhatsApp)

---

## 🔨 Construindo a Fase 6 (WhatsApp)

### 6.1 Subir Evolution API

```bash
# No .env da raiz (ou do backend), defina se quiser chave própria:
# EVOLUTION_API_KEY=sua-chave-segura

docker-compose up -d
# Sobe: mongo, redis, evolution-postgres, evolution-api (porta 8081)
```

### 6.2 Criar instância e conectar WhatsApp

1. Acesse a Evolution API (Manager ou API direta):
   - **Evolution Manager:** se usar o frontend oficial, acesse a URL do Manager (ver docs da Evolution).
   - **API:** criar instância: `POST http://localhost:8081/instance/create` (body: `{"instanceName": "loja"}`). Ver [Evolution API Docs](https://doc.evolution-api.com).
2. Conectar WhatsApp: `GET http://localhost:8081/instance/connect/loja` (ou pelo Manager) e escanear o QR Code com o celular.

### 6.3 Configurar webhook no backend

No backend `.env`:

```env
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_API_KEY=change-me
EVOLUTION_INSTANCE_NAME=loja
```

Na Evolution, configure o webhook para receber mensagens:

- **URL:** `http://host.docker.internal:3001/api/whatsapp/webhook` (Windows/Mac com backend rodando no host)
- **Evento:** `messages.upsert`

Se o backend também rodar em Docker, use a URL interna do serviço (ex: `http://backend:3001/api/whatsapp/webhook`).

### 6.4 Testar

1. Backend: `cd backend && npm run start:dev`
2. Envie uma mensagem para o número conectado no WhatsApp.
3. O webhook será chamado, o AGNO responderá e a resposta será enviada via Evolution.

**Endpoints:**

- `GET /api/whatsapp/status` — retorna `{ configured: true/false }`
- `POST /api/whatsapp/webhook` — chamado pela Evolution (não usar manualmente além de testes)

**Referência:** `docs/CONFIGURAR_WEBHOOK_EVOLUTION.md`, `docs/GUIA_INTEGRACAO_AGNO Wahtsapp Service.md`, `docs/TROUBLESHOOTING_EVOLUTION_API_KEY.md` (erros de API Key e porta), `ARQUITETURA_PROJETO.md` (Integração WhatsApp).

---

### 📌 Fase 7: Refinamento
- [ ] Testes completos
- [ ] Performance 80+
- [ ] Documentação
- [ ] Docker production-ready
- [ ] Deploy

---

## 🎯 Onde Encontrar Informações

| Pergunta | Resposta em |
|----------|-----------|
| "Por onde começo?" | RESUMO_EXECUTIVO.md |
| "Como é a arquitetura?" | ARQUITETURA_PROJETO.md |
| "Qual é a estrutura?" | ESTRUTURA_PASTAS.md |
| "Que tarefas fazer?" | PLANO_DESENVOLVIMENTO.md |
| "Como setup?" | README.md |
| "Qual é o comando X?" | README.md > Comandos Úteis |
| "Deu erro, como fixo?" | README.md > Troubleshooting |
| "Erro Evolution API Key / porta 8080?" | docs/TROUBLESHOOTING_EVOLUTION_API_KEY.md |
| "Qual é o produto Y?" | PRODUTOS_CATALOGO.json |
| "Preciso de mais detalhes" | docs/AGNO/*.md |

---

## 🔗 Links Importantes

### Recursos Externos
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [AGNO Docs](https://docs.agno.ai)
- [Evolution API Docs](https://evolution-api.readme.io)

### Pastas do Projeto
- Frontend: `./frontend`
- Backend: `./backend`
- Serviços: `./services`
- Documentação: `./docs`
- Produtos: `./PRODUTOS_CATALOGO.json`

---

## ⚙️ Configurações Importantes

### .env (Copia de .env.example)

```env
# Frontend (acessa backend em :3001)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=mongodb://localhost:27017/loja-db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-proj-xxxxx        # Sua chave aqui!

# Evolution (WhatsApp)
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=xxxxx             # Sua chave aqui!

# AI Service
AGNO_API_KEY=xxxxx                  # Sua chave aqui!
AGNO_MODEL=gpt-4
```

---

## 📊 Stack Resumido

```
Frontend
├─ Next.js 15
├─ React 18
├─ TypeScript
├─ Tailwind CSS
├─ Shadcn UI
├─ Zustand
├─ Socket.IO Client
└─ React Query

Backend
├─ NestJS 10
├─ TypeScript
├─ MongoDB (Mongoose)
├─ Redis
├─ Socket.IO Server
├─ Bull (filas)
├─ Jest (testes)
└─ AGNO (IA)

AI
├─ AGNO Framework
├─ OpenAI API (GPT-4)
├─ Memory + Storage
├─ ChromaDB (RAG)
└─ Knowledge Base

DevOps
├─ Docker
├─ Docker Compose
├─ MongoDB Container
├─ Redis Container
├─ Evolution API Container
└─ AI Service Container
```

---

## 🚦 Status do Projeto

```
✅ Planejamento: 100%
   ├─ Arquitetura definida
   ├─ Documentação completa
   ├─ Stack decidido
   ├─ Estrutura organizada
   └─ Checklist pronto

⏳ Desenvolvimento: Fases 0–4 concluídas
   ├─ Fase 0: Setup ✅
   ├─ Fase 1: Frontend Catálogo ✅
   ├─ Fase 2: Backend API ✅
   ├─ Fase 3: Chat (WebSocket) ✅
   ├─ Fase 4: IA - AGNO ✅ (ver seção Construindo a Fase 4)
   ├─ Fase 5-7: (por fazer)
   └─ Próximo: Fase 5 (CRM - Kanban)

📈 KPIs para Acompanhar
   ├─ Chat conversion: >30%
   ├─ Lead qualification: <2 min
   ├─ Response time: <5 seg
   ├─ Mobile conversion: >40%
   ├─ Customer satisfaction: >4.5/5
   └─ Performance score: >80
```

---

## 💡 Dicas Importantes

### ✅ Do's

✅ Leia a documentação sequencialmente
✅ Siga o PLANO_DESENVOLVIMENTO.md
✅ Teste localmente antes de integrar
✅ Commit após cada tarefa completada
✅ Consulte docs/AGNO/ para IA
✅ Use .env.example como template
✅ Dockerize quando possível

### ❌ Don'ts

❌ Não faça todas as fases ao mesmo tempo
❌ Não skip a documentação
❌ Não comite .env files
❌ Não ignore erros de validação
❌ Não deixe TODOs sem resolver
❌ Não mude estrutura de pastas arbitrariamente
❌ Não sobreescreva .env sem confirmar

---

## 🆘 Quando Tiver Dúvidas

1. **Verificar documentação:**
   ```
   README.md > FAQ
   PLANO_DESENVOLVIMENTO.md > Fase X
   ARQUITETURA_PROJETO.md > Seção Y
   ```

2. **Procurar erro:**
   ```
   README.md > Troubleshooting
   Backend logs: docker-compose logs backend
   Frontend console: F12 Developer Tools
   ```

3. **Consultar referência:**
   ```
   docs/endpoints/
   PRODUTOS_CATALOGO.json
   docs/AGNO/
   ```

4. **Ainda não achou?**
   ```
   Leia todos os .md files em docs/
   Procure em docs/AGNO/
   Consulte externos (links acima)
   ```

---

## 🎓 Ordem de Aprendizado Recomendada

```
Dia 1: Compreensão
├─ RESUMO_EXECUTIVO.md (5 min)
├─ ARQUITETURA_PROJETO.md (30 min)
└─ README.md (20 min)
Total: ~1 hora

Dia 2-3: Preparação
├─ ESTRUTURA_PASTAS.md (15 min)
├─ Setup local (1-2 horas)
├─ Testar Docker (30 min)
└─ Familiarizar com repos

Dia 4+: Desenvolvimento
├─ PLANO_DESENVOLVIMENTO.md (5 min)
├─ Começar Fase 1 (Frontend)
├─ Seguir checklist
└─ Ir abrindo docs conforme necessário
```

---

## 🏁 Próximos Passos Imediatos

### Nos Próximos 5 Minutos:
1. Feche este arquivo
2. Abra RESUMO_EXECUTIVO.md
3. Leia até "Como Começar"

### Nos Próximos 30 Minutos:
1. Leia ARQUITETURA_PROJETO.md (visão geral)
2. Verifique Docker instalado
3. Copie `.env.example` para `.env`

### Nas Próximas 2 Horas:
1. Leia README.md (setup)
2. Rode `docker-compose up -d`
3. Acesse http://localhost:3002
4. Verifique se tudo funciona

### Neste Primeiro Dia:
1. Leia toda documentação
2. Familiarize-se com estrutura
3. Configure ambiente
4. Tente rodar containers

### Começar a Codificar:
1. Abra PLANO_DESENVOLVIMENTO.md
2. Comece pela **Fase 1** (Frontend)
3. Siga checklist sequencialmente
4. Commit após cada tarefa

---

## 📞 Sumário Executivo

| Aspecto | Status |
|--------|--------|
| Planejamento | ✅ Completo |
| Documentação | ✅ Completa |
| Stack Definido | ✅ Sim |
| Estrutura Pronta | ✅ Sim |
| Produtos Definidos | ✅ 30 produtos |
| Próximo Passo | 🚀 Fase 5 (CRM - Kanban) |
| Duração Estimada | 🕐 25-33 dias |
| Complexidade | 📊 Media-Alta |
| Recomendação | 👍 Começar hoje! |

---

## 🎉 Você Está Pronto!

Você tem:
- ✅ Documentação completa
- ✅ Arquitetura definida
- ✅ Estrutura organizada
- ✅ Checklist pronto
- ✅ Produtos definidos
- ✅ Stack decidido

**Agora é só começar! 🚀**

---

**Última atualização:** Fevereiro 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Usar

```
┌──────────────────────────────────────────┐
│                                          │
│  🎯 Próximo Passo:                       │
│                                          │
│  1. Abra RESUMO_EXECUTIVO.md             │
│  2. Leia até "Como Começar"              │
│  3. Configure Docker                     │
│  4. Rode docker-compose up -d            │
│  5. Comece Fase 0!                       │
│                                          │
│  Boa sorte! 🚀                           │
│                                          │
└──────────────────────────────────────────┘
```
