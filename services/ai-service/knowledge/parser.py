"""
Parser do arquivo producst.txt: divide em blocos por produto (01, 02, ...).
Cada bloco vira um documento para o RAG (1 chunk = 1 produto).
"""
import re
from pathlib import Path
from typing import Any


def parse_products(txt_path: str | Path) -> list[dict[str, Any]]:
    """
    Lê o arquivo de produtos e retorna uma lista de blocos, um por produto.

    Args:
        txt_path: Caminho para files/producst.txt (ou outro .txt no mesmo formato).

    Returns:
        Lista de dicts com chaves:
        - "text": texto completo do bloco do produto
        - "metadata": dict com product_index, product_name, brand (quando encontrada)
    """
    path = Path(txt_path)
    if not path.exists():
        return []

    content = path.read_text(encoding="utf-8")
    if not content.strip():
        return []

    # Divide em blocos: cada bloco começa com uma linha "NN " (2 dígitos + espaço)
    pattern = re.compile(r"\n(?=\d{2}\s+)", re.MULTILINE)
    parts = pattern.split(content)

    result: list[dict[str, Any]] = []
    for block in parts:
        block = block.strip()
        if not block:
            continue

        # Primeira linha: "01 Nome do produto..." ou "01 Bosch Furadeira..."
        first_line = block.split("\n")[0].strip()
        match = re.match(r"^(\d{2})\s+(.+)$", first_line)
        if not match:
            continue

        product_index = match.group(1)
        product_name = match.group(2).strip()

        # Opcional: extrair marca (linha após "Marca" ou "Nome da marca")
        brand = _extract_brand(block)

        metadata: dict[str, str] = {
            "product_index": product_index,
            "product_name": product_name[:500],  # ChromaDB costuma limitar tamanho
        }
        if brand:
            metadata["brand"] = brand[:200]

        result.append({"text": block, "metadata": metadata})

    return result


def _extract_brand(block: str) -> str:
    """Extrai a marca do bloco (linha após 'Marca' ou 'Nome da marca')."""
    lines = block.split("\n")
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped in ("Marca", "Nome da marca") and i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            if next_line and not next_line.startswith("http"):
                return next_line
    return ""
