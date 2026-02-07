# 📚 Documentação Completa: Storage, Memória e RAG com Agno

## 📋 Índice
1. [Introdução](#introdução)
2. [Pré-requisitos](#pré-requisitos)
3. [Arquitetura](#arquitetura)
4. [Componentes](#componentes)
5. [Guia Passo a Passo](#guia-passo-a-passo)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Troubleshooting](#troubleshooting)
8. [Dicas de Performance](#dicas-de-performance)
9. [Checklist de Implementação](#checklist-de-implementação)

---

## Introdução

Este guia cobre como integrar **Storage** (persistência de sessões), **Memória** (preferências e fatos de longo prazo) e **RAG** (Retrieval-Augmented Generation) em agentes de IA usando o framework **Agno**.

### O que cada componente faz:

| Componente | Função | Banco de Dados | Uso |
|-----------|--------|----------------|-----|
| **Storage** | Guarda histórico de conversas por sessão | SQLite | Agente "lembra" do que foi falado na sessão |
| **Memória** | Extrai e armazena fatos/preferências de cada usuário | SQLite | Agente "lembra" do usuário entre diferentes sessões |
| **RAG** | Indexa e busca documentos relevantes | ChromaDB (vector store) | Agente responde baseado em documentos |

---

## Pré-requisitos

### Dependências do `pyproject.toml`

```toml
[project]
name = "seu-projeto-agno"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "agno>=2.1.2",
    "chromadb>=1.0.13",
    "fastapi>=0.115.13",
    "openai>=1.88.0",
    "python-dotenv>=1.1.0",
    "sqlalchemy>=2.0.41",
    "uvicorn>=0.34.3",
    "pypdf>=5.6.0",        # Se usar PDFs
    "tavily-python>=0.7.7", # Se usar Tavily Search
    "yfinance>=0.2.63",    # Se usar dados financeiros
]
```

### Variáveis de Ambiente (`.env`)

```bash
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...  # Opcional
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         Agente (ou Team)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Storage (DB)  │  │    Memória     │  │      RAG       │ │
│  │                │  │                │  │                │ │
│  │  SqliteDb      │  │  Memory +      │  │  ChromaDb +    │ │
│  │  (histórico)   │  │  SqliteMemoryDb│  │  Knowledge +   │ │
│  │                │  │  (preferências)│  │  PDFReader     │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                ↓                      ↓
    tmp/data.db    tmp/agent.db        tmp/chromadb/
    (sessões)      (memórias)          (índices vetoriais)
```

---

## Componentes

### 1. Storage (Persistência de Sessões)

**O que é:** Guarda o histórico de mensagens de cada conversa, permitindo que o agente acesse conversas anteriores na mesma sessão.

**Quando usar:** Sempre que quiser que o agente lembre de conversas anteriores dentro da mesma sessão.

#### Opção A: `SqliteDb` (para Agent e Team)

```python
from agno.db.sqlite import SqliteDb

# Criar banco de dados
db = SqliteDb(db_file="tmp/data.db")

# Usar no agente
agent = Agent(
    name="meu_agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=db,                              # Ativar persistência
    add_history_to_context=True,        # Incluir histórico no contexto
    num_history_runs=3,                 # Quantas rodadas anteriores incluir
)

# Nas chamadas
agent.print_response(
    "Sua pergunta aqui",
    session_id="sessao_1",              # Identificador da sessão
    user_id="usuario_1"                 # Identificador do usuário
)
```

#### Opção B: `SqliteStorage` (alternativa para Agent)

```python
from agno.storage.sqlite import SqliteStorage

db = SqliteStorage(
    table_name="agent_session",
    db_file="tmp/agent.db"
)

agent = Agent(
    name="meu_agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    storage=db,                         # Usar storage em vez de db
    add_history_to_messages=True,       # Adicionar histórico às mensagens
    num_history_runs=3,
)
```

**Diferença:** 
- `SqliteDb` é mais flexível, usado em Agent e Team
- `SqliteStorage` é mais simples, focado apenas em sessões do Agent

**Recomendação:** Use `SqliteDb` para projetos novos (mais versátil).

---

### 2. Memória (Preferências e Fatos de Longo Prazo)

**O que é:** Extrai automaticamente preferências, fatos e informações sobre o usuário e as armazena, permitindo que o agente as use em futuras conversas, mesmo em sessões diferentes.

**Quando usar:** Quando quiser que o agente "aprenda" sobre o usuário ao longo do tempo.

#### Setup da Memória v2

```python
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.models.openai import OpenAIChat

# 1. Criar banco de dados de memória
memory_db = SqliteMemoryDb(
    table_name="user_memories",
    db_file="tmp/agent.db"
)

# 2. Criar objeto Memory
memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),  # Modelo para extrair memórias
    db=memory_db
)

# 3. Usar no agente
agent = Agent(
    name="meu_agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    memory=memory,                         # Passar objeto Memory
    enable_agentic_memory=True,           # Ativar memória agentic
    # Opcionais:
    enable_user_memories=True,            # Armazenar memórias por usuário
    add_memories_to_context=True,        # Incluir memórias no contexto
)

# Nas chamadas, SEMPRE usar user_id consistente para o mesmo usuário
agent.print_response(
    "Meu nome é João e prefiro respostas em tabelas.",
    session_id="sessao_1",
    user_id="joao"
)

agent.print_response(
    "Qual a cotação da PETR?",
    session_id="sessao_2",
    user_id="joao"  # Mesmo user_id! O agente usará as preferências armazenadas
)
```

#### Flags Importantes

| Flag | Função |
|------|--------|
| `enable_agentic_memory=True` | Ativa a memória do agente (essencial) |
| `enable_user_memories=True` | Armazena memórias associadas ao `user_id` |
| `add_memories_to_context=True` | Inclui memórias no contexto (prompt) |

---

### 3. RAG (Retrieval-Augmented Generation)

**O que é:** Indexa documentos em um vector store (ChromaDB) e permite que o agente busque trechos relevantes para responder perguntas com base em dados concretos.

**Quando usar:** Quando o agente precisa responder baseado em documentos específicos (PDFs, textos, relatórios, etc.).

#### Setup do RAG

##### Passo 1: Configurar Vector Store (ChromaDB)

```python
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.embedder.openai import OpenAIEmbedder
import os

vector_db = ChromaDb(
    collection="minha_colecao",              # Nome da coleção
    path="tmp/chromadb",                     # Caminho do banco
    embedder=OpenAIEmbedder(
        id="text-embedding-3-small",         # Modelo de embedding
        api_key=os.getenv("OPENAI_API_KEY")
    ),
    persistent_client=True                   # Persistir entre execuções
)
```

##### Passo 2: Criar Base de Conhecimento

```python
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader
from agno.knowledge.chunking.semantic import SemanticChunking

# Criar base de conhecimento
knowledge = Knowledge(vector_db=vector_db)

# Adicionar documentos (PDFs)
knowledge.add_content(
    path="docs/relatorios/",           # Caminho da pasta ou arquivo
    reader=PDFReader(
        chunck_strategy=SemanticChunking()  # Dividir por semântica
    ),
    metadata={
        "tipo": "relatório",
        "empresa": "Petrobras",
        "ano": 2025
    },
    skip_if_exists=True                # Não adicionar duplicatas
)
```

##### Passo 3: Ligar ao Agente

```python
agent = Agent(
    name="meu_agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    knowledge=knowledge,                      # Passar knowledge
    add_knowledge_to_context=True,           # Injetar trechos no contexto
    # Ou para sempre buscar:
    search_knowledge=True,
)
```

#### Alternativa: PDFKnowledgeBase (Específica para PDFs)

```python
from agno.knowledge.pdf import PDFKnowledgeBase, PDFReader
from agno.vectordb.chroma import ChromaDb

vector_db = ChromaDb(collection="pdf_docs", path="tmp/chromadb", persistent_client=True)

knowledge = PDFKnowledgeBase(
    path="arquivo.pdf",                # Arquivo PDF específico
    vector_db=vector_db,
    reader=PDFReader(chunk=True)
)
# knowledge.load()  # Descomente para carregar ao iniciar

agent = Agent(
    name="meu_agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    knowledge=knowledge,
    search_knowledge=True,
)
```

---

## Guia Passo a Passo

### Cenário 1: Agente com Storage (histórico de sessões)

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
from agno.tools.yfinance import YFinanceTools
import os
from dotenv import load_dotenv

load_dotenv()

# 1. Configurar Storage
db = SqliteDb(db_file="tmp/data.db")

# 2. Criar Agente
agent = Agent(
    name="Analista Financeiro",
    model=OpenAIChat(id="gpt-4.1-mini", api_key=os.getenv("OPENAI_API_KEY")),
    tools=[YFinanceTools()],
    instructions="Você é um analista financeiro especializado em ações da B3.",
    db=db,
    add_history_to_context=True,
    num_history_runs=3,
)

# 3. Usar o Agente
agent.print_response(
    "Qual a cotação da PETR4?",
    session_id="sessao_analista_1",
    user_id="usuario_1"
)

agent.print_response(
    "E qual foi a cotação ontem?",  # O agente "lembra" da pergunta anterior
    session_id="sessao_analista_1",
    user_id="usuario_1"
)
```

---

### Cenário 2: Agente com Memória (preferências do usuário)

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.tools.tavily import TavilyTools
import os
from dotenv import load_dotenv

load_dotenv()

# 1. Configurar Memória
memory_db = SqliteMemoryDb(
    table_name="user_preferences",
    db_file="tmp/agent.db"
)

memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=memory_db
)

# 2. Criar Agente
agent = Agent(
    name="Pesquisador",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[TavilyTools()],
    instructions="Você é um pesquisador experiente.",
    memory=memory,
    enable_agentic_memory=True,
    enable_user_memories=True,
    add_memories_to_context=True,
)

# 3. Primeira interação - Agente aprende preferências
agent.print_response(
    "Meu nome é Maria e prefiro respostas bem detalhadas com exemplos.",
    session_id="sessao_1",
    user_id="maria"
)

# 4. Segunda sessão - Agente usa preferências armazenadas
agent.print_response(
    "Pesquise sobre IA generativa",
    session_id="sessao_2",
    user_id="maria"  # Mesmo usuário! Memórias serão usadas
)
```

---

### Cenário 3: Agente com RAG (baseado em documentos)

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader
from agno.knowledge.chunking.semantic import SemanticChunking
from agno.knowledge.embedder.openai import OpenAIEmbedder
from agno.storage.sqlite import SqliteStorage
import os
from dotenv import load_dotenv

load_dotenv()

# 1. Configurar Vector Store
vector_db = ChromaDb(
    collection="relatorios_empresariais",
    path="tmp/chromadb",
    embedder=OpenAIEmbedder(
        id="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY")
    ),
    persistent_client=True
)

# 2. Criar Base de Conhecimento
knowledge = Knowledge(vector_db=vector_db)

knowledge.add_content(
    path="docs/relatorios/",
    reader=PDFReader(chunck_strategy=SemanticChunking()),
    metadata={"tipo": "relatório financeiro", "ano": 2025},
    skip_if_exists=True
)

# 3. Criar Agente
db = SqliteStorage(table_name="agent_session", db_file="tmp/agent.db")

agent = Agent(
    name="Analista de Relatórios",
    model=OpenAIChat(id="gpt-4.1-mini"),
    storage=db,
    knowledge=knowledge,
    instructions="Você é especialista em análise de relatórios empresariais.",
    add_history_to_messages=True,
    add_knowledge_to_context=True,
)

# 4. Usar Agente
agent.print_response(
    "Qual foi o lucro líquido da empresa em 2T25?",
    session_id="sessao_1"
)
```

---

### Cenário 4: Agente com Storage + Memória + RAG (Completo)

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader
from agno.knowledge.chunking.semantic import SemanticChunking
from agno.knowledge.embedder.openai import OpenAIEmbedder
import os
from dotenv import load_dotenv

load_dotenv()

# ============= STORAGE =============
db = SqliteDb(db_file="tmp/data.db")

# ============= MEMÓRIA =============
memory_db = SqliteMemoryDb(
    table_name="user_memories",
    db_file="tmp/agent.db"
)
memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=memory_db
)

# ============= RAG =============
vector_db = ChromaDb(
    collection="documentos",
    path="tmp/chromadb",
    embedder=OpenAIEmbedder(
        id="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY")
    ),
    persistent_client=True
)

knowledge = Knowledge(vector_db=vector_db)
knowledge.add_content(
    path="docs/",
    reader=PDFReader(chunck_strategy=SemanticChunking()),
    skip_if_exists=True
)

# ============= AGENTE =============
agent = Agent(
    name="Agente Inteligente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    # Storage
    db=db,
    add_history_to_context=True,
    num_history_runs=5,
    # Memória
    memory=memory,
    enable_agentic_memory=True,
    enable_user_memories=True,
    add_memories_to_context=True,
    # RAG
    knowledge=knowledge,
    add_knowledge_to_context=True,
    # Instruções
    instructions="Você é um assistente inteligente que lembra de usuários e usa bases de conhecimento.",
)

# ============= USO =============
# Primeira interação
agent.print_response(
    "Meu nome é Carlos. Prefiro respostas concisas.",
    session_id="sessao_1",
    user_id="carlos"
)

# Segunda interação (histórico + memória)
agent.print_response(
    "Quais informações você tem sobre energia renovável?",
    session_id="sessao_2",
    user_id="carlos"
)
```

---

### Cenário 5: Team com Storage + RAG

```python
from agno.agent import Agent
from agno.team.team import Team
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
from agno.tools.yfinance import YFinanceTools
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader
from agno.knowledge.chunking.semantic import SemanticChunking
from agno.knowledge.embedder.openai import OpenAIEmbedder
import os
from dotenv import load_dotenv

load_dotenv()

# ============= STORAGE =============
db = SqliteDb(db_file="tmp/team_data.db")

# ============= RAG =============
vector_db = ChromaDb(
    collection="relatorios",
    path="tmp/chromadb",
    embedder=OpenAIEmbedder(
        id="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY")
    ),
    persistent_client=True
)

knowledge = Knowledge(vector_db=vector_db)
knowledge.add_content(
    path="docs/relatorios/",
    reader=PDFReader(chunck_strategy=SemanticChunking()),
    skip_if_exists=True
)

# ============= AGENTES =============
# Agente 1: Pesquisa em Web
agent_web = Agent(
    name="Pesquisador Web",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[DuckDuckGoTools(enable_search=True, enable_news=True)],
    instructions="Pesquise informações recentes na web.",
)

# Agente 2: Análise de Cotações
agent_cotacoes = Agent(
    name="Analista Cotações",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[YFinanceTools()],
    instructions="Analise cotações e dados financeiros.",
)

# Agente 3: Análise de Relatórios (com RAG)
agent_relatorios = Agent(
    name="Analista Relatórios",
    model=OpenAIChat(id="gpt-4.1-mini"),
    knowledge=knowledge,
    add_knowledge_to_context=True,
    instructions="Analise documentos e relatórios armazenados.",
)

# ============= TEAM =============
team = Team(
    name="Team Analistas",
    model=OpenAIChat(id="gpt-4.1-mini"),
    members=[agent_web, agent_cotacoes, agent_relatorios],
    db=db,
    add_history_to_context=True,
    num_history_runs=3,
    show_members_responses=True,
    instructions=[
        "Coordene os agentes para fornecer uma análise completa.",
        "Use o pesquisador web para notícias recentes.",
        "Use o analista de cotações para dados financeiros.",
        "Use o analista de relatórios para análise aprofundada.",
    ],
)

# ============= USO =============
team.print_response(
    "Analise a situação atual da empresa X",
    session_id="analise_1",
    user_id="analista_1"
)
```

---

## Exemplos Práticos

### Exemplo 1: Agente de Suporte com Memória

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.playground import Playground, serve_playground_app

# Setup
memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=SqliteMemoryDb(table_name="support_memories", db_file="tmp/support.db")
)

agent = Agent(
    name="Suporte Cliente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    memory=memory,
    enable_agentic_memory=True,
    enable_user_memories=True,
    add_memories_to_context=True,
    instructions="""Você é um agente de suporte amigável.
    - Sempre cumprimente o cliente pelo nome se souber.
    - Lembre-se de problemas anteriores.
    - Ofereça soluções personalizadas."""
)

app = Playground(agents=[agent]).get_app()

if __name__ == "__main__":
    serve_playground_app("seu_modulo:app", reload=True)
```

### Exemplo 2: Agente de Análise de Documentos

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.storage.sqlite import SqliteStorage
from agno.knowledge.pdf import PDFKnowledgeBase, PDFReader
from agno.vectordb.chroma import ChromaDb

# Setup RAG
vector_db = ChromaDb(
    collection="legal_docs",
    path="tmp/chromadb",
    persistent_client=True
)

knowledge = PDFKnowledgeBase(
    path="contratos/",
    vector_db=vector_db,
    reader=PDFReader(chunk=True)
)

# Setup Agent
db = SqliteStorage(table_name="legal_agent", db_file="tmp/legal.db")

agent = Agent(
    name="Analista Jurídico",
    model=OpenAIChat(id="gpt-4.1-mini"),
    storage=db,
    knowledge=knowledge,
    instructions="Você é um analista jurídico. Extraia informações dos documentos.",
    search_knowledge=True,
    add_history_to_messages=True,
)

# Uso
response = agent.print_response(
    "Quais são as cláusulas principais deste contrato?",
    session_id="analise_contrato_1"
)
```

---

## Troubleshooting

### Problema 1: Histórico não está sendo persistido

**Causa:** Falta `db=db` e/ou `add_history_to_context=True`

**Solução:**
```python
agent = Agent(
    model=...,
    db=db,                           # ✅ Adicione isso
    add_history_to_context=True,    # ✅ E isso
    num_history_runs=3,
)
```

---

### Problema 2: Memória não está armazenando preferências

**Causa:** `enable_agentic_memory=True` está ausente ou `user_id` não é consistente

**Solução:**
```python
agent = Agent(
    model=...,
    memory=memory,
    enable_agentic_memory=True,     # ✅ Essencial
    enable_user_memories=True,
    add_memories_to_context=True,
)

# Nas chamadas
agent.print_response(
    "...",
    user_id="mesmo_usuario"  # ✅ Sempre o mesmo user_id
)
```

---

### Problema 3: RAG não está encontrando documentos

**Causas possíveis:**
1. Documentos não foram carregados (`knowledge.add_content` não foi executado)
2. `persistent_client=True` não está configurado no ChromaDB
3. Embedder não está configurado corretamente

**Solução:**
```python
# 1. Garantir embedder
vector_db = ChromaDb(
    collection="docs",
    path="tmp/chromadb",
    embedder=OpenAIEmbedder(...),  # ✅ Adicione embedder
    persistent_client=True         # ✅ Persistência
)

# 2. Carregar documentos
knowledge = Knowledge(vector_db=vector_db)
knowledge.add_content(
    path="docs/",
    reader=PDFReader(...),
    skip_if_exists=True
)

# 3. No agente
agent = Agent(
    model=...,
    knowledge=knowledge,
    add_knowledge_to_context=True,  # ✅ Injetar contexto
)
```

---

### Problema 4: Erro ao conectar com OpenAI

**Causa:** `OPENAI_API_KEY` não está configurada

**Solução:**
```bash
# 1. Criar arquivo .env
echo "OPENAI_API_KEY=sk-..." > .env

# 2. Carregar no código
from dotenv import load_dotenv
import os
load_dotenv()

# 3. Usar na agent
model=OpenAIChat(id="gpt-4.1-mini", api_key=os.getenv("OPENAI_API_KEY"))
```

---

### Problema 5: ChromaDB ocupando muito espaço

**Causa:** Muitos documentos indexados ou duplicatas

**Solução:**
```python
# Usar skip_if_exists para evitar duplicatas
knowledge.add_content(
    path="docs/",
    reader=PDFReader(...),
    skip_if_exists=True  # ✅ Não re-indexar
)

# Ou limpar e recriar
import shutil
shutil.rmtree("tmp/chromadb")
# Recriar knowledge
```

---

## Dicas de Performance

### 1. Limitar histórico para melhor performance
```python
agent = Agent(
    model=...,
    num_history_runs=3,  # ✅ Não exagere (3-5 é bom)
)
```

### 2. Usar embedding mais eficiente para RAG
```python
embedder=OpenAIEmbedder(id="text-embedding-3-small")  # ✅ Mais rápido e barato
```

### 3. Chunking semântico > fixed size
```python
PDFReader(chunck_strategy=SemanticChunking())  # ✅ Melhor qualidade
```

### 4. Reusar Agent e Team instâncias
```python
# ✅ BOM
agent = Agent(...)
agent.print_response("pergunta 1", session_id="s1")
agent.print_response("pergunta 2", session_id="s2")

# ❌ RUIM
agent1 = Agent(...)
agent1.print_response("pergunta 1")
agent2 = Agent(...)
agent2.print_response("pergunta 2")
```

---

## Checklist de Implementação

Use este checklist ao criar um novo agente:

- [ ] Instalar `agno>=2.1.2` e dependências
- [ ] Configurar variáveis de ambiente (`.env`)
- [ ] Decidir qual(is) componente(s) usar:
  - [ ] Storage? (histórico por sessão)
  - [ ] Memória? (preferências por usuário)
  - [ ] RAG? (busca em documentos)
- [ ] Configurar Storage (se usar)
  - [ ] `SqliteDb(db_file="...")`
  - [ ] Passar `db=db` no Agent/Team
  - [ ] Adicionar `add_history_to_context=True`
- [ ] Configurar Memória (se usar)
  - [ ] `Memory(...)` + `SqliteMemoryDb(...)`
  - [ ] Passar `memory=memory` no Agent
  - [ ] Adicionar `enable_agentic_memory=True`
  - [ ] Usar `user_id` consistente
- [ ] Configurar RAG (se usar)
  - [ ] `ChromaDb(...)` com embedder
  - [ ] `Knowledge(...)` + `add_content(...)`
  - [ ] Passar `knowledge=knowledge` no Agent
  - [ ] Adicionar `add_knowledge_to_context=True`
- [ ] Testar Agent/Team com `print_response()`
- [ ] Verificar logs e sqlite files (`tmp/`)
- [ ] Deploy (Playground, API, etc.)

---

## Estrutura de Pastas Recomendada

```
seu-projeto/
├── .env                          # Variáveis de ambiente
├── pyproject.toml               # Dependências
├── README.md                    # Documentação
├── agentes/
│   ├── agente_principal.py      # Seu agente
│   ├── agentes_especializados.py # Agentes adicionais
│   └── team.py                  # Team (se usar)
├── knowledge/
│   ├── documentos.pdf           # Seus documentos
│   ├── relatorios/              # Pasta de documentos
│   └── processar_docs.py        # Script para processar docs
├── tmp/
│   ├── data.db                  # Storage
│   ├── agent.db                 # Memory + agents
│   └── chromadb/                # Vector store
├── utils/
│   ├── config.py                # Configurações centralizadas
│   └── helpers.py               # Funções auxiliares
└── tests/
    ├── test_agent.py            # Testes do agente
    └── test_rag.py              # Testes RAG
```

---

## Referências

- [Documentação Agno](https://agno.ai/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

---

**Última atualização:** Fevereiro 2026  
**Versão:** 1.0  
**Autor:** Baseado em projetos Agno (Módulo 2, 31_memory, 21_pdf_agent)

---

## Resumo Rápido

| O que preciso? | Componente | Código Essencial |
|---|---|---|
| Lembrar da sessão | Storage | `db=SqliteDb()`, `add_history_to_context=True` |
| Lembrar do usuário | Memória | `memory=Memory()`, `enable_agentic_memory=True`, `user_id=...` |
| Buscar em docs | RAG | `knowledge=Knowledge()`, `add_content()`, `add_knowledge_to_context=True` |
| Tudo junto | Todos os 3 | Combinar os 3 acima no mesmo Agent |
| Múltiplos agentes | Team | `Team(members=[...], db=db, ...)` |

