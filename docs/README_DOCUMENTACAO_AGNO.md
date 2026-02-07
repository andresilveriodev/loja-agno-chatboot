# 📖 README - Documentação Completa de Storage, Memória e RAG

Bem-vindo! Este projeto contém uma **documentação completa e pronta para usar** sobre como integrar Storage, Memória e RAG em agentes de IA com o framework **Agno**.

## 📚 O Que Você Tem Aqui

4 arquivos Markdown organizados por necessidade:

### 1. 📇 **REFERENCIA_RAPIDA.md** - COMECE AQUI ⭐
**Para:** Navegar rápido e encontrar o que precisa  
**Tempo:** 5 minutos  
**Contém:**
- Índice de conteúdo
- Encontre por necessidade
- Fluxo de aprendizado
- Checklist rápido

👉 **Leia primeiro se:** Você quer saber por onde começar

---

### 2. ⚡ **GUIA_RAPIDO_TEMPLATES.md** - TEMPLATES PRONTOS
**Para:** Começar rapidinho com código funcional  
**Tempo:** 10 minutos  
**Contém:**
- 4 templates prontos para copiar/colar
- Fluxograma de decisão
- Cheat sheet de parâmetros
- Erros comuns (tabla rápida)
- Estrutura de pastas recomendada

👉 **Leia se:** Você quer começar AGORA com código

---

### 3. 📚 **DOCUMENTACAO_STORAGE_MEMORIA_RAG.md** - GUIA COMPLETO
**Para:** Aprender tudo a fundo  
**Tempo:** 30-45 minutos  
**Contém:**
- Introdução completa
- Pré-requisitos detalhados
- Arquitetura visual
- Componentes explicados (Storage, Memória, RAG)
- 5 cenários passo a passo
- 2 exemplos práticos
- Troubleshooting completo (5 problemas)
- Dicas de performance
- Checklist de implementação

👉 **Leia se:** Você quer entender tudo

---

### 4. 💡 **EXEMPLOS_PRATICOS.md** - CÓDIGO COMPLETO
**Para:** Ver agentes reais funcionando  
**Tempo:** Varie (copiar/adaptar)  
**Contém:**
- 7 agentes completos e prontos
- Análise Financeira
- Suporte com Memória
- Pesquisador Completo
- Team de Analistas
- Interface Web
- Script de Carregamento
- Teste de Componentes

👉 **Leia se:** Você quer ver código real

---

## 🎯 Por Onde Começar?

### Cenário 1: "Quero começar em 5 minutos"
1. Leia: **REFERENCIA_RAPIDA.md**
2. Copie: Um template de **GUIA_RAPIDO_TEMPLATES.md**
3. Pronto! 🚀

### Cenário 2: "Quero entender tudo"
1. Leia: **GUIA_RAPIDO_TEMPLATES.md** (10 min)
2. Leia: **DOCUMENTACAO_STORAGE_MEMORIA_RAG.md** (30 min)
3. Explore: **EXEMPLOS_PRATICOS.md** (10 min)
4. Pronto! 📚

### Cenário 3: "Quero ver código funcionando"
1. Leia: **REFERENCIA_RAPIDA.md** (qual exemplo?)
2. Vá para: **EXEMPLOS_PRATICOS.md**
3. Copie: Um dos 7 exemplos
4. Rode: `python seu_agente.py`
5. Pronto! 💻

---

## 🔍 Encontre o Que Precisa

```
Preciso de...                    Arquivo                      Seção
─────────────────────────────────────────────────────────────────────
Histórico de conversas           DOCUMENTACAO                 Storage
Lembrar do usuário               DOCUMENTACAO                 Memória
Buscar em PDFs                   DOCUMENTACAO                 RAG
Tudo junto                       DOCUMENTACAO                 Cenário 4
Exemplo de Suporte               EXEMPLOS_PRATICOS            Exemplo 2
Exemplo Financeiro               EXEMPLOS_PRATICOS            Exemplo 1
Template rápido                  GUIA_RAPIDO_TEMPLATES        Template 1/2/3/4
Um resumo visual                 REFERENCIA_RAPIDA            Fluxograma
```

---

## 📊 Os 3 Componentes em 30 Segundos

| Componente | O quê | Como | Quando |
|-----------|-------|------|--------|
| **Storage** | Guarda histórico de sessões | `SqliteDb` | Quer que agente lembre conversas |
| **Memória** | Guarda preferências do usuário | `Memory` + `SqliteMemoryDb` | Quer que agente lembre do usuário |
| **RAG** | Busca em documentos/PDFs | `ChromaDb` + `Knowledge` | Quer responder baseado em docs |

**Resumo de código:**

