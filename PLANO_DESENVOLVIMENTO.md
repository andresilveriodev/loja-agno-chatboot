# ✅ PLANO DE DESENVOLVIMENTO - Checklist Executável

**Objetivo:** Checklist detalhado e sequencial para desenvolvimento completo do projeto.

**Como usar:** Marque as tarefas conforme completar com [x]

---

## 📋 FASE 0: PRÉ-DESENVOLVIMENTO (1-2 dias)

### 0.1 - Preparação do Ambiente

**Tarefas:**
- [ ] Docker Desktop instalado e rodando
- [ ] Node.js 20+ instalado (`node --version`)
- [ ] npm 10+ instalado (`npm --version`)
- [ ] Python 3.12+ instalado (`python --version`)
- [ ] Git configurado (`git config --global user.name "seu-nome"`)
- [ ] Visual Studio Code com extensions (Prettier, ESLint, Rest Client)
- [ ] MongoDB rodando (local ou Docker)
- [ ] Redis rodando (local ou Docker)

**Comandos:**
```bash
# Verificar versões
docker --version
node --version
npm --version
python --version
git --version

# Testar MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:6
# Testar Redis
docker run -d -p 6379:6379 --name redis redis:7
```

### 0.2 - Setup de Variáveis de Ambiente

**Criar arquivo `.env.example` (root):**
```bash
# Frontend (roda em http://localhost:3002; API/WS no backend :3001)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_CHAT_API=http://localhost:3001/api

# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=mongodb://localhost:27017/loja-db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-proj-xxxxx
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=xxxxx

# AI Service
AGNO_API_KEY=xxxxx
AGNO_MODEL=gpt-4
```

**Copiar para cada projeto:**
```bash
cd frontend && cp ../.env.example .env.local
cd ../backend && cp ../.env.example .env.local
```

### 0.3 - Criar Repositório Git

```bash
# Inicializar repo (se ainda não feito)
git init

# Criar .gitignore
echo "node_modules/" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo "dist/" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "tmp/" >> .gitignore

# Primeiro commit
git add .
git commit -m "initial commit: project structure"
```

### 0.4 - Estrutura de Pastas Inicial

```bash
# Criar estrutura raiz
mkdir -p loja-multidepartamental
mkdir -p loja-multidepartamental/{frontend,backend,services,docs}
mkdir -p loja-multidepartamental/services/{evolution-api,ai-service,mongodb}
```

**Status Fase 0:** ✅ Completo quando todo ambiente está funcionando

---

## 🖥️ FASE 1: FRONTEND - CATÁLOGO (3-4 dias)

### 1.1 - Setup Next.js

```bash
# Criar projeto
cd frontend
npx create-next-app@latest . --typescript --tailwind --no-eslint

# Instalar dependências adicionais
npm install \
  zustand \
  react-query \
  zod \
  react-hook-form \
  @hookform/resolvers \
  socket.io-client \
  axios \
  clsx \
  class-variance-authority \
  tailwind-merge

# Instalar shadcn/ui
npx shadcn-ui@latest init

npm run dev  # Testar se funciona
```

**Checklist:**
- [ ] Next.js criado
- [ ] TypeScript configurado
- [ ] Tailwind CSS funcionando
- [ ] Shadcn/ui instalado
- [ ] npm run dev funciona
- [ ] Acessar http://localhost:3002

### 1.2 - Layout Global

**Criar `app/layout.tsx`:**
- [ ] Import de fonts (Geist)
- [ ] Meta tags (title, description)
- [ ] RootLayout component
- [ ] CSS global em `styles/globals.css`
- [ ] Tailwind configurado

**Checklist:**
- [ ] Layout renderiza
- [ ] Tailwind funciona
- [ ] Page.tsx renderiza dentro do layout
- [ ] Responsividade básica funcionando

### 1.3 - Componentes de Layout

**Criar estrutura:**

```bash
mkdir -p app/components/Layout
```

**Arquivos:**
- [ ] `components/Layout/Header.tsx`
  - Logo da loja
  - Navegação simples
  - Ícone de chat (com contador)

- [ ] `components/Layout/Footer.tsx`
  - Informações da empresa
  - Links úteis
  - Redes sociais (opcional)

- [ ] `components/Layout/Navigation.tsx`
  - Menu mobile (hamburger)
  - Menu desktop

**Checklist:**
- [ ] Header renderiza corretamente
- [ ] Footer renderiza corretamente
- [ ] Responsividade mobile/desktop
- [ ] CSS Tailwind aplicado

### 1.4 - Seção Hero

