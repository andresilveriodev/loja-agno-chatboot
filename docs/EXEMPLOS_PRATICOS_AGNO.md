# 💡 Exemplos Práticos: Agentes Prontos para Usar

## 1. Agente de Análise Financeira (Storage + RAG)

**Caso de uso:** Analisar relatórios financeiros de empresas

**Arquivos esperados:**
```
docs/
├── PETR/
│   ├── 2T25_relatorio.pdf
│   └── 2T25_DRE.pdf
└── VALE/
    ├── 2T25_relatorio.pdf
    └── 2T25_DRE.pdf
```

**Código:**

```python
# agentes/agente_financeiro.py
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
from agno.tools.yfinance import YFinanceTools
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader
from agno.knowledge.chunking.semantic import SemanticChunking
from agno.knowledge.embedder.openai import OpenAIEmbedder
import os
from dotenv import load_dotenv

load_dotenv()

# Storage
db = SqliteDb(db_file="tmp/financeiro.db")

# RAG
vector_db = ChromaDb(
    collection="relatorios_financeiros",
    path="tmp/chromadb",
    embedder=OpenAIEmbedder(
        id="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY")
    ),
    persistent_client=True
)

knowledge = Knowledge(vector_db=vector_db)

# Adicionar Petrobras
knowledge.add_content(
    path="docs/PETR/",
    reader=PDFReader(chunck_strategy=SemanticChunking()),
    metadata={"empresa": "Petrobras", "setor": "Energia"},
    skip_if_exists=True
)

# Adicionar Vale
knowledge.add_content(
    path="docs/VALE/",
    reader=PDFReader(chunck_strategy=SemanticChunking()),
    metadata={"empresa": "Vale", "setor": "Mineração"},
    skip_if_exists=True
)

# Agente
agent = Agent(
    name="Analista Financeiro",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[YFinanceTools()],
    db=db,
    knowledge=knowledge,
    add_history_to_context=True,
    num_history_runs=3,
    add_knowledge_to_context=True,
    instructions="""Você é um analista financeiro experiente.
    - Analise relatórios financeiros de empresas
    - Compare com cotações atuais
    - Forneça insights e recomendações
    - Sempre cite as fontes dos dados""",
)

if __name__ == "__main__":
    # Teste
    agent.print_response(
        "Qual foi o lucro líquido da Petrobras em 2T25?",
        session_id="analise_petr_1",
        user_id="analista_1"
    )
    
    agent.print_response(
        "E qual é a cotação atual?",
        session_id="analise_petr_1",
        user_id="analista_1"
    )
```

**Como usar:**
```bash
python agentes/agente_financeiro.py
```

---

## 2. Agente de Suporte com Memória (Memória + Storage)

**Caso de uso:** Atendimento ao cliente que "lembra" do cliente

**Código:**

```python
# agentes/agente_suporte.py
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.playground import Playground, serve_playground_app
import os
from dotenv import load_dotenv

load_dotenv()

# Storage (histórico de sessões)
db = SqliteDb(db_file="tmp/suporte.db")

# Memory (preferências/histórico do cliente)
memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=SqliteMemoryDb(table_name="cliente_info", db_file="tmp/suporte_memory.db")
)

agent = Agent(
    name="Suporte Cliente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=db,
    memory=memory,
    add_history_to_context=True,
    num_history_runs=5,
    enable_agentic_memory=True,
    enable_user_memories=True,
    add_memories_to_context=True,
    instructions="""Você é um agente de suporte amigável e atencioso.
    - Sempre cumprimente o cliente pelo nome (se souber)
    - Lembre-se de problemas anteriores
    - Seja empático e ofereça soluções personalizadas
    - Escale para supervisor se necessário""",
)

app = Playground(agents=[agent]).get_app()

if __name__ == "__main__":
    serve_playground_app("agentes.agente_suporte:app", reload=True)

# Para testar via CLI:
# agent.print_response(
#     "Olá, meu nome é Carlos e preciso de ajuda",
#     session_id="sess_1",
#     user_id="carlos_santos"
# )
```

