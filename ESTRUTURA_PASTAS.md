# 📁 ESTRUTURA DE PASTAS - Projeto Loja Multidepartamental

Este arquivo detalha a estrutura de pastas que será criada durante o desenvolvimento.

---

## 🌳 Árvore Completa

```
loja-multidepartamental/
│
├── 📋 DOCUMENTAÇÃO
│   ├── ARQUITETURA_PROJETO.md          ← Você está aqui
│   ├── ESTRUTURA_PASTAS.md             (este arquivo)
│   ├── PLANO_DESENVOLVIMENTO.md        (checklist de tarefas)
│   └── README.md                       (instruções para rodar)
│
├── 🖥️ FRONTEND (Next.js)
│   ├── app/
│   │   ├── layout.tsx                  # Layout global
│   │   ├── page.tsx                    # Página inicial (catálogo)
│   │   ├── error.tsx                   # Error boundary
│   │   ├── not-found.tsx               # 404
│   │   │
│   │   ├── api/                        # API Routes
│   │   │   ├── chat/
│   │   │   │   └── route.ts            # POST /api/chat (enviar msg)
│   │   │   ├── products/
│   │   │   │   └── route.ts            # GET /api/products (listar)
│   │   │   └── health/
│   │   │       └── route.ts            # GET /api/health (healthcheck)
│   │   │
│   │   └── components/                 # React Components
│   │       ├── Layout/
│   │       │   ├── Header.tsx
│   │       │   ├── Footer.tsx
│   │       │   └── Navigation.tsx
│   │       │
│   │       ├── Catalog/
│   │       │   ├── CatalogGrid.tsx         # Grade principal
│   │       │   ├── ProductCard.tsx        # Card individual
│   │       │   ├── CategoryFilter.tsx     # Filtros laterais
│   │       │   ├── FilterButton.tsx       # Botão mobile
│   │       │   └── LoadingSkeleton.tsx    # Placeholder
│   │       │
│   │       ├── Hero/
│   │       │   ├── HeroSection.tsx        # Banner topo
│   │       │   ├── PromoSlider.tsx        # Carousel promoções
│   │       │   └── BannerSection.tsx      # Banners estáticos
│   │       │
│   │       ├── ChatWidget/
│   │       │   ├── ChatButton.tsx         # Botão flutuante
│   │       │   ├── ChatWindow.tsx         # Janela aberta
│   │       │   ├── MessageList.tsx        # Lista de msgs
│   │       │   ├── MessageInput.tsx       # Input de texto
│   │       │   ├── MessageBubble.tsx      # Bubble individual
│   │       │   ├── TypingIndicator.tsx   # "digitando..."
│   │       │   └── QuickReplies.tsx       # Botões rápidos
│   │       │
│   │       └── Common/
│   │           ├── Button.tsx
│   │           ├── Badge.tsx
│   │           ├── Modal.tsx
│   │           └── Loader.tsx
│   │
│   ├── hooks/                          # Custom Hooks
│   │   ├── useChat.ts                  # Lógica do chat
│   │   ├── useProducts.ts              # Lógica de produtos
│   │   ├── useCategories.ts            # Lógica de categorias
│   │   └── useWindowSize.ts            # Detect tamanho tela
│   │
│   ├── lib/                            # Utilitários
│   │   ├── api.ts                      # Instância axios/fetch
│   │   ├── constants.ts                # Constantes (categorias, etc)
│   │   ├── socket-io.ts                # Socket.IO client
│   │   ├── types.ts                    # Types/Interfaces
│   │   └── utils.ts                    # Funções auxiliares
│   │
│   ├── store/                          # Estado Global (Zustand)
│   │   ├── chatStore.ts                # Estado do chat
│   │   ├── productStore.ts             # Estado produtos
│   │   ├── filterStore.ts              # Estado filtros
│   │   └── uiStore.ts                  # Estado UI
│   │
│   ├── public/                         # Assets estáticos
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── hero-banner.jpg
│   │   │   ├── products/               # Imagens de produtos
│   │   │   │   ├── furadeira.webp
│   │   │   │   ├── gerador.webp
│   │   │   │   └── ...
│   │   │   └── icons/
│   │   │       ├── chat.svg
│   │   │       ├── phone.svg
│   │   │       └── ...
│   │   └── fonts/
│   │
│   ├── styles/                        # Estilos globais
│   │   ├── globals.css                # Tailwind + global styles
│   │   └── animations.css             # Animações
│   │
│   ├── .env.example                   # Template de env vars
│   ├── .env.local                     # Vars desenvolvimento (gitignore)
│   ├── .env.production                # Vars produção
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md                      # Docs específicas frontend
│
├── 🔧 BACKEND (NestJS)
│   ├── src/
│   │   ├── main.ts                    # Entry point
│   │   ├── app.module.ts              # Módulo raiz
│   │   │
│   │   ├── common/                    # Código compartilhado
│   │   │   ├── exceptions/
│   │   │   │   ├── app-error.exception.ts
│   │   │   │   ├── bad-request.exception.ts
│   │   │   │   └── not-found.exception.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── user.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── interceptors/
│   │   │   │   └── response.interceptor.ts
│   │   │   └── pipes/
│   │   │       └── validation.pipe.ts
│   │   │
│   │   ├── config/                    # Configurações
│   │   │   ├── env.ts
│   │   │   ├── database.config.ts
│   │   │   ├── app.config.ts
│   │   │   ├── ai.config.ts
│   │   │   └── whatsapp.config.ts
│   │   │
│   │   ├── database/                  # Conexão BD
│   │   │   ├── database.module.ts
│   │   │   ├── mongodb.config.ts
│   │   │   └── schemas/
│   │   │
│   │   ├── modules/                   # Módulos de negócio
│   │   │   │
│   │   │   ├── products/              # 🛍️ Módulo Produtos
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── products.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-product.dto.ts
│   │   │   │   │   ├── update-product.dto.ts
│   │   │   │   │   └── product-filter.dto.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── product.schema.ts
│   │   │   │   │   └── category.schema.ts
│   │   │   │   ├── interfaces/
│   │   │   │   │   └── product.interface.ts
│   │   │   │   └── seeds/
│   │   │   │       └── products.seed.ts
│   │   │   │
│   │   │   ├── chat/                  # 💬 Módulo Chat
│   │   │   │   ├── chat.controller.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── chat.gateway.ts        # WebSocket
│   │   │   │   ├── chat.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── send-message.dto.ts
│   │   │   │   │   └── chat-history.dto.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── chat.schema.ts
│   │   │   │   │   └── message.schema.ts
│   │   │   │   └── interfaces/
│   │   │   │       └── chat.interface.ts
│   │   │   │
│   │   │   ├── leads/                 # 👥 Módulo Leads
│   │   │   │   ├── leads.controller.ts
│   │   │   │   ├── leads.service.ts
│   │   │   │   ├── leads.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-lead.dto.ts
│   │   │   │   │   ├── update-lead.dto.ts
│   │   │   │   │   └── lead-filter.dto.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── lead.schema.ts
│   │   │   │   ├── enums/
│   │   │   │   │   ├── lead-stage.enum.ts
│   │   │   │   │   └── lead-source.enum.ts
│   │   │   │   └── interfaces/
│   │   │   │       └── lead.interface.ts
│   │   │   │
│   │   │   ├── crm/                   # 📊 Módulo CRM
│   │   │   │   ├── crm.controller.ts
│   │   │   │   ├── crm.service.ts
│   │   │   │   ├── crm.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── kanban-move.dto.ts
│   │   │   │   │   ├── schedule-call.dto.ts
│   │   │   │   │   └── add-note.dto.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── activity.schema.ts
│   │   │   │   │   ├── schedule.schema.ts
│   │   │   │   │   └── kanban-stage.schema.ts
│   │   │   │   └── interfaces/
│   │   │   │       ├── activity.interface.ts
│   │   │   │       └── schedule.interface.ts
│   │   │   │
│   │   │   └── ai/                    # 🤖 Módulo IA (AGNO)
│   │   │       ├── ai.controller.ts
│   │   │       ├── ai.service.ts
│   │   │       ├── ai.module.ts
│   │   │       ├── dto/
│   │   │       │   └── process-message.dto.ts
│   │   │       ├── agents/
│   │   │       │   ├── base-agent.ts
│   │   │       │   ├── qualifier-agent.ts
│   │   │       │   ├── sales-agent.ts
│   │   │       │   └── support-agent.ts
│   │   │       ├── tools/
│   │   │       │   ├── crm-tools.ts
│   │   │       │   ├── product-tools.ts
│   │   │       │   ├── whatsapp-tools.ts
│   │   │       │   └── scheduling-tools.ts
│   │   │       ├── knowledge/
│   │   │       │   ├── product-knowledge.ts
│   │   │       │   ├── company-knowledge.ts
│   │   │       │   └── faq-knowledge.ts
│   │   │       └── memory/
│   │   │           ├── memory.service.ts
│   │   │           └── storage.service.ts
│   │   │
│   │   ├── services/                  # Serviços auxiliares
│   │   │   │
│   │   │   ├── whatsapp/              # 📱 WhatsApp Service
│   │   │   │   ├── whatsapp.service.ts
│   │   │   │   ├── whatsapp.module.ts
│   │   │   │   ├── evolution.client.ts
│   │   │   │   ├── webhook.handler.ts
│   │   │   │   └── interfaces/
│   │   │   │       └── whatsapp.interface.ts
│   │   │   │
│   │   │   ├── storage/               # 💾 Storage Service
│   │   │   │   ├── storage.service.ts
│   │   │   │   ├── storage.module.ts
│   │   │   │   └── interfaces/
│   │   │   │       └── storage.interface.ts
│   │   │   │
│   │   │   └── notification/          # 🔔 Notificação Service
│   │   │       ├── notification.service.ts
│   │   │       ├── notification.module.ts
│   │   │       └── interfaces/
│   │   │           └── notification.interface.ts
│   │   │
│   │   └── utils/                     # Utilitários
│   │       ├── logger.ts
│   │       ├── validators.ts
│   │       └── helpers.ts
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   ├── products.e2e-spec.ts
│   │   ├── chat.e2e-spec.ts
│   │   ├── leads.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── .env.example
│   ├── .env.local
│   ├── .env.production
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── 🐳 SERVICES (Docker)
│   ├── evolution-api/                 # 📱 WhatsApp Evolution
│   │   ├── docker-compose.yml
│   │   ├── .env.example
│   │   ├── README.md
│   │   └── init-scripts/
│   │
│   ├── ai-service/                    # 🤖 AI Service (Python)
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   ├── main.py
│   │   ├── setup_agno.py
│   │   ├── agno_setup/
│   │   │   ├── __init__.py
│   │   │   ├── agents.py
│   │   │   ├── tools.py
│   │   │   └── knowledge.py
│   │   ├── knowledge_base/
│   │   │   ├── products.json
│   │   │   ├── company_info.md
│   │   │   └── faq.md
│   │   └── README.md
│   │
│   └── mongodb/                       # 🗄️ MongoDB
│       ├── docker-compose.yml
│       ├── .env.example
│       ├── init-scripts/
│       │   └── init-db.js
│       └── README.md
│
├── 📚 DOCS (Documentação)
│   ├── ARQUITETURA_PROJETO.md          # Este documento
│   ├── ESTRUTURA_PASTAS.md             # Estrutura
│   ├── PLANO_DESENVOLVIMENTO.md        # Checklist
│   ├── API.md                          # Documentação API
│   ├── DATABASE.md                     # Schema DB
│   ├── SETUP.md                        # Setup inicial
│   ├── DEPLOYMENT.md                   # Deploy
│   │
│   ├── agno/                           # Docs AGNO
│   │   ├── INSTALACAO_AGNO.md
│   │   ├── GUIA_INTEGRACAO_WHATSAPP.md
│   │   ├── EXEMPLOS_PRATICOS.md
│   │   └── ...
│   │
│   └── endpoints/                      # Exemplos de requisições
│       ├── products.http
│       ├── chat.http
│       ├── leads.http
│       └── crm.http
│
├── 🎯 ROOT FILES
│   ├── docker-compose.yml              # Orquestração completa
│   ├── .env.example                    # Template vars globais
│   ├── .gitignore                      # Git ignore
│   ├── .gitattributes
│   └── README.md                       # README principal
│
└── 📦 NPM PACKAGES (package.json)
    ├── Frontend:
    │   - next: 15+
    │   - react: 18+
    │   - typescript
    │   - tailwindcss
    │   - @shadcn/ui
    │   - zustand
    │   - react-query
    │   - zod
    │   - react-hook-form
    │   - socket.io-client
    │   - axios
    │
    ├── Backend:
    │   - @nestjs/core
    │   - @nestjs/common
    │   - @nestjs/websockets
    │   - mongoose
    │   - redis
    │   - bull
    │   - typescript
    │   - dotenv
    │   - joi
    │   - class-validator
    │   - jest
    │   - @nestjs/testing
    │
    └── Services:
        - Python 3.12+
        - agno
        - openai
        - fastapi
        - uvicorn
        - pymongo
```