**Criar `components/Hero/HeroSection.tsx`:**
- [ ] Imagem de fundo responsiva
- [ ] Texto chamativo
- [ ] Botão CTA "Explorar Catálogo"
- [ ] Animação sutil (Tailwind animations)

**Checklist:**
- [ ] Hero renderiza
- [ ] Imagem carrega (se não tiver, usar placeholder)
- [ ] Responsividade
- [ ] CTA visível e acessível

### 1.5 - Dados de Produtos

**Criar `lib/constants.ts` com 30 produtos:**

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

export const CATEGORIES = [
  "Ferramentas & Máquinas Profissionais",
  "Energia & Infraestrutura",
  "Jardinagem & Áreas Externas",
  "Climatização & Refrigeração Comercial",
  "Cozinha Industrial & Alimentação",
  "Segurança do Trabalho (EPIs)",
  "Materiais Industriais & Hidráulicos",
  "Armazenagem & Logística",
  "Automação & Controle",
];

export const PRODUCTS: Product[] = [
  // 6 produtos de Ferramentas
  // 4 produtos de Energia
  // ... etc (30 total)
];
```

**Checklist:**
- [ ] Arquivo criado com todos 30 produtos
- [ ] Categorias definidas (9 total)
- [ ] Preços corretos
- [ ] IDs únicos

### 1.6 - Card de Produto

**Criar `components/Catalog/ProductCard.tsx`:**
- [ ] Imagem do produto (otimizada, lazy load)
- [ ] Nome + descrição curta
- [ ] Preço em destaque
- [ ] Botão "Saber Mais"
- [ ] Hover effects

```typescript
interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    // Implementar com Tailwind
  );
}
```

**Checklist:**
- [ ] Card renderiza
- [ ] Imagem exibe
- [ ] Preço formatado em R$
- [ ] Botão funciona
- [ ] Hover effects funcionam

### 1.7 - Grid de Produtos

**Criar `components/Catalog/CatalogGrid.tsx`:**
- [ ] Grid responsivo (1 col mobile, 2 tablet, 3+ desktop)
- [ ] Renderiza produtos do estado
- [ ] Skeleton loading
- [ ] Props para filtrar

```typescript
interface CatalogGridProps {
  products: Product[];
  isLoading: boolean;
  onProductSelect: (product: Product) => void;
}
```

**Checklist:**
- [ ] Grid renderiza todos os produtos
- [ ] Layout responsivo
- [ ] Skeleton loading funciona
- [ ] Clique em produto funciona

### 1.8 - Filtro por Categoria

**Criar `components/Catalog/CategoryFilter.tsx`:**
- [ ] Sidebar desktop (fixa)
- [ ] Modal mobile (toggle)
- [ ] Checkboxes para categorias
- [ ] Botão "Limpar Filtros"
- [ ] Contador de produtos por categoria

**Integração com Zustand:**
```typescript
// store/productStore.ts
interface ProductStore {
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  clearFilters: () => void;
}
```

**Checklist:**
- [ ] Filtro renderiza
- [ ] Seleção de categorias funciona
- [ ] "Limpar filtros" funciona
- [ ] Filtro persiste no estado
- [ ] Responsividade mobile/desktop

### 1.9 - Página Principal Completa

**Criar `app/page.tsx`:**
- [ ] Importar Hero
- [ ] Importar CategoryFilter
- [ ] Importar CatalogGrid
- [ ] Integração de estado (Zustand)
- [ ] Lógica de filtragem

```typescript
export default function Home() {
  const selectedCategories = useProductStore(s => s.selectedCategories);
  
  // Filtrar produtos
  const filteredProducts = selectedCategories.length > 0
    ? PRODUCTS.filter(p => selectedCategories.includes(p.category))
    : PRODUCTS;

  return (
    // Layout completo
  );
}
```

**Checklist:**
- [ ] Página carrega sem erros
- [ ] Todos os componentes renderizam
- [ ] Filtros funcionam
- [ ] Layout responsivo
- [ ] Performance aceitável

### 1.10 - Otimizações Frontend

- [ ] Imagens otimizadas (WebP, comprimidas)
- [ ] Code splitting automático (Next.js)
- [ ] Meta tags SEO
- [ ] Favicon
- [ ] Lighthouse score > 70

**Teste:**
```bash
npm run build
npm run start
# Testar em http://localhost:3002
```

**Checklist Fase 1:** ✅ Completo quando catálogo está funcional e responsivo

---

## 🔧 FASE 2: BACKEND - API REST (4-5 dias)

### 2.1 - Setup NestJS

```bash
cd backend
npm i -g @nestjs/cli
nest new .