**Como usar:**
```bash
# Via Playground Web
python agentes/agente_suporte.py

# Via CLI
# Descomente as linhas no final do arquivo
```

---

## 3. Agente de Pesquisa com Tudo (Storage + Memória + RAG)

**Caso de uso:** Pesquisador que "lembra" das preferências e tem base de docs

**Estrutura esperada:**
```
docs/
├── ia/
│   ├── genai.pdf
│   └── llm.pdf
├── blockchain/
│   ├── bitcoin.pdf
│   └── ethereum.pdf
└── web3/
    └── cripto.pdf
```

**Código:**

```python
# agentes/agente_pesquisa_completo.py
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
from agno.tools.tavily import TavilyTools
import os
from dotenv import load_dotenv

load_dotenv()

print("🔧 Inicializando agente...")

# ========== STORAGE ==========
print("  - Configurando Storage...")
db = SqliteDb(db_file="tmp/pesquisa.db")

# ========== MEMÓRIA ==========
print("  - Configurando Memória...")
memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=SqliteMemoryDb(table_name="pesquisador_prefs", db_file="tmp/pesquisa_memory.db")
)

# ========== RAG ==========
print("  - Configurando RAG...")
vector_db = ChromaDb(
    collection="pesquisa_docs",
    path="tmp/chromadb",
    embedder=OpenAIEmbedder(
        id="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY")
    ),
    persistent_client=True
)

knowledge = Knowledge(vector_db=vector_db)

# Carregar documentos
print("  - Carregando documentos...")
knowledge.add_content(
    path="docs/",
    reader=PDFReader(chunck_strategy=SemanticChunking()),
    skip_if_exists=True
)
print("  ✅ Documentos carregados!")

# ========== AGENTE ==========
print("  - Criando agente...")
agent = Agent(
    name="Pesquisador Inteligente",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[TavilyTools()],
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
    instructions="""Você é um pesquisador especializado e atencioso.
    - Pesquise em bases de conhecimento locais primeiro
    - Se necessário, busque informações recentes na web
    - Respeite as preferências do pesquisador
    - Sempre cite fontes
    - Forneça respostas bem estruturadas""",
)

print("✅ Agente pronto!\n")

if __name__ == "__main__":
    # Exemplos de uso
    print("=" * 60)
    print("EXEMPLO 1: Apresentação e preferências")
    print("=" * 60)
    agent.print_response(
        "Olá! Meu nome é Dr. Silva e prefiro respostas bem estruturadas com referências.",
        session_id="pesquisa_1",
        user_id="dr_silva"
    )
    
    print("\n" + "=" * 60)
    print("EXEMPLO 2: Pesquisa com memória de preferências")
    print("=" * 60)
    agent.print_response(
        "Pesquise sobre IA Generativa",
        session_id="pesquisa_2",
        user_id="dr_silva"
    )
    
    print("\n" + "=" * 60)
    print("EXEMPLO 3: Mesmo usuário em nova sessão")
    print("=" * 60)
    agent.print_response(
        "E sobre blockchain, o que você tem?",
        session_id="pesquisa_3",
        user_id="dr_silva"
    )
```

**Como usar:**
```bash
python agentes/agente_pesquisa_completo.py
```

---

## 4. Team de Analistas (Storage + RAG distribuído)

**Caso de uso:** Múltiplos agentes especializados trabalhando juntos

**Código:**