---

## 📍 Referências por Fase

### Fase 1: Frontend - Catálogo
Usar: `frontend/` (foco em app/, components/, lib/)

### Fase 2: Backend - API
Usar: `backend/src/modules/products/` e `modules/chat/`

### Fase 3: Frontend - Chat Widget
Usar: `frontend/components/ChatWidget/` e `hooks/useChat.ts`

### Fase 4: IA - AGNO
Usar: `backend/src/modules/ai/` e `services/ai-service/`

### Fase 5: CRM Kanban
Usar: `backend/src/modules/crm/` e `backend/src/modules/leads/`

### Fase 6: WhatsApp
Usar: `backend/src/services/whatsapp/` e `services/evolution-api/`

### Fase 7: Testes e Deploy
Usar: `backend/test/`, `docs/DEPLOYMENT.md`, docker-compose.yml

---

## 🔄 Fluxo de Criação

```
1️⃣ Clonar/Criar base
   ├─ mkdir loja-multidepartamental
   ├─ cd loja-multidepartamental
   └─ git init

2️⃣ Setup Frontend (Fase 1)
   ├─ npx create-next-app frontend
   └─ Copiar estrutura de frontend/

3️⃣ Setup Backend (Fase 2)
   ├─ nest new backend
   └─ Copiar estrutura de backend/

4️⃣ Setup Services (Paralelo)
   ├─ mkdir services
   ├─ mkdir services/evolution-api
   ├─ mkdir services/mongodb
   └─ mkdir services/ai-service

5️⃣ Criar docker-compose.yml (root)
   └─ Orquestrar todos os serviços

6️⃣ Setup Documentação
   ├─ ARQUITETURA_PROJETO.md
   ├── ESTRUTURA_PASTAS.md
   ├── PLANO_DESENVOLVIMENTO.md
   └── README.md
```