```python
# Storage
db = SqliteDb(db_file="tmp/data.db")
agent = Agent(..., db=db, add_history_to_context=True)

# Memória
memory = Memory(db=SqliteMemoryDb(...))
agent = Agent(..., memory=memory, enable_agentic_memory=True)

# RAG
knowledge = Knowledge(vector_db=ChromaDb(...))
knowledge.add_content(path="docs/", reader=PDFReader(...))
agent = Agent(..., knowledge=knowledge, add_knowledge_to_context=True)
```

---

## 🚀 Quick Start (1 minuto)

### Passo 1: Instalar
```bash
pip install agno chromadb openai python-dotenv
```

### Passo 2: Configurar .env
```bash
OPENAI_API_KEY=sk-proj-seu_token_aqui
```

### Passo 3: Copiar Template
De `GUIA_RAPIDO_TEMPLATES.md`, copie o **Template 1** (Storage)

### Passo 4: Rodar
```bash
python seu_agente.py
```

Pronto! 🎉

---

## 📁 Estrutura do Projeto

```
seu-projeto/
├── REFERENCIA_RAPIDA.md                    ← Índice (comece aqui)
├── GUIA_RAPIDO_TEMPLATES.md                ← Templates prontos
├── DOCUMENTACAO_STORAGE_MEMORIA_RAG.md     ← Guia completo
├── EXEMPLOS_PRATICOS.md                    ← Código real
│
├── .env                                    # Suas chaves (PRIVADO)
├── pyproject.toml                          # Dependências
│
├── agentes/
│   ├── meu_agente.py                       # Seu agente aqui
│   └── ...
├── docs/
│   ├── relatorios/                         # PDFs para RAG
│   └── ...
└── tmp/
    ├── data.db                             # Storage (auto-criado)
    ├── agent.db                            # Memória (auto-criado)
    └── chromadb/                           # RAG index (auto-criado)
```

---

## 📚 Documentação Arquivo por Arquivo

### REFERENCIA_RAPIDA.md
```
📋 Índice de Referência Rápida
├─ Encontre por Necessidade
├─ Tabela de Conteúdo
├─ Fluxo de Aprendizado
├─ Checklist Rápido
└─ FAQ
```

### GUIA_RAPIDO_TEMPLATES.md
```
⚡ Guia Rápido: Storage, Memória e RAG
├─ Qual componente usar? (Árvore de decisão)
├─ Template 1: Apenas Storage
├─ Template 2: Apenas Memória
├─ Template 3: Apenas RAG
├─ Template 4: Tudo Junto
├─ Cheat Sheet
├─ Fluxograma
├─ Erros Comuns
├─ Próximos Passos
└─ FAQ
```

### DOCUMENTACAO_STORAGE_MEMORIA_RAG.md
```
📚 Documentação Completa
├─ Introdução
├─ Pré-requisitos
├─ Arquitetura (Diagrama)
├─ Storage (Seção completa)
├─ Memória (Seção completa)
├─ RAG (Seção completa)
├─ Cenário 1: Apenas Storage
├─ Cenário 2: Apenas Memória
├─ Cenário 3: Apenas RAG
├─ Cenário 4: Storage + Memória + RAG
├─ Cenário 5: Team + Storage + RAG
├─ Exemplos Práticos (2)
├─ Troubleshooting (5 problemas)
├─ Dicas de Performance
├─ Checklist
└─ Referências
```

### EXEMPLOS_PRATICOS.md
```
💡 Exemplos Prontos
├─ Exemplo 1: Análise Financeira
├─ Exemplo 2: Suporte com Memória
├─ Exemplo 3: Pesquisador Completo
├─ Exemplo 4: Team de Analistas
├─ Exemplo 5: Interface Web
├─ Exemplo 6: Carregar Docs em Lote
└─ Exemplo 7: Teste de Componentes
```

---

## 🎓 Recomendação de Leitura

### Para Iniciantes
1. REFERENCIA_RAPIDA.md (5 min)
2. GUIA_RAPIDO_TEMPLATES.md (10 min)
3. Copie um template e teste (5 min)
4. DOCUMENTACAO... conforme necessário

### Para Intermediários
1. REFERENCIA_RAPIDA.md - achar seção específica (2 min)
2. DOCUMENTACAO... - ler seção (5-10 min)
3. EXEMPLOS_PRATICOS.md - escolher exemplo (5 min)
4. Implementar (10-30 min)

### Para Avançados
1. GUIA_RAPIDO_TEMPLATES.md - Cheat Sheet (1 min)
2. EXEMPLOS_PRATICOS.md - escolher exemplo (2 min)
3. Customizar código (5-60 min)

---

## ❓ Perguntas Comuns

**P: Por onde começar?**  
R: `REFERENCIA_RAPIDA.md` → depois copie um template

**P: Qual componente devo usar?**  
R: Veja fluxograma em `GUIA_RAPIDO_TEMPLATES.md`