# Instalar dependências
npm install \
  @nestjs/mongoose \
  mongoose \
  dotenv \
  joi \
  class-validator \
  class-transformer \
  socket.io \
  @nestjs/websockets \
  redis \
  bull \
  @nestjs/bull

npm install --save-dev \
  @types/jest \
  jest \
  @nestjs/testing
```

**Checklist:**
- [ ] NestJS criado
- [ ] TypeScript configurado
- [ ] npm install completo
- [ ] `npm run start:dev` funciona
- [ ] Acessar http://localhost:3001

### 2.2 - Configuração de Ambiente

**Criar `src/config/env.ts`:**
```typescript
import * as joi from 'joi';

export function validateEnv() {
  const envVarsSchema = joi.object({
    NODE_ENV: joi.string().required(),
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    REDIS_URL: joi.string().required(),
    OPENAI_API_KEY: joi.string().required(),
  });
  
  // Validação...
}
```

**Checklist:**
- [ ] Config carregado
- [ ] Validação funciona
- [ ] Variáveis lidas corretamente

### 2.3 - Conexão MongoDB

**Criar `src/database/database.module.ts`:**
```typescript
@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL),
  ],
})
export class DatabaseModule {}
```

**Criar `src/app.module.ts`:**
```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ProductsModule,
    ChatModule,
    // ... outros módulos
  ],
})
export class AppModule {}
```

**Teste de conexão:**
```bash
npm run start:dev
# Ver logs indicando conexão MongoDB
```

**Checklist:**
- [ ] MongoDB conecta
- [ ] Mensagem de conexão nos logs
- [ ] Sem erros de conexão

### 2.4 - Módulo de Produtos

**Criar estrutura:**
```bash
mkdir -p src/modules/products/{dto,schemas,interfaces}
```

**2.4.1 - Schema (MongoDB):**

```typescript
// src/modules/products/schemas/product.schema.ts
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop([String])
  features: string[];

  @Prop()
  specs: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
```

**2.4.2 - DTO:**

```typescript
// src/modules/products/dto/create-product.dto.ts
import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  price: number;

  // ... outros campos
}

// src/modules/products/dto/product-filter.dto.ts
export class ProductFilterDto {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
```

**2.4.3 - Service:**

```typescript
// src/modules/products/products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  async findAll(filter: ProductFilterDto): Promise<Product[]> {
    const query = {};
    if (filter.category) {
      query['category'] = filter.category;
    }
    return this.productModel.find(query).exec();
  }

  async findById(id: string): Promise<Product> {
    return this.productModel.findById(id).exec();
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return this.productModel.create(dto);
  }
}
```

**2.4.4 - Controller:**

```typescript
// src/modules/products/products.controller.ts
@Controller('api/products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(@Query() filter: ProductFilterDto) {
    return await this.productsService.findAll(filter);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.productsService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }
}
```

**2.4.5 - Module:**

```typescript
// src/modules/products/products.module.ts
@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

**Checklist:**
- [ ] Schema criado
- [ ] DTOs criados
- [ ] Service criado
- [ ] Controller criado
- [ ] Module criado
- [ ] Endpoints funcionam (testar em REST Client)

### 2.5 - Seed de Produtos

**Criar `src/modules/products/seeds/products.seed.ts`:**
```typescript
import { PRODUCTS } from '../../../lib/constants'; // Copiar do frontend

@Injectable()
export class ProductsSeedService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.productModel.countDocuments();
    
    if (count === 0) {
      console.log('🌱 Seeding products...');
      await this.productModel.insertMany(PRODUCTS);
      console.log('✅ Products seeded successfully');
    }
  }
}
```

**Chamar no app.module:**
```typescript
export class AppModule implements NestModule {
  constructor(private seedService: ProductsSeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }
}
```

**Checklist:**
- [ ] Seed criado
- [ ] Executado na inicialização
- [ ] 30 produtos no banco de dados
- [ ] Verificar com MongoDB Compass

### 2.6 - Testar Endpoints de Produtos

**Criar `docs/endpoints/products.http`:**
```http
### Listar produtos
GET http://localhost:3001/api/products

### Listar produtos por categoria
GET http://localhost:3001/api/products?category=Ferramentas%20&%20Máquinas%20Profissionais

### Obter produto específico
GET http://localhost:3001/api/products/[ID_DO_PRODUTO]

### Criar novo produto
POST http://localhost:3001/api/products
Content-Type: application/json

{
  "name": "Teste",
  "category": "Ferramentas",
  "price": 100,
  "description": "Teste",
  "features": []
}
```

**Testar com REST Client (VSCode):**
```
Instalar: REST Client extension
Abrir: docs/endpoints/products.http
Clicar: "Send Request"
```