---

## 📝 Convenções de Nomes

### Frontend
- Componentes: `PascalCase` (e.g., `ProductCard.tsx`)
- Hooks: `camelCase` com `use` prefix (e.g., `useChat.ts`)
- Stores: `camelCase` (e.g., `chatStore.ts`)
- Interfaces: `PascalCase` com `I` prefix opcional (e.g., `IProduct`)

### Backend
- Controllers: `camelCase` (e.g., `products.controller.ts`)
- Services: `camelCase` (e.g., `products.service.ts`)
- Modules: `camelCase` (e.g., `products.module.ts`)
- DTOs: `PascalCase` (e.g., `CreateProductDto`)
- Schemas: `PascalCase` (e.g., `ProductSchema`)
- Enums: `PascalCase` (e.g., `LeadStageEnum`)

### Banco de Dados
- Collections: `snake_case` lowercase (e.g., `products`, `chat_messages`)
- Fields: `camelCase` (e.g., `createdAt`, `estimatedValue`)

---

## 🚀 Como Usar Este Documento

1. **Ao iniciar uma fase:** Consulte a seção correspondente
2. **Quando criar um arquivo:** Use os nomes indicados
3. **Para entender estrutura:** Leia a árvore acima
4. **Para referências rápidas:** Use as abas de convenções

---

**Última atualização:** Fevereiro 2026  
**Status:** ✅ Pronto para uso
