# 🏗️ ARQUITETURA - Loja Multidepartamental com Agente IA

**Status:** Planejamento Completo  
**Data:** Fevereiro 2026  
**Versão:** 1.0

---

## 📋 ÍNDICE RÁPIDO

1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Estrutura de Pastas](#-estrutura-de-pastas)
4. [Componentes Principais](#-componentes-principais)
5. [Plano de Desenvolvimento](#-plano-de-desenvolvimento-fase-por-fase)
6. [Cronograma](#-cronograma)
7. [Banco de Dados](#-banco-de-dados)
8. [Integração AI (AGNO)](#-integração-ai-agno)
9. [CRM Kanban](#-crm-kanban)
10. [Integração WhatsApp](#-integração-whatsapp)

---

## 🎯 Visão Geral do Projeto

### Objetivo Principal
Criar um sistema completo de e-commerce consultivo com:
- **Frontend:** Catálogo de produtos multidepartamental com chat flutuante
- **Backend:** API com agente IA que qualifica leads e integra CRM
- **CRM:** Kanban com funil de vendas e histórico de conversas
- **Integração:** WhatsApp + Web Chat com o mesmo agente IA

### Fluxo Principal do Usuário

```
1. Usuário acessa site → Vê catálogo de produtos
2. Clica em chat flutuante → Conversa com IA
3. IA qualifica interesse e detecta intenção
4. Lead é criado automaticamente no CRM
5. Conversas são sincronizadas no CRM
6. Agente pode enviar follow-up via WhatsApp
7. Vendedor acompanha no CRM e negocia
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15+ (App Router)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS + Shadcn UI + Radix
- **Chat Flutuante:** React + Zustand (estado)
- **Requisições:** React Query (tanStack Query)
- **Validação:** Zod + React Hook Form

### Backend
- **Runtime:** Node.js 20+
- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Banco Dados:** MongoDB (Mongoose)
- **Cache:** Redis
- **Fila:** Bull/BullMQ
- **AI:** AGNO Framework + OpenAI API

### Serviços
- **WhatsApp:** Evolution API (Docker)
- **IA:** AGNO + CustomKnowledge Base
- **Vector DB:** ChromaDB (para RAG)

### Infra
- **Containerização:** Docker + Docker Compose
- **Orquestração:** Docker Compose
- **Variáveis:** .env por ambiente

---

## 📁 Estrutura de Pastas

```
loja-multidepartamental/
│
├── frontend/                           # 🖥️ FRONTEND NEXT.JS
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Página principal (catálogo)
│   │   ├── api/
│   │   │   ├── chat/route.ts          # API de chat
│   │   │   └── products/route.ts      # API de produtos
│   │   ├── components/
│   │   │   ├── CatalogGrid.tsx        # Grade de produtos
│   │   │   ├── CategoryFilter.tsx     # Filtro por categoria
│   │   │   ├── ProductCard.tsx        # Card do produto
│   │   │   ├── ChatWidget/
│   │   │   │   ├── ChatButton.tsx     # Botão flutuante
│   │   │   │   ├── ChatWindow.tsx     # Janela do chat
│   │   │   │   └── MessageList.tsx    # Lista de mensagens
│   │   │   ├── Hero.tsx               # Seção hero do site
│   │   │   ├── Banners.tsx            # Seções promocionais
│   │   │   └── Footer.tsx             # Rodapé
│   │   ├── hooks/
│   │   │   ├── useChat.ts             # Hook para chat
│   │   │   └── useProducts.ts         # Hook para produtos
│   │   ├── lib/
│   │   │   ├── api.ts                 # Instância API
│   │   │   ├── constants.ts           # Constantes
│   │   │   └── types.ts               # Types compartilhados
│   │   └── store/
│   │       ├── chatStore.ts           # Zustand store
│   │       └── productStore.ts        # Store de produtos
│   ├── public/
│   │   ├── images/                    # Imagens otimizadas
│   │   └── icons/
│   ├── .env.local                     # Vars locais
│   ├── .env.production                # Vars produção
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                            # 🔧 BACKEND NESTJS
│   ├── src/
│   │   ├── main.ts                    # Entry point
│   │   ├── app.module.ts              # Módulo root
│   │   │
│   │   ├── common/                    # Código compartilhado
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── decorators/
│   │   │   ├── interceptors/
│   │   │   └── exceptions/
│   │   │       └── app-error.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── chat/                  # Módulo de chat
│   │   │   │   ├── chat.controller.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── chat.gateway.ts    # WebSocket
│   │   │   │   ├── models/
│   │   │   │   │   ├── chat.entity.ts
│   │   │   │   │   └── message.entity.ts
│   │   │   │   └── chat.module.ts
│   │   │   │
│   │   │   ├── products/              # Módulo de produtos
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   ├── product.entity.ts
│   │   │   │   │   └── category.entity.ts
│   │   │   │   └── products.module.ts
│   │   │   │
│   │   │   ├── leads/                 # Módulo de leads (CRM)
│   │   │   │   ├── leads.controller.ts
│   │   │   │   ├── leads.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   ├── lead.entity.ts
│   │   │   │   │   ├── stage.enum.ts  # Kanban stages
│   │   │   │   │   └── lead.dto.ts
│   │   │   │   └── leads.module.ts
│   │   │   │
│   │   │   ├── crm/                   # Módulo CRM
│   │   │   │   ├── crm.controller.ts
│   │   │   │   ├── crm.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   ├── kanban-stage.entity.ts
│   │   │   │   │   ├── activity.entity.ts
│   │   │   │   │   └── scheduling.entity.ts
│   │   │   │   └── crm.module.ts
│   │   │   │
│   │   │   └── ai/                    # Módulo IA (AGNO)
│   │   │       ├── ai.service.ts      # Serviço principal IA
│   │   │       ├── ai.controller.ts
│   │   │       ├── agents/
│   │   │       │   ├── sales-agent.ts # Agente de vendas
│   │   │       │   ├── qualifier-agent.ts # Qualificador
│   │   │       │   └── support-agent.ts # Suporte
│   │   │       ├── knowledge/
│   │   │       │   ├── product-knowledge.ts
│   │   │       │   └── company-knowledge.ts
│   │   │       ├── tools/
│   │   │       │   ├── crm-tools.ts   # Integração com CRM
│   │   │       │   ├── product-tools.ts
│   │   │       │   ├── whatsapp-tools.ts
│   │   │       │   └── scheduling-tools.ts
│   │   │       └── ai.module.ts
│   │   │
│   │   ├── services/                  # Serviços auxiliares
│   │   │   ├── whatsapp-service/
│   │   │   │   ├── evolution.service.ts
│   │   │   │   ├── whatsapp.service.ts
│   │   │   │   └── whatsapp.module.ts
│   │   │   ├── storage-service/
│   │   │   │   ├── storage.service.ts
│   │   │   │   └── storage.module.ts
│   │   │   └── notification-service/
│   │   │       ├── notification.service.ts
│   │   │       └── notification.module.ts
│   │   │
│   │   ├── database/                  # Configuração DB
│   │   │   ├── mongodb.config.ts
│   │   │   └── database.module.ts
│   │   │
│   │   └── config/
│   │       ├── env.ts
│   │       ├── app.config.ts
│   │       └── database.config.ts
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── .env.example
│   ├── .env.local
│   ├── .env.production
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── package.json
│
├── services/                           # 🐳 SERVIÇOS DOCKERIZADOS
│   ├── evolution-api/
│   │   ├── docker-compose.yml
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── ai-service/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── agno-setup/
│   │       ├── setup_agno.py
│   │       └── knowledge_base/
│   │
│   └── mongodb/
│       ├── docker-compose.yml
│       └── init-scripts/
│
├── docs/                               # 📚 DOCUMENTAÇÃO
│   ├── AGNO/                          # Docs AGNO existentes
│   ├── API.md                         # Documentação API
│   ├── DATABASE.md                    # Schema DB
│   ├── SETUP.md                       # Configuração inicial
│   └── DEPLOYMENT.md                  # Deploy
│
├── docker-compose.yml                 # 🐳 ORQUESTRAÇÃO PRINCIPAL
├── .env.example                       # Template variáveis
├── .gitignore
└── README.md
```

---

## 🧩 Componentes Principais

### 1. Frontend - Catálogo + Chat Flutuante

**Principais Features:**
- ✅ Página única (SPA) com catálogo
- ✅ Grid responsivo de produtos
- ✅ Filtros por categoria (6 categorias)
- ✅ Botão flutuante (canto inferior direito)
- ✅ Chat widget com histórico
- ✅ Banners promocionais animados
- ✅ Otimização de imagens (WebP)

**Produtos por Categoria:**

| Categoria | Qtd | Exemplo |
|-----------|-----|---------|
| Ferramentas & Máquinas | 6 | Furadeira R$ 489 |
| Energia & Infraestrutura | 4 | Gerador R$ 3.980 |
| Jardinagem & Áreas Externas | 2 | Cortador de Grama R$ 1.980 |
| Climatização & Refrigeração | 3 | Ar-Cond R$ 3.200 |
| Cozinha Industrial | 3 | Fogão Industrial R$ 2.350 |
| Segurança do Trabalho (EPIs) | 4 | Kit EPI R$ 289 |
| Materiais Industriais | 3 | Parafusos R$ 210 |
| Armazenagem & Logística | 3 | Estante R$ 890 |
| Automação & Controle | 2 | Sensor R$ 129 |
| **TOTAL** | **30** | - |

### 2. Backend - API + IA + CRM

**Principais Funcionalidades:**

```
Backend (NestJS + TypeScript)
├── REST API (Express)
├── WebSocket (Chat Real-time)
├── Módulo IA (AGNO)
│   ├── Agente de Qualificação
│   ├── Agente de Vendas
│   └── Histórico com Memory + Storage
├── CRM Kanban
│   ├── Funil de Vendas (7 estágios)
│   ├── Timeline de Mensagens
│   └── Agendamento
├── Integração WhatsApp
│   ├── Webhook Evolution API
│   └── Envio de Mensagens
└── Banco de Dados (MongoDB)
    ├── Leads
    ├── Mensagens
    ├── Produtos
    └── Agendamentos
```

### 3. CRM Kanban - Funil de Vendas

**7 Estágios do Funil:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Novo Lead      │ 2. Qualificado │ 3. Produtos    │
│ (Entrada)         │ (Pela IA)      │ (Apresentados) │
├─────────────────────────────────────────────────────────┤
│ 4. Cotação        │ 5. Negociação  │ 6. Fechado     │
│ (Enviada)         │ (Em progresso) │ (Ganho)        │
├──────────────────────────────────────────────────────────┤
│ 7. Perdido                                               │
│ (Motivo do funil)                                        │
└──────────────────────────────────────────────────────────┘
```

**Informações do Lead:**
- Nome + Telefone
- Empresa (opcional)
- Intenção detectada pela IA
- Produtos de interesse
- Valor estimado da oportunidade
- Estágio no funil
- Histórico completo da conversa
- Agendamentos (call, visita, retorno)

### 4. Integração AGNO - IA Conversacional

**Agentes Disponíveis:**

```python
# Agente de Qualificação
├── Objetivo: Identificar necessidade do cliente
├── Entrada: Primeira mensagem do chat
├── Saída: Intent + Categoria de Produto
└── Ação: Criar Lead no CRM

# Agente de Vendas
├── Objetivo: Apresentar produtos relevantes
├── Entrada: Necessidade identificada
├── Ferramentas:
│   ├── get_products_by_category()
│   ├── get_product_details()
│   └── create_lead_in_crm()
└── Ação: Gerar resposta consultiva

# Agente de Suporte
├── Objetivo: Responder perguntas técnicas
├── Entrada: Dúvidas do cliente
├── Knowledge Base: Docs + FAQ
└── Integração: Histórico de chat
```

**Memory + Storage (AGNO):**

```typescript
// Cada conversa terá:
interface ConversationMemory {
  sessionId: string;
  userId: string;
  
  // Storage (histórico)
  messages: Message[];
  conversationHistory: string;
  
  // Memory (contexto do usuário)
  userProfile: {
    name: string;
    company: string;
    interests: string[];
    intent: string;
  };
  
  // RAG (knowledge base)
  knowledgeContext: string;
  
  // Lead (integração CRM)
  leadId: string;
  leadStage: string;
}
```

### 5. WhatsApp Integration

**Fluxo:**
```
Usuário envia msg WhatsApp
    ↓
Evolution API webhook
    ↓
Backend recebe evento
    ↓
AGNO processa mensagem
    ↓
Resposta enviada via WhatsApp
    ↓
Conversa sincronizada no CRM
    ↓
Lead atualizado com histórico
```

---

## 📅 Plano de Desenvolvimento - Fase por Fase

### ⏸️ PRÉ-DESENVOLVIMENTO

#### Fase 0: Setup Inicial (1-2 dias)

**Tarefas:**
- [ ] Clonar repo ou criar estrutura
- [ ] Configurar Docker Compose
- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências (npm, uv, etc)
- [ ] Configurar MongoDB localmente
- [ ] Teste de conectividade

**Checklist:**
```bash
# Verificar ambiente
docker --version                    # Docker rodando?
node --version                      # Node 20+?
npm --version                       # npm 10+?
python --version                    # Python 3.12+?
```

---

### 🎯 FASE 1: FRONTEND - CATÁLOGO + UI (3-4 dias)

**Objetivo:** Interface de usuário com catálogo de produtos

#### 1.1 Setup Next.js Project
- [ ] Criar projeto Next.js 15 com TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Instalar Shadcn UI
- [ ] Configurar ESLint e Prettier
- [ ] Estrutura de pastas conforme arquitetura

**Comando:**
```bash
cd frontend
npm install
npm run dev
```

#### 1.2 Layout e Componentes Base
- [ ] Layout principal (header, footer, main)
- [ ] Responsividade mobile-first
- [ ] Navegação simples
- [ ] Estilos com Tailwind CSS

**Componentes:**
```
Header.tsx
  ├─ Logo + Brand
  ├─ Links de navegação
  └─ Ícones (search, user, etc)

Footer.tsx
  ├─ Informações da empresa
  ├─ Links úteis
  └─ Redes sociais
```

#### 1.3 Grid de Produtos
- [ ] Componente `ProductCard.tsx`
  - Imagem do produto (otimizada)
  - Nome + Descrição curta
  - Preço em destaque
  - Botão "Saber Mais"
  - Ícone de favorito
  
- [ ] Componente `CatalogGrid.tsx`
  - Grid responsivo (1 col mobile, 3+ desktop)
  - Placeholder de carregamento
  - Scroll infinito ou paginação

#### 1.4 Filtros por Categoria
- [ ] Componente `CategoryFilter.tsx`
  - Filtros lateral (desktop) ou modal (mobile)
  - 9 categorias (checkbox)
  - Botão "Limpar filtros"
  - Contador de produtos por categoria
  
- [ ] Estado com Zustand
  ```typescript
  interface ProductStore {
    selectedCategory: string[];
    setCategory: (cat: string) => void;
  }
  ```

#### 1.5 Banners e Seções
- [ ] Seção Hero (topo)
  - Imagem de fundo
  - Texto de boas-vindas
  - CTA "Explorar Catálogo"
  
- [ ] Seções promocionais
  - Banner 50% OFF
  - Banner "Peças em Promoção"
  - Banner "Nova Coleção"
  
- [ ] Animações sutis (Framer Motion ou CSS)

#### 1.6 Mock de Dados
- [ ] Arquivo `lib/constants.ts` com 30 produtos
- [ ] Estrutura:
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  features: string[];
}
```

---

### 🔧 FASE 2: BACKEND - API REST + DB (4-5 dias)

**Objetivo:** API funcional com MongoDB

#### 2.1 Setup NestJS
- [ ] Criar projeto NestJS
- [ ] Configurar TypeScript
- [ ] Estrutura de pastas (modules, services, controllers)
- [ ] Variáveis de ambiente (.env)

#### 2.2 MongoDB + Mongoose
- [ ] Configurar conexão MongoDB
- [ ] Criar schemas:
  - `Product` (nome, preço, categoria, etc)
  - `Category` (nome, ícone, descrição)
  - `Lead` (nome, telefone, empresa, estágio)
  - `Message` (conteúdo, timestamp, sender)

#### 2.3 Módulo de Produtos
- [ ] Controller: `GET /products` (com filtros)
- [ ] Service: Lógica de busca e filtros
- [ ] Endpoint: `GET /products/:id` (detalhes)
- [ ] Seed: Script para popular 30 produtos

**Endpoints:**
```
GET /api/products               # Listar com filtros
GET /api/products/:id           # Detalhes
GET /api/categories             # Categorias
POST /api/products/seed         # Popular DB
```

#### 2.4 Módulo de Chat (Básico)
- [ ] Entity `Chat` e `Message`
- [ ] Controller básico
- [ ] Service de armazenamento de mensagens
- [ ] Endpoint para salvar mensagens

**Endpoints:**
```
POST /api/chat/message          # Enviar mensagem
GET /api/chat/history/:id       # Histórico
```

#### 2.5 WebSocket (Chat Real-time)
- [ ] Gateway Socket.IO
- [ ] Eventos: `connect`, `disconnect`, `message`
- [ ] Broadcasting de mensagens

---

### 💬 FASE 3: FRONTEND - CHAT WIDGET (2-3 dias)

**Objetivo:** Botão flutuante e janela de chat

#### 3.1 Componente Chat Flutuante
- [ ] Botão flutuante (canto inferior direito)
  - Ícone de chat
  - Badge com contador de mensagens
  - Animação ao hover
  
- [ ] Janela de chat
  - Área de mensagens (scroll)
  - Input de mensagem
  - Botão enviar
  - Timestamp nas mensagens
  - Loading indicator

#### 3.2 Integração com Backend
- [ ] Socket.IO client
- [ ] Conexão ao server
- [ ] Envio e recebimento de mensagens
- [ ] Armazenamento local com Zustand

#### 3.3 UX de Chat
- [ ] Mensagens do usuário (lado direito)
- [ ] Mensagens do bot (lado esquerdo)
- [ ] Typing indicator ("está digitando...")
- [ ] Sugestões rápidas (botões de resposta)
- [ ] Avatar do bot

#### 3.4 Responsividade
- [ ] Mobile: Chat em fullscreen/modal
- [ ] Desktop: Widget flutuante no canto
- [ ] Diferentes tamanhos de tela

---

### 🤖 FASE 4: IA - AGNO INTEGRATION (5-6 dias)

**Objetivo:** Integrar AGNO com conversação inteligente

#### 4.1 Setup AGNO
- [ ] Instalar AGNO (`pip install agno`)
- [ ] Configurar OpenAI API Key
- [ ] Criar estrutura de agentes

#### 4.2 Agente de Qualificação
- [ ] Criar `qualifier-agent.ts`
- [ ] Prompt: Identificar necessidade do cliente
- [ ] Output: Intent + Categoria
- [ ] Ação: Criar Lead no CRM

**Prompt Base:**
```
Você é um assistente de vendas que qualifica clientes.
Analise a mensagem e identifique:
1. Necessidade principal
2. Categoria de produto
3. Urgência
4. Budget estimado

Responda de forma consultiva e pergunte mais sobre a necessidade.
```

#### 4.3 Memory + Storage
- [ ] SqliteDb para armazenar histórico
- [ ] Memory para lembrar do usuário
- [ ] ChromaDB para RAG (opcional nesta fase)

#### 4.4 Agente de Vendas
- [ ] Criar `sales-agent.ts`
- [ ] Tools:
  - `get_products_by_category(category)`
  - `get_product_details(id)`
  - `create_lead_in_crm(lead_data)`
  
- [ ] Resposta consultiva com produtos

#### 4.5 Backend Integration
- [ ] Endpoint `/api/ai/chat` (recebe mensagem)
- [ ] Processa com AGNO
- [ ] Retorna resposta + lead data

**Fluxo:**
```
POST /api/ai/chat
{
  "message": "Preciso de furadeira profissional",
  "userId": "user123",
  "sessionId": "session456"
}

Response:
{
  "reply": "Ótimo! Vejo que você precisa de uma furadeira profissional...",
  "leadCreated": true,
  "leadId": "lead789",
  "suggestedProducts": [...]
}
```

#### 4.6 Knowledge Base
- [ ] Documentar todos os 30 produtos
- [ ] Specs técnicos
- [ ] Casos de uso
- [ ] FAQ integrada

---

### 📊 FASE 5: CRM KANBAN (4-5 dias)

**Objetivo:** Interface CRM com funil de vendas

#### 5.1 Backend - CRM Entities
- [ ] Entity `Lead` com stage
- [ ] Entity `Activity` (timeline)
- [ ] Entity `Scheduling` (agendamentos)
- [ ] Schema completo no MongoDB

#### 5.2 Backend - CRM API
- [ ] `GET /api/crm/leads` (com filtros por stage)
- [ ] `PUT /api/crm/leads/:id` (mover no kanban)
- [ ] `GET /api/crm/leads/:id/history` (histórico)
- [ ] `POST /api/crm/schedule` (agendar)

#### 5.3 Frontend - Kanban Board
- [ ] Componente `KanbanBoard.tsx`
- [ ] 7 colunas (stages do funil)
- [ ] Cards arrastáveis (drag & drop)
- [ ] Drag-and-drop com React Beautiful DnD

#### 5.4 Lead Card
- [ ] Informações:
  - Nome + Telefone
  - Empresa
  - Valor estimado
  - Data do último contato
  - Produtos de interesse
  
- [ ] Ações:
  - Abrir detalhes
  - Chamar via WhatsApp
  - Agendar follow-up

#### 5.5 Lead Details Modal
- [ ] Timeline completa da conversa
- [ ] Agendamentos
- [ ] Histórico de interações
- [ ] Notas adicionais
- [ ] Botões de ação

#### 5.6 Filtros e Busca
- [ ] Filtrar por stage
- [ ] Buscar por nome/telefone
- [ ] Filtrar por intenção
- [ ] Filtrar por data

---

### 📱 FASE 6: WHATSAPP INTEGRATION (3-4 dias)

**Objetivo:** Conectar chat web e WhatsApp ao mesmo agente

#### 6.1 Evolution API Setup
- [ ] Docker Compose para Evolution
- [ ] Configuração de ambiente
- [ ] Autenticação QR Code
- [ ] Webhook configuration

#### 6.2 WhatsApp Service
- [ ] Criar `whatsapp.service.ts`
- [ ] Receber mensagens do webhook
- [ ] Enviar mensagens
- [ ] Sincronizar com leads

#### 6.3 Webhook Handler
- [ ] Endpoint `POST /api/webhooks/whatsapp` (padronizado com planejamento CRM)
- [ ] Validar assinatura
- [ ] Processar eventos
- [ ] Chamar AGNO para responder

#### 6.4 Message Synchronization
- [ ] Armazenar origem (web ou whatsapp)
- [ ] Sincronizar no lead
- [ ] Timeline unificada no CRM

#### 6.5 Notifications
- [ ] Notificação quando mensagem chega
- [ ] Badge no CRM
- [ ] Sound notification

---

### 🔄 FASE 7: REFINAMENTO E TESTES (3-4 dias)

**Objetivo:** Polir, testar, otimizar

#### 7.1 Frontend Refinement
- [ ] Performance (lighthouse score 80+)
- [ ] Imagens otimizadas
- [ ] Code splitting
- [ ] Meta tags SEO

#### 7.2 Backend Refinement
- [ ] Error handling robusto
- [ ] Validação de dados (DTOs)
- [ ] Rate limiting
- [ ] Logging

#### 7.3 Testes
- [ ] Testes unitários (Jest)
- [ ] E2E tests (Cypress ou Playwright)
- [ ] Testes de carga
- [ ] Verificar todos os endpoints

#### 7.4 Documentação
- [ ] README completo
- [ ] API docs (Swagger)
- [ ] Setup guide
- [ ] Troubleshooting

#### 7.5 Docker + Deployment
- [ ] Docker images
- [ ] Docker Compose production
- [ ] Environment configs
- [ ] Health checks

---

## 📈 Cronograma

| Fase | Descrição | Duração | Acumulado | Status |
|------|-----------|---------|-----------|--------|
| 0 | Setup Inicial | 1-2 d | 1-2 d | ⏸️ Planejamento |
| 1 | Frontend - Catálogo | 3-4 d | 4-6 d | 📋 Próxima |
| 2 | Backend - API | 4-5 d | 8-11 d | 📋 Depois |
| 3 | Frontend - Chat | 2-3 d | 10-14 d | 📋 Depois |
| 4 | IA - AGNO | 5-6 d | 15-20 d | 📋 Depois |
| 5 | CRM - Kanban | 4-5 d | 19-25 d | 📋 Depois |
| 6 | WhatsApp | 3-4 d | 22-29 d | 📋 Depois |
| 7 | Refinamento | 3-4 d | 25-33 d | 📋 Depois |

**Total Estimado:** 25-33 dias (5-7 semanas)

---

## 🗄️ Banco de Dados

### MongoDB Schema

#### 1. Products
```json
{
  "_id": "ObjectId",
  "name": "String",
  "category": "String",
  "price": "Number",
  "description": "String",
  "image": "String (URL)",
  "specs": "String",
  "features": ["String"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### 2. Categories
```json
{
  "_id": "ObjectId",
  "name": "String",
  "icon": "String",
  "description": "String"
}
```

#### 3. Leads
```json
{
  "_id": "ObjectId",
  "name": "String",
  "phone": "String",
  "company": "String (optional)",
  "email": "String (optional)",
  "intent": "String",
  "productsViewed": ["String (productId)"],
  "estimatedValue": "Number",
  "stage": "String (enum)",
  "source": "String (web, whatsapp)",
  "messages": ["ObjectId (messageId)"],
  "schedules": ["ObjectId (scheduleId)"],
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date",
  "lastInteractionAt": "Date"
}
```

#### 4. Messages
```json
{
  "_id": "ObjectId",
  "leadId": "ObjectId",
  "sessionId": "String",
  "sender": "String (user, bot, agent)",
  "content": "String",
  "type": "String (text, image, file)",
  "source": "String (web, whatsapp)",
  "metadata": "Object",
  "createdAt": "Date"
}
```

#### 5. Schedules
```json
{
  "_id": "ObjectId",
  "leadId": "ObjectId",
  "type": "String (call, visit, callback)",
  "scheduledAt": "Date",
  "title": "String",
  "description": "String",
  "status": "String (pending, completed, cancelled)",
  "createdAt": "Date"
}
```

#### 6. Activities
```json
{
  "_id": "ObjectId",
  "leadId": "ObjectId",
  "type": "String (call, message, update, note)",
  "title": "String",
  "description": "String",
  "createdAt": "Date"
}
```

### Índices Recomendados
```javascript
// Products
db.products.createIndex({ "category": 1 })

// Leads
db.leads.createIndex({ "phone": 1, "unique": true })
db.leads.createIndex({ "stage": 1 })
db.leads.createIndex({ "createdAt": -1 })

// Messages
db.messages.createIndex({ "leadId": 1, "createdAt": -1 })

// Schedules
db.schedules.createIndex({ "leadId": 1 })
db.schedules.createIndex({ "scheduledAt": 1 })
```

---

## 🤖 Integração AI (AGNO)

### Arquitetura AGNO

```
┌─────────────────────────────────────┐
│      Frontend Chat Widget           │
└────────────┬────────────────────────┘
             │ WebSocket
             ▼
┌─────────────────────────────────────┐
│   Backend - Chat Handler API        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│         AGNO Agent System           │
│  ┌──────────────────────────────┐   │
│  │  Memory + Storage            │   │
│  │  • Session history           │   │
│  │  • User preferences          │   │
│  │  • Intent tracking           │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Agentes                     │   │
│  │  • Qualificador              │   │
│  │  • Vendas                    │   │
│  │  • Suporte                   │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Tools (Funções)             │   │
│  │  • get_products()            │   │
│  │  • create_lead()             │   │
│  │  • schedule_call()           │   │
│  │  • send_whatsapp()           │   │
│  └──────────────────────────────┘   │
└────────────┬────────────────────────┘
             │
             ▼
    ┌─────────┴──────────┐
    ▼                    ▼
┌──────────────┐  ┌────────────────┐
│  CRM (Leads) │  │  WhatsApp API  │
│              │  │  (Evolution)   │
└──────────────┘  └────────────────┘
```

### Fluxo de Mensagem

```
1. Usuário envia mensagem no chat
   └─> "Preciso de furadeira profissional"

2. Backend recebe e cria session
   └─> sessionId: "abc123"

3. AGNO Qualificador processa
   ├─ Detecta intent: "Buscar ferramenta"
   ├─ Categoria: "Ferramentas & Máquinas"
   └─ Confiança: 95%

4. AGNO Vendas responde
   ├─ Chama tool: get_products("Ferramentas & Máquinas")
   ├─ Retorna 6 produtos
   └─ Formata resposta consultiva

5. Lead criado/atualizado no CRM
   ├─ Nome: (extraído da conversa)
   ├─ Intent: "Buscar ferramenta"
   ├─ Stage: "Novo Lead"
   └─ Products: ["prod_001", "prod_002"]

6. Resposta enviada ao usuário
   └─ "Ótimo! Vejo que você precisa de uma furadeira...
       Recomendo a Furadeira de Impacto 750W (R$ 489)
       Você gostaria de saber mais?"

7. Histórico salvo no banco
   └─> messages collection
```

### AGNO Implementation

**File: `backend/src/modules/ai/agents/sales-agent.ts`**

```typescript
import { Agent } from "agno";
import { OpenAIProvider } from "agno";
import { SqliteDb } from "agno";
import { Memory } from "agno";
import { SqliteMemoryDb } from "agno";

// Memory + Storage
const db = new SqliteDb(db_file="tmp/conversations.db");
const memory = new Memory(db=SqliteMemoryDb(db_file="tmp/memory.db"));

// Tools
async function getProductsByCategory(category: string) {
  // Busca produtos no MongoDB
}

async function createLeadInCRM(leadData) {
  // Cria lead no CRM
}

async function sendWhatsAppMessage(phone, message) {
  // Envia mensagem via WhatsApp
}

// Agente
export const salesAgent = new Agent(
  name="Sales Agent",
  model=OpenAIProvider(id="gpt-4"),
  tools=[
    getProductsByCategory,
    createLeadInCRM,
    sendWhatsAppMessage,
  ],
  instructions="""
    Você é um agente de vendas consultivo para uma loja de produtos industriais.
    
    Seu trabalho é:
    1. Qualificar os leads compreendendo suas necessidades
    2. Recomendar produtos relevantes
    3. Manter conversas naturais e consultivas
    4. Criar leads no CRM quando apropriado
    5. Agendar chamadas ou enviar cotações
    
    Sempre seja profissional, consultivo e ajude o cliente a encontrar a solução certa.
  """,
  memory=memory,
  add_history_to_context=True,
  add_memory_to_context=True,
);
```

---

## 📊 CRM Kanban

### Interface Visual

```
┌──────────────────────────────────────────────────────────┐
│  CRM - Gestão de Leads                                  │
│  Filtrar: [Stage ▼] [Intent ▼] [Data ▼]               │
└──────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┐
│   Novo Lead     │  Qualificado    │ Produtos        │
│   (3 leads)     │  (2 leads)      │ Apresentados    │
│                 │                 │ (1 lead)        │
├─────────────────┼─────────────────┼─────────────────┤
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │
│ │ João Silva  │ │ │ Maria Costa │ │ │ Pedro Oliveira
│ │ 11 99999-... │ │ │ 21 99999-... │ │ │ 85 99999-... │
│ │ Empresa XYZ │ │ │ Tech Corp   │ │ │ Construção Y │
│ │ R$ 5.000    │ │ │ R$ 8.500    │ │ │ R$ 12.000   │
│ │ 2 min atrás │ │ │ 5 min atrás │ │ │ 1 hora atrás │
│ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │
│ ┌─────────────┐ │ │ ┌─────────────┐ │ │
│ │ Ana Santos  │ │ │ Carlos Dias │ │ │
│ │ 85 99999-... │ │ │ 11 99999-... │ │ │
│ │ -            │ │ │ Construction│ │ │
│ │ R$ 3.000    │ │ │ R$ 15.000   │ │ │
│ │ 15 min atrás│ │ │ 10 min atrás│ │ │
│ └─────────────┘ │ │ └─────────────┘ │ │
└─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┬─────────────────┐
│  Cotação        │  Negociação     │  Fechado/Ganho  │
│  (4 leads)      │  (2 leads)      │  (1 lead)       │
│                 │                 │                 │
├─────────────────┼─────────────────┼─────────────────┤
│ [Leads...]      │ [Leads...]      │ [Leads...]      │
└─────────────────┴─────────────────┴─────────────────┘

┌───────────────────────────────────────────────────────┐
│            Perdido (2 leads)                          │
│ [João Pereira - Orçamento alto] [Motivo: Orçamento] │
└───────────────────────────────────────────────────────┘
```

### Funcionalidades do CRM

#### 1. Kanban Board
- Drag-and-drop de cards entre colunas
- Atualiza stage automaticamente
- Animação suave

#### 2. Lead Card
```typescript
interface LeadCard {
  name: string;
  phone: string;
  company?: string;
  estimatedValue: number;
  lastInteractionAt: Date;
  stage: string;
  
  // Ações
  actions: {
    view: () => void;
    call: () => void;
    whatsapp: () => void;
    schedule: () => void;
  }
}
```

#### 3. Lead Details Modal
- Timeline completa da conversa
- Agendamentos próximos
- Histórico de atividades
- Notas do time

#### 4. Agendamento
- Calendário integrado
- Tipos: Call, Visita Técnica, Callback
- Lembretes automáticos
- Sincronização com WhatsApp

#### 5. Relatórios
- Total de leads por stage
- Taxa de conversão
- Valor total em negociação
- Performance por período

---

## 💬 Integração WhatsApp

### Flow WhatsApp + Web

```
┌──────────────────────────────────────────┐
│    Usuário Web (Chat Widget)             │
│    Enviou: "Quero saber sobre furadeira" │
└──────────────────┬───────────────────────┘
                   │ Recebe resposta do bot
┌──────────────────┴───────────────────────┐
│    Backend - AGNO processa               │
│    Cria lead + qualifica intenção        │
└──────────────────┬───────────────────────┘
                   │ Resposta enviada
┌──────────────────┴───────────────────────┐
│    Usuário Web vê resposta no chat       │
│    + CRM atualizado com novo lead        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│    Vendedor abre CRM                     │
│    Vê lead de 2 minutos atrás            │
│    Clica: "Chamar via WhatsApp"          │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│    Evolution API envia mensagem          │
│    "Olá João! Está tudo bem?"            │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│    Webhook recebe resposta do cliente    │
│    "Sim! Pode me passar um orçamento?"   │
└──────────────────┬───────────────────────┘
                   │ Atualiza CRM
┌──────────────────┴───────────────────────┐
│    Lead atualizado com mensagem          │
│    Timeline sincronizada (web + whatsapp)│
└──────────────────────────────────────────┘
```

### Evolution API Setup

**Docker Compose:**
```yaml
evolution-api:
  image: evolution-api:latest
  ports:
    - "8080:8080"
  environment:
    - DATABASE_URL=mongodb://mongo:27017
    - RABBITMQ_URL=amqp://rabbitmq
  volumes:
    - evolution-data:/app/data
  depends_on:
    - mongo
    - rabbitmq
```

### Webhook Integration

**Endpoint:**
```
POST /api/webhooks/whatsapp
Authorization: Bearer EVOLUTION_API_KEY
Content-Type: application/json

{
  "event": "messages.upsert",
  "data": {
    "key": {
      "fromMe": false,
      "remoteJid": "5511999999999@s.whatsapp.net",
      "id": "MESSAGE_ID"
    },
    "message": {
      "conversation": "Olá, quero informações"
    },
    "messageTimestamp": 1707000000
  }
}
```

### Message Flow

```typescript
// 1. Webhook chega
POST /api/webhooks/whatsapp
  ├─ Validar assinatura
  ├─ Extrair telefone e mensagem
  └─> continue

// 2. Buscar ou criar lead
const lead = await Lead.findOrCreate({
  phone: "5511999999999",
  source: "whatsapp"
})

// 3. Processar com AGNO
const response = await agentResponse(
  message: "Olá, quero informações",
  leadId: lead._id,
  sessionId: lead.sessionId
)

// 4. Enviar resposta
await evolutionApi.sendMessage({
  phone: "5511999999999",
  text: response.reply
})

// 5. Salvar no banco
await Message.create({
  leadId: lead._id,
  sender: "bot",
  content: response.reply,
  source: "whatsapp"
})
```

---

## 🚀 Próximas Etapas Após Planejamento

### ✅ Checklist de Inicialização

Antes de começar o desenvolvimento:

1. **Infra:**
   - [ ] Docker Desktop instalado
   - [ ] MongoDB local ou Docker
   - [ ] Redis local ou Docker
   - [ ] Node 20+ instalado

2. **Contas/APIs:**
   - [ ] OpenAI API key pronta
   - [ ] Evolution API configurada
   - [ ] GitHub repo criado

3. **Configuração:**
   - [ ] Clonar repo
   - [ ] Instalar dependências
   - [ ] .env files criados
   - [ ] Docker Compose testado

4. **Primeiro Deploy Local:**
   - [ ] `npm run dev` (frontend funciona)
   - [ ] `npm run start:dev` (backend funciona)
   - [ ] Chat consegue se conectar
   - [ ] Agente responde

---

## 📞 Suporte e Documentação Adicional

### Documentos Existentes
- `docs/DOCUMENTACAO_STORAGE_MEMORIA_RAG_AGNO.md` - Storage e Memory
- `docs/GUIA_INTEGRACAO_AGNO_Whatsapp_Service.md` - WhatsApp + AGNO
- `docs/CONFIGURAR_WEBHOOK_EVOLUTION.md` - Webhook setup
- `docs/GUIA_DOCKER_COMPLETO.md` - Docker reference

### Recursos Externos
- [AGNO Documentation](https://docs.agno.ai)
- [NestJS Docs](https://docs.nestjs.com)
- [Evolution API Docs](https://evolution-api.readme.io)
- [Next.js Docs](https://nextjs.org/docs)

---

## 📝 Notas Importantes

### Considerações de Design

1. **Single Page Application (SPA):**
   - Não é e-commerce, apenas catálogo
   - Foco em conversão para chat
   - Simples, rápido, bonito

2. **UX do Chat:**
   - Primeiro contato é crítico
   - Qualificação automática pela IA
   - Transição suave para vendedor humano

3. **CRM Eficiente:**
   - Kanban visual e intuitivo
   - Histórico completo sincronizado
   - Ações rápidas via CRM

4. **Integração Omnichannel:**
   - Mesmo agente Web + WhatsApp
   - Histórico unificado
   - Contexto preservado

### Escalabilidade

- **BD:** MongoDB com índices estratégicos
- **Cache:** Redis para sessões e cache
- **Fila:** Bull para tarefas assíncronas
- **Agentes:** AGNO escalável com ferramentas

---

## 🎯 Sucesso do Projeto

### KPIs a Acompanhar

| Métrica | Meta | Frequência |
|---------|------|-----------|
| Chat conversion rate | >30% | Diário |
| Lead qualification time | <2 min | Diário |
| Avg response time | <5 seg | Diário |
| CRM sync time | <1 min | Diário |
| Mobile conversion | >40% | Semanal |
| Customer satisfaction | >4.5/5 | Semanal |

---

## ✨ Conclusão

Este documento fornece o **guia completo** para desenvolvimento do projeto. 

**Próximo Passo:** Iniciar **Fase 0 (Setup)** seguido pela **Fase 1 (Frontend)**.

Qualquer dúvida ou ajuste na arquitetura, revise este documento ou consulte a documentação existente em `docs/`.

**Bom desenvolvimento! 🚀**

---

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Autor:** Planejamento IA  
**Status:** ✅ Pronto para Desenvolvimento
