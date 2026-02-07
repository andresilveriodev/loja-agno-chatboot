"""
Tools do agente: consultam a API do backend (produtos).
As funções são usadas como tools do AGNO; docstrings orientam o modelo.
"""
import os
import httpx

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001").rstrip("/")


def get_products_by_category(category: str) -> str:
    """
    Lista produtos do catálogo por categoria.
    Use quando o cliente perguntar por tipo de produto (ex: furadeiras, geladeiras).
    category: nome da categoria (ex: Ferramentas, Eletrodomésticos, Climatização).
    Retorna uma string com nome, preço e id dos produtos para você recomendar.
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