```python
# agentes/team_analistas.py
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

# Storage central
db = SqliteDb(db_file="tmp/team_analistas.db")

# RAG central
vector_db = ChromaDb(
    collection="relatorios_empresas",
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

# ========== AGENTE 1: Notícias ==========
agent_noticias = Agent(
    name="Analista de Notícias",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[DuckDuckGoTools(enable_search=False, enable_news=True)],
    instructions="Pesquise notícias recentes sobre empresas. Seja conciso.",
)

# ========== AGENTE 2: Cotações ==========
agent_cotacoes = Agent(
    name="Analista de Cotações",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[YFinanceTools()],
    instructions="Analise cotações atuais. Use tabelas quando possível.",
)

# ========== AGENTE 3: Relatórios ==========
agent_relatorios = Agent(
    name="Analista de Relatórios",
    model=OpenAIChat(id="gpt-4.1-mini"),
    knowledge=knowledge,
    add_knowledge_to_context=True,
    instructions="Analise relatórios financeiros. Extraia números-chave.",
)

# ========== TEAM ==========
team = Team(
    name="Team Analistas B3",
    model=OpenAIChat(id="gpt-4.1-mini"),
    members=[agent_noticias, agent_cotacoes, agent_relatorios],
    db=db,
    add_history_to_context=True,
    num_history_runs=3,
    show_members_responses=True,
    get_member_information_tool=True,
    add_datetime_to_context=True,
    instructions=[
        "Você é um coordenador de analistas.",
        "Para notícias → use Analista de Notícias",
        "Para cotações → use Analista de Cotações",
        "Para relatórios → use Analista de Relatórios",
        "Sintetize as respostas de forma clara e concisa",
    ],
)

if __name__ == "__main__":
    print("Team Analistas B3 iniciado!\n")
    
    team.print_response(
        "Faça uma análise completa da Petrobras hoje",
        session_id="analise_petr_2025",
        user_id="gestor_1"
    )
```

**Como usar:**
```bash
python agentes/team_analistas.py
```

---

## 5. Agente com Playground Web

**Caso de uso:** Interface web para interagir com o agente

**Código:**

```python
# agentes/agente_web.py
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.playground import Playground, serve_playground_app
from agno.tools.tavily import TavilyTools
import os
from dotenv import load_dotenv

load_dotenv()

memory = Memory(
    model=OpenAIChat(id="gpt-4.1-mini"),
    db=SqliteMemoryDb(table_name="web_users", db_file="tmp/web.db")
)

agent = Agent(
    name="Assistente Web",
    model=OpenAIChat(id="gpt-4.1-mini"),
    tools=[TavilyTools()],
    memory=memory,
    enable_agentic_memory=True,
    enable_user_memories=True,
    add_memories_to_context=True,
    instructions="Você é um assistente amigável. Ajude o usuário com qualquer dúvida.",
)

# Criar Playground
app = Playground(agents=[agent]).get_app()

if __name__ == "__main__":
    # Servir via web
    serve_playground_app("agentes.agente_web:app", reload=True)
```

**Como usar:**
```bash
python agentes/agente_web.py
# Abra http://localhost:8000 no navegador
```

---

## 6. Script para Carregar Documentos em Lote

**Caso de uso:** Preparar base de RAG com muitos documentos

**Código:**

```python
# utils/carregar_documentos.py
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader
from agno.knowledge.chunking.semantic import SemanticChunking
from agno.knowledge.embedder.openai import OpenAIEmbedder
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def carregar_documentos(pasta_base="docs/", colecao="documentos"):
    """Carrega todos os PDFs de uma pasta para ChromaDB"""
    
    print(f"📚 Carregando documentos de: {pasta_base}")
    
    # Setup ChromaDB
    vector_db = ChromaDb(
        collection=colecao,
        path="tmp/chromadb",
        embedder=OpenAIEmbedder(
            id="text-embedding-3-small",
            api_key=os.getenv("OPENAI_API_KEY")
        ),
        persistent_client=True
    )
    
    knowledge = Knowledge(vector_db=vector_db)
    
    # Contar PDFs
    pasta = Path(pasta_base)
    pdfs = list(pasta.glob("**/*.pdf"))
    print(f"   Encontrados {len(pdfs)} PDFs\n")
    
    # Carregar por subpasta
    for subpasta in sorted(pasta.iterdir()):
        if subpasta.is_dir():
            print(f"  📂 {subpasta.name}/")
            knowledge.add_content(
                path=str(subpasta),
                reader=PDFReader(chunck_strategy=SemanticChunking()),
                metadata={"categoria": subpasta.name},
                skip_if_exists=True
            )
            print(f"     ✅ Carregado!")
    
    print(f"\n✅ Documentos carregados em '{colecao}'!")
    return knowledge

if __name__ == "__main__":
    carregar_documentos()
```