**Checklist:**
- [ ] GET /products retorna todos
- [ ] GET /products?category=X filtra
- [ ] GET /products/:id retorna específico
- [ ] POST /products cria novo
- [ ] Status 200 OK em respostas

### 2.7 - Chat Básico (Backend)

**2.7.1 - Schema Message:**

```typescript
// src/modules/chat/schemas/message.schema.ts
@Schema()
export class Message {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ enum: ['user', 'bot', 'agent'] })
  sender: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 'text' })
  type: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  metadata: Record<string, any>;
}
```

**2.7.2 - Service:**

```typescript
@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<Message>,
  ) {}

  async saveMessage(dto: SendMessageDto): Promise<Message> {
    return this.messageModel.create(dto);
  }

  async getHistory(sessionId: string): Promise<Message[]> {
    return this.messageModel.find({ sessionId }).sort({ createdAt: 1 });
  }
}
```

**2.7.3 - Controller:**

```typescript
@Controller('api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('message')
  async sendMessage(@Body() dto: SendMessageDto) {
    return await this.chatService.saveMessage(dto);
  }

  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return await this.chatService.getHistory(sessionId);
  }
}
```

**Checklist:**
- [ ] Schema criado
- [ ] Service criado
- [ ] Controller criado
- [ ] Endpoints funcionam

### 2.8 - WebSocket (Chat Real-time)

**Criar `src/modules/chat/chat.gateway.ts`:**

```typescript
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any) {
    console.log(`Message received: ${JSON.stringify(payload)}`);
    
    // Salvar mensagem
    // Processar com IA
    // Enviar resposta
    
    this.server.emit('message', {
      sender: 'bot',
      content: 'Resposta do bot',
    });
  }
}
```

**Checklist:**
- [ ] Gateway criado
- [ ] Cliente consegue se conectar
- [ ] Mensagens são recebidas
- [ ] Mensagens são reenviadas

### 2.9 - Testes Básicos

**Criar `test/products.e2e-spec.ts`:**
```typescript
describe('Products (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/products')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Rodar testes:**
```bash
npm run test:e2e
```

**Checklist:**
- [ ] Testes rodam
- [ ] Testes passam
- [ ] Coverage > 50%

**Checklist Fase 2:** ✅ Completo quando API está funcional e testada

---

## 💬 FASE 3: FRONTEND - CHAT WIDGET (2-3 dias)

### 3.1 - Store Zustand para Chat

**Criar `app/store/chatStore.ts`:**

```typescript
import create from 'zustand';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  sessionId: string;
  
  addMessage: (message: ChatMessage) => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;
  setSessionId: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  sessionId: '',

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  toggleOpen: () => set((state) => ({
    isOpen: !state.isOpen,
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  setSessionId: (id) => set({ sessionId: id }),
}));
```

**Checklist:**
- [ ] Store criado
- [ ] Funciona localmente
- [ ] Estado persiste

### 3.2 - Hook useChat

**Criar `app/hooks/useChat.ts`:**

```typescript
import { useCallback } from 'react';
import { useChatStore } from '@/app/store/chatStore';
import io, { Socket } from 'socket.io-client';

let socket: Socket;

export function useChat() {
  const { sessionId, addMessage, setLoading } = useChatStore();

  const initializeSocket = useCallback(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WS_URL, {
        reconnection: true,
      });

      socket.on('message', (data) => {
        addMessage({
          id: Date.now().toString(),
          sender: 'bot',
          content: data.content,
          timestamp: new Date(),
        });
        setLoading(false);
      });
    }
  }, [addMessage, setLoading]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Adicionar mensagem do usuário
    addMessage({
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date(),
    });

    setLoading(true);

    // Inicializar socket se necessário
    if (!socket) initializeSocket();

    // Enviar via socket
    socket.emit('message', {
      sessionId,
      content,
    });
  }, [sessionId, addMessage, setLoading, initializeSocket]);

  return { sendMessage, initializeSocket };
}
```

**Checklist:**
- [ ] Hook criado
- [ ] Socket.IO integrado
- [ ] Mensagens enviadas/recebidas
- [ ] Loading state funciona

### 3.3 - Componente ChatButton (Botão Flutuante)

**Criar `app/components/ChatWidget/ChatButton.tsx`:**

```typescript
'use client';

import { useChatStore } from '@/app/store/chatStore';
import { MessageCircle } from 'lucide-react';