**P: Tenho um erro, como faço?**  
R: `DOCUMENTACAO_STORAGE_MEMORIA_RAG.md` → Troubleshooting

**P: Quero ver um agente completo funcionando?**  
R: `EXEMPLOS_PRATICOS.md` → Escolha um exemplo

**P: Como devo organizar meu projeto?**  
R: Veja "Estrutura de Pastas" acima

**P: Isso é para usar em produção?**  
R: Sim! Adapte conforme necessário

---

## 🔗 Índice Rápido de Seções

### Storage (Histórico de Sessões)
- **Guia Completo:** `DOCUMENTACAO...md` → Seção "Storage"
- **Template:** `GUIA_RAPIDO...md` → Template 1
- **Exemplo:** `EXEMPLOS_PRATICOS...md` → Exemplo 1 (parte Storage)

### Memória (Preferências do Usuário)
- **Guia Completo:** `DOCUMENTACAO...md` → Seção "Memória"
- **Template:** `GUIA_RAPIDO...md` → Template 2
- **Exemplo:** `EXEMPLOS_PRATICOS...md` → Exemplo 2

### RAG (Busca em Documentos)
- **Guia Completo:** `DOCUMENTACAO...md` → Seção "RAG"
- **Template:** `GUIA_RAPIDO...md` → Template 3
- **Exemplo:** `EXEMPLOS_PRATICOS...md` → Exemplo 1 (parte RAG)

### Tudo Junto
- **Guia Completo:** `DOCUMENTACAO...md` → Cenário 4
- **Template:** `GUIA_RAPIDO...md` → Template 4
- **Exemplo:** `EXEMPLOS_PRATICOS...md` → Exemplo 3

### Team (Múltiplos Agentes)
- **Guia Completo:** `DOCUMENTACAO...md` → Cenário 5
- **Exemplo:** `EXEMPLOS_PRATICOS...md` → Exemplo 4

---

## 💾 Arquivos Necessários

Para usar esta documentação, você precisa dos 4 arquivos:

- ✅ `REFERENCIA_RAPIDA.md` (este resumo)
- ✅ `GUIA_RAPIDO_TEMPLATES.md` (templates)
- ✅ `DOCUMENTACAO_STORAGE_MEMORIA_RAG.md` (completo)
- ✅ `EXEMPLOS_PRATICOS.md` (código)

Todos devem estar na **raiz do seu projeto**!

---

## 🚀 Próximos Passos

1. **Leia** `REFERENCIA_RAPIDA.md` (você está aqui!)
2. **Escolha** um caminho:
   - Rápido? → `GUIA_RAPIDO_TEMPLATES.md`
   - Detalhado? → `DOCUMENTACAO_STORAGE_MEMORIA_RAG.md`
   - Exemplo? → `EXEMPLOS_PRATICOS.md`
3. **Implemente** seu agente
4. **Customize** conforme necessário
5. **Deploy** quando estiver pronto

---

## 📞 Suporte

Qualquer dúvida:

1. Primeiro: Consulte `REFERENCIA_RAPIDA.md`
2. Depois: Vá para `GUIA_RAPIDO_TEMPLATES.md`
3. Depois: Leia `DOCUMENTACAO_STORAGE_MEMORIA_RAG.md`
4. Depois: Veja `EXEMPLOS_PRATICOS.md`

Se ainda assim não encontrar, as respostas provavelmente estão em:
- **Troubleshooting:** `DOCUMENTACAO...md`
- **Erros Comuns:** `GUIA_RAPIDO...md`
- **FAQ:** `REFERENCIA_RAPIDA.md`

---

## 📄 Versão e Changelog

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Baseado em:** Projetos Agno (Módulo 2, 31_memory, 21_pdf_agent)

### Arquivos Inclusos
- ✅ REFERENCIA_RAPIDA.md (este arquivo)
- ✅ GUIA_RAPIDO_TEMPLATES.md (templates)
- ✅ DOCUMENTACAO_STORAGE_MEMORIA_RAG.md (guia completo)
- ✅ EXEMPLOS_PRATICOS.md (7 exemplos)

### Cobertura
- ✅ Storage (SqliteDb, SqliteStorage)
- ✅ Memória (Memory v2, SqliteMemoryDb)
- ✅ RAG (ChromaDb, Knowledge, PDFKnowledgeBase)
- ✅ Team (múltiplos agentes)
- ✅ Playground (interface web)
- ✅ Troubleshooting (5 problemas)
- ✅ Exemplos (7 agentes completos)

---

## 🎉 Você está Pronto!

**Próximo passo:** Abra `REFERENCIA_RAPIDA.md` e comece!

Ou, se preferir começar rápido: Abra `GUIA_RAPIDO_TEMPLATES.md` e copie o Template 1!

---

**Boa sorte com seus agentes de IA! 🚀**