**Como usar:**
```bash
python utils/carregar_documentos.py
```

---

## 7. Teste Rápido de Todos os Componentes

**Caso de uso:** Validar se tudo está funcionando

**Código:**

```python
# teste_componentes.py
from agno.db.sqlite import SqliteDb
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.vectordb.chroma import ChromaDb
from agno.knowledge.knowledge import Knowledge
from agno.knowledge.embedder.openai import OpenAIEmbedder
from agno.models.openai import OpenAIChat
import os
from dotenv import load_dotenv

load_dotenv()

print("🧪 Testando componentes...\n")

# Teste 1: Storage
print("1️⃣  Testando Storage...")
try:
    db = SqliteDb(db_file="tmp/teste.db")
    print("   ✅ SqliteDb OK\n")
except Exception as e:
    print(f"   ❌ Erro: {e}\n")

# Teste 2: Memória
print("2️⃣  Testando Memória...")
try:
    memory_db = SqliteMemoryDb(
        table_name="test_memory",
        db_file="tmp/teste_memory.db"
    )
    memory = Memory(
        model=OpenAIChat(id="gpt-4.1-mini"),
        db=memory_db
    )
    print("   ✅ Memory OK\n")
except Exception as e:
    print(f"   ❌ Erro: {e}\n")

# Teste 3: RAG
print("3️⃣  Testando RAG...")
try:
    vector_db = ChromaDb(
        collection="teste",
        path="tmp/chromadb_teste",
        embedder=OpenAIEmbedder(
            id="text-embedding-3-small",
            api_key=os.getenv("OPENAI_API_KEY")
        ),
        persistent_client=True
    )
    knowledge = Knowledge(vector_db=vector_db)
    print("   ✅ ChromaDb + Knowledge OK\n")
except Exception as e:
    print(f"   ❌ Erro: {e}\n")

# Teste 4: OpenAI
print("4️⃣  Testando OpenAI...")
try:
    model = OpenAIChat(id="gpt-4.1-mini")
    print("   ✅ OpenAI OK\n")
except Exception as e:
    print(f"   ❌ Erro: {e}\n")

print("✅ Todos os testes concluídos!")
```

**Como usar:**
```bash
python teste_componentes.py
```

---

## Estrutura de Projeto Recomendada

```
seu-projeto/
├── .env
├── pyproject.toml
├── README.md
├── DOCUMENTACAO_STORAGE_MEMORIA_RAG.md
├── GUIA_RAPIDO_TEMPLATES.md
├── EXEMPLOS_PRATICOS.md              # ← Este arquivo
├── teste_componentes.py
│
├── agentes/
│   ├── __init__.py
│   ├── agente_financeiro.py           # Exemplo 1
│   ├── agente_suporte.py              # Exemplo 2
│   ├── agente_pesquisa_completo.py    # Exemplo 3
│   ├── team_analistas.py              # Exemplo 4
│   └── agente_web.py                  # Exemplo 5
│
├── utils/
│   ├── __init__.py
│   ├── carregar_documentos.py         # Exemplo 6
│   └── config.py
│
├── docs/
│   ├── relatorios/
│   ├── pesquisa/
│   └── contratos/
│
├── tmp/
│   ├── data.db
│   ├── agent.db
│   └── chromadb/
│
└── tests/
    ├── test_agent.py
    └── test_rag.py
```

---

## Como Rodar Cada Exemplo

```bash
# Exemplo 1: Análise Financeira
python agentes/agente_financeiro.py

# Exemplo 2: Suporte com Playlist
python agentes/agente_suporte.py

# Exemplo 3: Pesquisa Completa
python agentes/agente_pesquisa_completo.py

# Exemplo 4: Team de Analistas
python agentes/team_analistas.py

# Exemplo 5: Web Interface
python agentes/agente_web.py
# Abra: http://localhost:8000

# Exemplo 6: Carregar Docs
python utils/carregar_documentos.py

# Teste: Validar tudo
python teste_componentes.py
```

---

**Todos os exemplos estão prontos para copiar e colar!** 🚀

Escolha o que mais se encaixa com seu caso de uso e customize conforme necessário.

