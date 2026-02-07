# Plano de Implementação: RAG de Produtos (Loja Multidepartamental)

Documento de planejamento para implementar RAG sobre o catálogo de produtos, permitindo ao agente buscar informações detalhadas nos dados indexados.

---

## 1. Objetivo

- **Fonte de dados:** `files/producst.txt` (um único arquivo com todos os produtos).
- **Objetivo:** O agente de vendas deve poder responder perguntas sobre produtos usando busca semântica (RAG) nesses dados, em conjunto com as tools existentes (`get_products_by_category`, `get_product_details`).

---

## 2. Fonte de Dados

| Item | Descrição |
|------|-----------|
| **Arquivo** | `services/ai-service/files/producst.txt` |
| **Formato** | Texto plano, UTF-8 |
| **Estrutura** | Blocos separados por cabeçalho numérico: `01 `, `02 `, … `29 ` (e possivelmente mais) |
| **Conteúdo por bloco** | Título, marca, avaliação, preço, especificações, descrição, ASIN, etc. |
| **Tamanho** | ~3250 linhas; dezenas de produtos |

**Padrão de início de produto:** linha que começa com 2 dígitos + espaço + nome do produto (ex.: `01 Furadeira de Impacto...`, `27 Carrinho de Transporte...`).

---

## 3. Arquitetura do RAG

```
┌─────────────────────────────────────────────────────────────────┐
│  Usuário pergunta ("furadeira 750W?", "preço carrinho?")         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent (AGNO)                                                    │
│  - knowledge=knowledge  → busca no RAG                           │
│  - tools=...           → get_products_by_category, get_product_   │
│                          details (API backend)                  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Knowledge (Agno)                                                 │
│  - add_knowledge_to_context=True / search_knowledge=True         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  ChromaDB (vector store)                                         │
│  - collection: "produtos_loja"                                   │
│  - path: tmp/chromadb (persistent_client=True)                   │
│  - embedder: OpenAI text-embedding-3-small                       │
└─────────────────────────────────────────────────────────────────┘
```

**Fluxo:** pergunta → embedding da pergunta → busca por similaridade no ChromaDB → trechos relevantes injetados no contexto do agente → resposta.

---

## 4. Estratégia de Chunking

- **Regra:** 1 chunk = 1 produto.
- **Motivo:** Perguntas são do tipo “qual furadeira 750W?”, “quanto custa o carrinho X?” — recuperar o bloco inteiro do produto garante nome, preço, specs e descrição juntos.
- **Implementação:** Parser lê `producst.txt`, divide por produto (regex em linhas que começam com `\d{2}\s+`), e cada bloco é inserido como um documento via `knowledge.insert(text_content=..., metadata=...)`.

---

## 5. Dependências

- **chromadb** — ainda não está em `requirements.txt`. Adicionar (ex.: `chromadb>=1.0.13`).
- **agno** — já em uso; usar `OpenAIEmbedder` e `Knowledge` conforme documentação em `docs/DOCUMENTACAO_STORAGE_MEMORIA_RAG_AGNO.md`.

---

## 6. Estrutura de Arquivos Proposta

```
services/ai-service/
├── agent.py                    # Alterar: adicionar RAG (Knowledge + ChromaDB)
├── tools.py                    # Manter como está
├── files/
│   └── producst.txt            # Fonte única (já existe)
├── knowledge/
│   ├── __init__.py             # Opcional: exportar parse_products, load_products_rag
│   ├── parser.py               # Lê producst.txt e retorna lista de {text, metadata}
│   └── load_products_rag.py    # Configura ChromaDB + Knowledge e faz insert em lote
├── tmp/
│   └── chromadb/               # Criado automaticamente pelo ChromaDB
├── .env                        # OPENAI_API_KEY (já usada)
├── requirements.txt            # Incluir chromadb
└── PLANO_RAG_PRODUTOS.md       # Este arquivo
```

---

## 7. Especificação do Parser (`knowledge/parser.py`)

**Entrada:** caminho para `files/producst.txt` (ou default relativo ao pacote).

**Processamento:**

1. Abrir arquivo com encoding `utf-8`.
2. Ler todo o conteúdo (ou linha a linha).
3. Dividir em blocos: toda vez que encontrar uma linha que casa com o padrão **início de produto**:
   - Regex sugerido: `r'^\d{2}\s+.+$'` em início de linha (ex.: `re.compile(r'^\d{2}\s+.+', re.MULTILINE)`).
   - Ou: split por `re.split(r'\n(?=\d{2}\s+)', content)` para obter lista de strings (cada uma = um produto).
4. Para cada bloco:
   - Limpar linhas vazias excessivas (opcional).
   - Extrair **título** da primeira linha (ex.: "01 Furadeira de Impacto..." → product_index="01", product_name="Furadeira de Impacto Profissional 750W").
   - Opcional: extrair **marca** (linha que segue "Marca" ou "Nome da marca") para metadata.
5. **Saída:** lista de dicionários:
   ```python
   [
     {
       "text": "01 Furadeira de Impacto...\n\nBosch...\n...",  # texto completo do bloco
       "metadata": {
         "product_index": "01",
         "product_name": "Furadeira de Impacto Profissional 750W",
         "brand": "Bosch"  # opcional
       }
     },
     ...
   ]
   ```

