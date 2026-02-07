"""
Script para popular o RAG com o catálogo de produtos (producst.txt).
Rodar uma vez ou sempre que o arquivo for atualizado:

  cd services/ai-service && python -m knowledge.load_products_rag
"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Caminhos: raiz = pasta ai-service (parent de knowledge/)
ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_TXT = ROOT / "files" / "producst.txt"
CHROMADB_PATH = ROOT / "tmp" / "chromadb"


def get_vector_db_and_knowledge():
    """Cria ChromaDB e Knowledge reutilizáveis (usado pelo script e pelo agent)."""
    from agno.knowledge.embedder.openai import OpenAIEmbedder
    from agno.knowledge.knowledge import Knowledge
    from agno.vectordb.chroma import ChromaDb

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY não definida no ambiente (.env)")

    CHROMADB_PATH.mkdir(parents=True, exist_ok=True)

    vector_db = ChromaDb(
        collection="produtos_loja",
        path=str(CHROMADB_PATH),
        embedder=OpenAIEmbedder(
            id="text-embedding-3-small",
            api_key=api_key,
        ),
        persistent_client=True,
    )

    knowledge = Knowledge(vector_db=vector_db)
    return vector_db, knowledge


def load_products_into_rag(skip_if_exists: bool = True) -> int:
    """
    Lê producst.txt, parseia por produto e insere no Knowledge.
    Retorna a quantidade de produtos indexados.
    """
    from knowledge.parser import parse_products

    if not PRODUCTS_TXT.exists():
        print(f"Arquivo não encontrado: {PRODUCTS_TXT}")
        return 0

    _, knowledge = get_vector_db_and_knowledge()
    items = parse_products(PRODUCTS_TXT)

    for item in items:
        knowledge.insert(
            text_content=item["text"],
            metadata=item.get("metadata") or {},
            skip_if_exists=skip_if_exists,
        )

    return len(items)


def main():
    print("Carregando catálogo de produtos no RAG...")
    n = load_products_into_rag(skip_if_exists=True)
    print(f"Concluído: {n} produtos indexados.")


if __name__ == "__main__":
    main()
