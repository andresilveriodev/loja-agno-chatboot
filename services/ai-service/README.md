# AI Service (AGNO) - Loja Multidepartamental

Serviço de IA baseado em AGNO para o chat da loja. Expõe `POST /chat` e usa Storage + Memory + **RAG** (catálogo em `files/producst.txt`) + Tools (produtos via backend).

## Pré-requisitos

- **Python 3.12 ou 3.13** (obrigatório para o RAG: ChromaDB não funciona com Python 3.14). Se aparecer "No runtime installed that matches 3.12", instale: `py install 3.12` (Windows) ou baixe em [python.org](https://www.python.org/downloads/).
- Backend da loja rodando em `http://localhost:3001` (para as tools de produtos)

## Setup (primeira vez)

1. **Criar e configurar o `.env`**  
   O arquivo `.env` já existe; edite e coloque sua chave OpenAI:
   ```bash
   # OPENAI_API_KEY=sk-proj-sua-chave-aqui  → substitua pela sua chave
   # BACKEND_URL e PORT já vêm preenchidos
   ```

2. **Instalar dependências**
   Use **um único** ambiente virtual para o projeto. O venv deve ser **Python 3.12 ou 3.13** (ChromaDB não funciona com Python 3.14). No Windows, se tiver várias versões: `py -3.12 -m venv .venv`.

   **Opção A – Venv na raiz do projeto** (recomendado). O `requirements.txt` fica em `services/ai-service/`:
   ```bash
   cd "C:\...\Loja multidepartamental"
   py -3.12 -m venv .venv
   .venv\Scripts\activate
   pip install -r services/ai-service/requirements.txt
   cd services/ai-service
   python main.py
   ```

   **Opção B – Venv só do ai-service** (aqui o `requirements.txt` está na pasta atual):
   ```bash
   cd services/ai-service
   py -3.12 -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
   No Windows, use `python -m pip` se `pip` não for reconhecido. Se aparecer `ConfigError: chroma_server_nofile` ou aviso Pydantic + Python 3.14, recrie o venv com Python 3.12 ou 3.13.

3. **Ter o backend rodando**  
   As tools consultam produtos em `BACKEND_URL`. Suba o backend antes:
   ```bash
   cd backend && npm run start:dev
   ```

4. **Indexar o catálogo no RAG (recomendado)**  
   Para o agente usar a base de conhecimento com detalhes dos produtos, rode uma vez (e sempre que atualizar `files/producst.txt`):
   ```bash
   cd services/ai-service
   python -m knowledge.load_products_rag
   ```
   É necessário `OPENAI_API_KEY` no `.env` (embeddings). O índice fica em `tmp/chromadb/`.

5. **Se aparecer `ModuleNotFoundError: chromadb`**  
   O `python` em uso não é o do venv onde você instalou. Use o mesmo terminal (e o mesmo `activate`) para rodar o script. Se tiver dois venvs (raiz e ai-service), instale chromadb no venv que o `python` está usando.

6. **Se aparecer `ConfigError: chroma_server_nofile` ou aviso "Pydantic V1 ... Python 3.14"**  
   O ChromaDB não é compatível com **Python 3.14**. Instale Python 3.12 (`py install 3.12` no Windows) e recrie o venv (veja item 7 se der Permission denied).

7. **Se aparecer `Permission denied` ao criar/instalar no venv ou `ModuleNotFoundError: pydantic_core._pydantic_core`**  
   O `.venv` antigo pode estar em uso ou misturado (Python 3.14 + 3.12). Faça um venv limpo:
   - Feche **todos** os terminais que tenham o venv ativado (e o Cursor, se estiver usando a pasta do projeto).
   - Apague a pasta `.venv`: no Explorador de Arquivos, em `Loja multidepartamental`, exclua a pasta `.venv`.
   - Abra um **novo** PowerShell na raiz do projeto e rode:
   ```powershell
   cd "C:\Users\ilumi\Desktop\André\Portfolio IA\Loja multidepartamental"
   py -3.12 -m venv .venv
   .venv\Scripts\activate
   pip install -r services/ai-service/requirements.txt
   cd services/ai-service
   python -m knowledge.load_products_rag
   ```

## Rodar

```bash
python main.py
# Ou: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Health: http://localhost:8000/health  
- OpenAPI: http://localhost:8000/docs  

## Chat no terminal (markdown)

Para conversar com o agente direto no terminal, com respostas formatadas em markdown:

```bash
python agent.py
```

Digite suas mensagens e pressione Enter. Use **sair**, **quit** ou **exit** para encerrar. O backend deve estar rodando em `BACKEND_URL` para as tools de produtos funcionarem.

## Contrato

**POST /chat**

- Body: `{ "message": "...", "sessionId": "...", "userId": "..." }`
- Response: `{ "reply": "..." }`

O backend NestJS chama este endpoint quando o usuário envia mensagem no chat. Se `AI_SERVICE_URL` não estiver configurado, o backend usa resposta de fallback.
