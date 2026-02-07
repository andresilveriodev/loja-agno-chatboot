# 🚀 Guia Rápido: Storage, Memória e RAG

## Qual componente usar?

```
┌─────────────────────────────────────────────────────────────┐
│ Você quer que o agente...                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ✅ Lembre de conversas na MESMA SESSÃO?                    │
│    → Use STORAGE (SqliteDb)                                │
│                                                              │
│ ✅ Lembre do USUÁRIO entre DIFERENTES SESSÕES?            │
│    → Use MEMÓRIA (Memory + SqliteMemoryDb)                │
│                                                              │
│ ✅ Responda baseado em DOCUMENTOS/PDFS?                   │
│    → Use RAG (ChromaDb + Knowledge)                        │
│                                                              │
│ ✅ Tudo junto (o máximo!)?                                 │
│    → Combine os 3 componentes                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Copiar & Colar: Templates Prontos

### Template 1: Apenas Storage

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
import os
from dotenv import load_dotenv

load_dotenv()

db = SqliteDb(db_file="tmp/data.db")

agent = Agent(
    name="Seu Agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=db,
    add_history_to_context=True,
    num_history_runs=3,
)

# Teste
agent.print_response(
    "Olá!",
    session_id="test_1",
    user_id="user_1"
)
```

---

### Template 2: Apenas Memória

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
import os
from dotenv import load_dotenv

load_dotenv()

memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=SqliteMemoryDb(table_name="user_memories", db_file="tmp/agent.db")
)

agent = Agent(
    name="Seu Agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    memory=memory,
    enable_agentic_memory=True,
    enable_user_memories=True,
    add_memories_to_context=True,
)

# Teste
agent.print_response(
    "Meu nome é João",
    session_id="test_1",
    user_id="joao"
)
```

---

### Template 3: Apenas RAG

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader
from agno.knowledge.chunking.semantic import SemanticChunking
from agno.knowledge.embedder.openai import OpenAIEmbedder
import os
from dotenv import load_dotenv

load_dotenv()

vector_db = ChromaDb(
    collection="docs",
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

agent = Agent(
    name="Seu Agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    knowledge=knowledge,
    add_knowledge_to_context=True,
)

# Teste
agent.print_response(
    "O que tem no documento X?",
    session_id="test_1"
)
```

---

### Template 4: Storage + Memória + RAG (COMPLETO!)

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

# ========== STORAGE ==========
db = SqliteDb(db_file="tmp/data.db")

# ========== MEMÓRIA ==========
memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=SqliteMemoryDb(table_name="user_memories", db_file="tmp/agent.db")
)

# ========== RAG ==========
vector_db = ChromaDb(
    collection="docs",
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

# ========== AGENTE ==========
agent = Agent(
    name="Super Agente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    # Storage
    db=db,
    add_history_to_context=True,
    num_history_runs=3,
    # Memória
    memory=memory,
    enable_agentic_memory=True,
    enable_user_memories=True,
    add_memories_to_context=True,
    # RAG
    knowledge=knowledge,
    add_knowledge_to_context=True,
)

# Teste
agent.print_response(
    "Olá, meu nome é Maria",
    session_id="test_1",
    user_id="maria"
)
```

---

## Cheat Sheet: Parâmetros Principais

### Storage
```python
db = SqliteDb(db_file="tmp/data.db")  # Criar DB

# No Agent
db=db                                  # Ativar
add_history_to_context=True           # Incluir histórico
num_history_runs=3                    # Quantas rodadas (3-5 é bom)

# Nas chamadas
session_id="sua_sessao"               # Agrupa conversas
user_id="seu_usuario"                 # Identifica usuário
```

### Memória
```python
memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=SqliteMemoryDb(table_name="user_memories", db_file="tmp/agent.db")
)

# No Agent
memory=memory                          # Passar Memory
enable_agentic_memory=True            # Ativar (ESSENCIAL)
enable_user_memories=True             # Por usuário
add_memories_to_context=True          # Incluir no prompt

