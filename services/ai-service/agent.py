"""
Agente AGNO: qualificação + vendas, com Storage, Memory, RAG e Tools.
"""
import os
from dotenv import load_dotenv

load_dotenv()

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
from agno.memory import MemoryManager

from tools import get_products_by_category, get_product_details, search_products

# Storage: histórico da sessão (e base para memória)
db = SqliteDb(db_file=os.getenv("STORAGE_DB", "tmp/loja_data.db"))

# Memory: lembrar do usuário entre sessões (API AGNO 2.4)
model_id = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
memory_manager = MemoryManager(model=OpenAIChat(id=model_id), db=db)

# RAG: opcional — usa base de conhecimento se chromadb estiver instalado e OPENAI_API_KEY definida
knowledge = None
try:
    from knowledge.load_products_rag import get_vector_db_and_knowledge
    _, knowledge = get_vector_db_and_knowledge()
except (ImportError, ValueError):
    pass  # Serviço sobe sem RAG; instale chromadb no venv do ai-service para ativar

_instructions = """Você é um assistente de vendas que qualifica clientes e recomenda produtos.
- Analise a mensagem e identifique: necessidade principal, tipo de produto, marca, urgência e orçamento quando possível.
- Responda de forma consultiva e amigável.

Regra obrigatória de busca:
- Quando o cliente pedir um TIPO de produto (furadeira, freezer, parafusadeira), uma MARCA (Bosch, etc.) ou uma necessidade (220v, profissional, obra), use SEMPRE a ferramenta search_products com esse termo. NUNCA use get_products_by_category para isso — a busca por categoria usa nomes exatos e não encontra furadeiras quando o cliente diz "furadeira".
- get_products_by_category use apenas se o cliente disser literalmente "produtos da categoria X" ou "listar categoria Y".

Fluxo de busca de produto:
1. Cliente pede produto (ex: "quero uma furadeira", "quero da marca Bosch") → chame search_products("furadeira") ou search_products("Bosch") na mesma resposta ou na próxima, e depois apresente as opções. Faça perguntas de qualificação apenas quando o catálogo tiver opções que justifiquem (ex.: perguntar 110V vs 220V só se houver produtos com as duas voltagens; sugerir tamanhos só se houver dois ou mais produtos similares).
2. Apresente as opções: nome, preço, id. Exemplo: "Encontrei X opções: [liste]. Quer detalhes de alguma?"
3. Para detalhes de um produto, use get_product_details(id).

- search_products(termo): busca em TODO o catálogo por nome, marca ou característica. Use para furadeira, Bosch, freezer, 220v, profissional, etc.
- get_product_details(id): detalhes de um produto já listado.
- get_products_by_category: só quando o cliente pedir explicitamente "categoria X" (nome exato da categoria).

Regras de qualificação e sugestões (respeite o que existe no catálogo):
- Voltagem (110V/220V): só pergunte ou sugira opções de voltagem se o resultado da busca já tiver produtos com voltagens diferentes. Se todos os produtos encontrados forem da mesma voltagem (ex.: só 220V), NÃO pergunte "prefere 110V ou 220V?". Em vez disso, diga para que o produto é ideal e cite as especificações técnicas (potência, voltagem, uso recomendado).
- Alternativas (tamanho, marca, outro modelo): só sugira alternativas (ex.: "temos freezer pequeno e grande", "outras marcas") quando a busca tiver retornado dois ou mais produtos daquele tipo. Se retornou apenas um produto, NÃO sugira "outras opções" ou "outras marcas"; apresente esse produto e destaque uso ideal e especificações.

Se o cliente já disse o que quer (ex: furadeira) e depois responde à sua pergunta (ex: "uso profissional"), busque com search_products usando o termo do produto que ele pediu (ex: search_products("furadeira")), nunca com get_products_by_category."""
if knowledge:
    _instructions += """
- Você tem acesso a uma base de conhecimento com informações dos produtos. Use-a para enriquecer respostas e comparar opções."""

_agent_kwargs: dict = {
    "name": "Assistente de Vendas",
    "model": OpenAIChat(id=model_id),
    "tools": [search_products, get_product_details, get_products_by_category],
    "db": db,
    "memory_manager": memory_manager,
    "add_history_to_context": True,
    "num_history_runs": 5,
    "enable_agentic_memory": True,
    "instructions": _instructions,
    "markdown": True,
}
if knowledge is not None:
    _agent_kwargs["knowledge"] = knowledge
    _agent_kwargs["add_knowledge_to_context"] = True

agent = Agent(**_agent_kwargs)


def chat(message: str, session_id: str, user_id: str) -> str:
    """Envia mensagem ao agente e retorna o texto da resposta."""
    try:
        result = agent.run(
            message,
            session_id=session_id,
            user_id=user_id or session_id,
        )
        content = result.content
        if content is None:
            return "Desculpe, não consegui gerar uma resposta agora. Tente novamente."
        return str(content).strip()
    except Exception as e:
        return f"Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente. ({e!s})"


def run_terminal_chat():
    """Conversa interativa no terminal com respostas em markdown."""
    from rich.console import Console
    from rich.markdown import Markdown
    from rich.panel import Panel

    console = Console()
    session_id = "terminal-session"
    user_id = "terminal-user"

    console.print(
        Panel(
            "[bold green]Assistente de Vendas (AGNO)[/bold green]\n"
            "Digite sua mensagem e pressione Enter. [dim]sair[/dim] ou [dim]quit[/dim] para encerrar.",
            title="Chat no terminal",
            border_style="green",
        )
    )
    console.print()

    while True:
        try:
            user_input = console.input("[bold blue]Você:[/bold blue] ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("sair", "quit", "exit"):
                console.print("[dim]Até logo![/dim]")
                break

            result = agent.run(
                user_input,
                session_id=session_id,
                user_id=user_id,
            )
            content = result.content
            if content:
                console.print(Panel(Markdown(str(content)), title="Assistente", border_style="cyan"))
            else:
                console.print("[yellow]Sem resposta.[/yellow]")
            console.print()
        except KeyboardInterrupt:
            console.print("\n[dim]Encerrado.[/dim]")
            break
        except Exception as e:
            console.print(f"[red]Erro: {e}[/red]\n")


if __name__ == "__main__":
    run_terminal_chat()