export function ChatButton() {
  const { toggleOpen, messages } = useChatStore();
  const unreadCount = messages.filter(m => m.sender === 'bot').length;

  return (
    <button
      onClick={toggleOpen}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition hover:scale-110 z-40"
      aria-label="Abrir chat"
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

**Checklist:**
- [ ] Botão renderiza
- [ ] Posição correta (canto inferior direito)
- [ ] Hover effects funcionam
- [ ] Badge com contador aparece

### 3.4 - Componente MessageBubble

**Criar `app/components/ChatWidget/MessageBubble.tsx`:**

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Bubble renderiza
- [ ] Cores corretas (user=azul, bot=cinza)
- [ ] Timestamp exibido
- [ ] Responsividade

### 3.5 - Componente MessageList

**Criar `app/components/ChatWidget/MessageList.tsx`:**

```typescript
import { useEffect, useRef } from 'react';
import { useChatStore } from '@/app/store/chatStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function MessageList() {
  const { messages, isLoading } = useChatStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll para o fim
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
```

**Checklist:**
- [ ] Mensagens renderizam
- [ ] Auto-scroll funciona
- [ ] Typing indicator aparece
- [ ] Layout correto

### 3.6 - Componente TypingIndicator

**Criar `app/components/ChatWidget/TypingIndicator.tsx`:**

```typescript
export function TypingIndicator() {
  return (
    <div className="flex gap-1 p-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
}
```

**Checklist:**
- [ ] Indicator renderiza
- [ ] Animação funciona
- [ ] Aparece quando isLoading=true

### 3.7 - Componente MessageInput

**Criar `app/components/ChatWidget/MessageInput.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useChat } from '@/app/hooks/useChat';
import { Send } from 'lucide-react';

export function MessageInput() {
  const [input, setInput] = useState('');
  const { sendMessage } = useChat();

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="border-t p-4 flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Digite sua mensagem..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
      >
        <Send size={20} />
      </button>
    </div>
  );
}
```

**Checklist:**
- [ ] Input renderiza
- [ ] Envio funciona
- [ ] Enter para enviar
- [ ] Input limpa após envio

### 3.8 - Componente ChatWindow Completo

**Criar `app/components/ChatWidget/ChatWindow.tsx`:**

```typescript
'use client';

import { useChatStore } from '@/app/store/chatStore';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { X } from 'lucide-react';

export function ChatWindow() {
  const { isOpen, toggleOpen } = useChatStore();

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-40 md:w-96 sm:w-80 max-h-96">
      {/* Header */}
      <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Chat de Suporte</h3>
        <button
          onClick={toggleOpen}
          className="hover:bg-green-600 p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <MessageInput />
    </div>
  );
}
```

**Checklist:**
- [ ] Window renderiza
- [ ] Altura e largura corretas
- [ ] Header com botão fechar
- [ ] Responsividade

### 3.9 - Integração no Layout

**Modificar `app/layout.tsx`:**

```typescript
import { ChatButton } from './components/ChatWidget/ChatButton';
import { ChatWindow } from './components/ChatWidget/ChatWindow';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ChatButton />
        <ChatWindow />
      </body>
    </html>
  );
}
```

**Checklist:**
- [ ] Componentes integrados
- [ ] Botão aparece na página
- [ ] Chat window abre/fecha
- [ ] Sem erros de layout

### 3.10 - Quick Replies (Opcional)

**Criar `app/components/ChatWidget/QuickReplies.tsx`:**

```typescript
interface QuickReply {
  id: string;
  label: string;
  message: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { id: '1', label: 'Preço', message: 'Qual o preço da furadeira?' },
  { id: '2', label: 'Especificações', message: 'Quais as especificações?' },
  { id: '3', label: 'Entrega', message: 'Como funciona a entrega?' },
];

export function QuickReplies() {
  const { sendMessage } = useChat();

  return (
    <div className="p-4 space-y-2">
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply.id}
          onClick={() => sendMessage(reply.message)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-left px-3 py-2 rounded text-sm transition"
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
}
```

**Checklist Fase 3:** ✅ Completo quando chat widget está funcional

---

## 🤖 FASE 4: IA - AGNO INTEGRATION (5-6 dias)

*(Continua na próxima seção...)*

---

## 📊 FASE 5: CRM KANBAN (4-5 dias)

*(Continua na próxima seção...)*

---

## 📱 FASE 6: WHATSAPP INTEGRATION (3-4 dias)

*(Continua na próxima seção...)*

---

## 🧪 FASE 7: REFINAMENTO E TESTES (3-4 dias)

*(Continua na próxima seção...)*

---

## 🎉 CONCLUSÃO

Este checklist completo guia o desenvolvimento sequencial do projeto.

**Próximo passo:** Começar pela **Fase 0** e marcar as tarefas conforme completa!

---

**Última atualização:** Fevereiro 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Usar