# Nas chamadas
user_id="mesmo_usuario"               # SEMPRE o mesmo!
```

### RAG
```python
vector_db = ChromaDb(
    collection="sua_colecao",
    path="tmp/chromadb",
    embedder=OpenAIEmbedder(...),
    persistent_client=True
)

knowledge = Knowledge(vector_db=vector_db)
knowledge.add_content(
    path="docs/",
    reader=PDFReader(chunck_strategy=SemanticChunking()),
    skip_if_exists=True
)

# No Agent
knowledge=knowledge                    # Passar Knowledge
add_knowledge_to_context=True         # Injetar trechos
```

---

## Fluxograma de Decisão

```
             ┌─ PRECISO DE AGENTE?
             │
             ├─ SIM → Continue
             │
             └─ NÃO → Vá embora 😄
                      │
                      ├─ Histórico de conversas?
                      │   ├─ SIM → Adicione STORAGE
                      │   └─ NÃO → Pule
                      │
                      ├─ Perfil/preferências do usuário?
                      │   ├─ SIM → Adicione MEMÓRIA
                      │   └─ NÃO → Pule
                      │
                      ├─ Documentos/PDFs?
                      │   ├─ SIM → Adicione RAG
                      │   └─ NÃO → Pule
                      │
                      └─ Sucesso! 🎉
```

---

## Erros Comuns (e como corrigir)

| Erro | Causa | Solução |
|------|-------|--------|
| Agente não lembra da sessão | Falta `db=db` | Adicione `db=SqliteDb(...)` |
| Memória não funciona | `enable_agentic_memory=False` | Coloque `=True` |
| Memória esquece do usuário | `user_id` muda a cada chamada | Use o MESMO `user_id` |
| RAG não acha documentos | Docs não carregados | Execute `knowledge.add_content(...)` |
| ChromaDB vazio | Embedder não configurado | Use `embedder=OpenAIEmbedder(...)` |
| API Key error | `.env` não carregado | `load_dotenv()` no início |

---

## Arquivo `.env` Exemplo

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
TAVILY_API_KEY=tvly-xxxxxxxxxxxx
```

---

## Estrutura de Pastas

```
seu-projeto/
├── .env
├── pyproject.toml
├── DOCUMENTACAO_STORAGE_MEMORIA_RAG.md   # ← Você leu aqui!
├── GUIA_RAPIDO_TEMPLATES.md              # ← Este arquivo
├── agentes/
│   └── meu_agente.py
├── docs/
│   ├── relatorio1.pdf
│   └── relatorio2.pdf
└── tmp/
    ├── data.db          # Storage
    ├── agent.db         # Memória
    └── chromadb/        # RAG
```

---

## Próximos Passos

1. **Escolha um template** (1, 2, 3 ou 4)
2. **Copie o código** para seu projeto
3. **Configure o `.env`** com sua `OPENAI_API_KEY`
4. **Adicione documentos** em `docs/` (se usar RAG)
5. **Teste** com `python seu_agente.py`
6. **Leia a documentação completa** se tiver dúvidas

---

## Dúvidas Frequentes

**P: Qual modelo usar?**  
R: `gpt-4.1-mini` é bom e barato. Use `gpt-4` se precisar de mais poder.

**P: Quanto custa?**  
R: ChromaDB é grátis (local). OpenAI cobra por tokens (embedding + chamadas).

**P: Posso usar outro LLM?**  
R: Sim! Agno suporta Groq, Anthropic, etc. Veja docs do Agno.

**P: Quanto tempo guarda os dados?**  
R: Para sempre (SQLite + ChromaDB). Você controla exclusão.

**P: Posso usar PostgreSQL em vez de SQLite?**  
R: Sim, Agno suporta. Use `PostgresMemoryDb` ou similar.

---

**Última atualização:** Fevereiro 2026  
**Versão:** 1.0