**Edge cases:**

- Primeiro bloco: pode ter texto antes do primeiro "01 "; descartar ou tratar como intro.
- Linhas que parecem número (ex. "4,8 de 5 estrelas") não devem ser confundidas com início de produto: o padrão é exatamente 2 dígitos + espaço no início da linha.
- Arquivo vazio ou sem nenhum match: retornar lista vazia.

---

## 8. Especificação do Carregamento RAG (`knowledge/load_products_rag.py`)

**Responsabilidade:** popular o vector store a partir de `producst.txt`.

**Passos:**

1. Carregar variáveis de ambiente (`python-dotenv`), garantir `OPENAI_API_KEY`.
2. Definir caminhos:
   - `PRODUCTS_TXT`: `files/producst.txt` (relativo à raiz do ai-service).
   - `CHROMADB_PATH`: `tmp/chromadb`.
3. Instanciar **ChromaDB:**
   - `collection="produtos_loja"`.
   - `path=CHROMADB_PATH`.
   - `embedder=OpenAIEmbedder(id="text-embedding-3-small", api_key=os.getenv("OPENAI_API_KEY"))`.
   - `persistent_client=True`.
4. Instanciar **Knowledge:** `Knowledge(vector_db=vector_db)`.
5. Chamar o **parser** com o caminho de `producst.txt`.
6. Para cada item retornado: `knowledge.insert(text_content=item["text"], metadata=item.get("metadata") or {}, skip_if_exists=True)` (ou `upsert=True` se quiser sempre atualizar).
7. Log simples: quantidade de produtos indexados.

**Uso:** script executável (ex.: `python -m knowledge.load_products_rag` ou `python knowledge/load_products_rag.py`) para ser rodado uma vez ou após atualizar o .txt.

---

## 9. Integração no Agente (`agent.py`)

**Alterações:**

1. **Importar** ChromaDB, OpenAIEmbedder, Knowledge (e opcionalmente o parser/load se for carregar sob demanda).
2. **Criar vector_db e knowledge** com a mesma configuração de `load_products_rag.py` (path, collection, embedder). Garantir que `tmp/chromadb` exista ou que o ChromaDB crie ao iniciar.
3. **Passar** `knowledge=knowledge` para o `Agent`.
4. **Flags:** `add_knowledge_to_context=True`; opcionalmente `search_knowledge=True` para busca explícita.
5. **Instruções (system):** adicionar algo como: “Você tem acesso a uma base de conhecimento com informações detalhadas dos produtos (nome, preço, especificações, descrição). Use-a para responder dúvidas sobre produtos. Quando apropriado, use também as ferramentas get_products_by_category e get_product_details para listar ou detalhar produtos pela API.”

**Ordem sugerida dos parâmetros do Agent:** `name`, `model`, `tools`, `db`, `memory_manager`, `knowledge`, `add_history_to_context`, `num_history_runs`, `enable_agentic_memory`, `instructions`, `markdown`.

---

## 10. Quando Executar a Ingestão

- **Opção A (recomendada):** Script separado. Rodar manualmente uma vez (e sempre que `producst.txt` for atualizado):
  ```bash
  cd services/ai-service && python -m knowledge.load_products_rag
  ```
- **Opção B:** Na inicialização do serviço (ex.: em `main.py` ou ao importar o agente): verificar se a coleção já tem documentos; se não tiver, chamar o parser e fazer o insert. Evitar rodar ingestão em toda requisição.

---

## 11. Checklist de Implementação

- [x] **1** Adicionar `chromadb>=1.0.13` ao `requirements.txt`.
- [x] **2** Criar pasta `knowledge/` e `knowledge/__init__.py`.
- [x] **3** Implementar `knowledge/parser.py` (ler producst.txt, split por produto, retornar lista de {text, metadata}).
- [x] **4** Implementar `knowledge/load_products_rag.py` (ChromaDB + Knowledge + loop de insert).
- [x] **5** Garantir que `tmp/chromadb` seja usado com `persistent_client=True` e que `tmp/` exista ou seja criável.
- [x] **6** Em `agent.py`: instanciar ChromaDB, Embedder e Knowledge; passar `knowledge` ao Agent; atualizar instruções.
- [ ] **7** Rodar o script de ingestão uma vez e testar perguntas no agente (ex.: “quais furadeiras têm 750W?”, “preço do carrinho de carga?”).
- [x] **8** (Opcional) Tratar `skip_if_exists` ou hash do conteúdo para não reindexar sem necessidade; documentar no README como reindexar.

---

## 12. Referências

- `docs/DOCUMENTACAO_STORAGE_MEMORIA_RAG_AGNO.md` — Storage, Memória e RAG com Agno.
- `docs/EXEMPLOS_PRATICOS_AGNO.md` — Exemplos de RAG com Knowledge e PDF (conceito análogo para insert com text_content).
- Agente atual: `agent.py` (Storage + Memory + Tools); manter tudo e adicionar apenas Knowledge.

---

**Última atualização:** Planejamento inicial para implementação do RAG de produtos.
