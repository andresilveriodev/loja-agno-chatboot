"""
Tools do agente: consultam a API do backend (produtos).
As funções são usadas como tools do AGNO; docstrings orientam o modelo.
"""
import os
import httpx

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001").rstrip("/")


def search_products(query: str) -> str:
    """
    Busca produtos em todo o catálogo por nome, tipo, marca ou característica.
    Use quando o cliente mencionar um produto (ex: furadeira, freezer), uma marca (ex: Bosch)
    ou uma necessidade (ex: 220v, profissional). A busca é por texto em todas as categorias.
    query: termo de busca (ex: furadeira, Bosch, freezer restaurante, 220v).
    Retorna uma string com nome, preço e id dos produtos para você recomendar.
    """
    if not (query or "").strip():
        return "Informe um termo de busca (ex: furadeira, Bosch, freezer)."
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(
                f"{BACKEND_URL}/api/products",
                params={"search": query.strip()},
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        return f"Erro ao buscar produtos: {e}"

    if not data:
        return f"Nenhum produto encontrado para '{query.strip()}'."

    lines = []
    for p in data:
        price = p.get("price", 0)
        lines.append(
            f"- {p.get('name', '?')} (id: {p.get('id', '?')}) - R$ {price:,.2f}"
        )
    return f"Produtos encontrados para '{query.strip()}':\n" + "\n".join(lines)


def get_products_by_category(category: str) -> str:
    """
    Lista produtos por nome exato da categoria. Use SOMENTE quando o cliente pedir
    explicitamente "produtos da categoria X" ou "tudo da categoria Y".
    NÃO use para tipo de produto (furadeira, freezer, Bosch): para isso use search_products.
    category: nome exato da categoria no catálogo (ex: Ferramentas & Máquinas Profissionais).
    """
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(f"{BACKEND_URL}/api/products", params={"category": category})
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        return f"Erro ao buscar produtos por categoria: {e}"

    if not data:
        return f"Nenhum produto encontrado na categoria '{category}'."

    lines = []
    for p in data:
        price = p.get("price", 0)
        lines.append(f"- {p.get('name', '?')} (id: {p.get('id', '?')}) - R$ {price:,.2f}")
    return f"Produtos em {category}:\n" + "\n".join(lines)


def get_product_details(product_id: str) -> str:
    """
    Retorna detalhes de um produto pelo id (nome, preço, descrição, especificações).
    Use quando o cliente quiser saber mais sobre um produto específico.
    product_id: id do produto (ex: o id retornado por get_products_by_category).
    """
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(f"{BACKEND_URL}/api/products/{product_id}")
            r.raise_for_status()
            p = r.json()
    except Exception as e:
        return f"Erro ao buscar produto: {e}"

    parts = [
        f"Nome: {p.get('name', '?')}",
        f"Preço: R$ {p.get('price', 0):,.2f}",
        f"Descrição: {p.get('description', '')}",
        f"Especificações: {p.get('specs', '')}",
    ]
    if p.get("features"):
        parts.append("Destaques: " + ", ".join(p["features"]))
    return "\n".join(parts)
