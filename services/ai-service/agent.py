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

from tools import get_products_by_category, get_product_details

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
- Analise a mensagem e identifique: necessidade principal, categoria de produto, urgência e budget quando possível.
- Responda de forma consultiva e amigável."""
if knowledge:
    _instructions += """
- Você tem acesso a uma base de conhecimento com informações detalhadas dos produtos (nome, preço, especificações, descrição). Use-a para responder dúvidas sobre produtos, comparar opções e dar detalhes."""
_instructions += """
- Use as ferramentas get_products_by_category e get_product_details para listar produtos por categoria ou buscar detalhes por id quando o cliente pedir sugestões ou quiser ver o catálogo.
- Categorias disponíveis: Ferramentas, Eletrodomésticos, Climatização, Móveis, Iluminação, Jardim, Esportes, Automotivo, Eletrônicos.
- Se o cliente não souber o que quer, faça perguntas para entender a necessidade e depois sugira categorias ou produtos."""

_agent_kwargs: dict = {
    "name": "Assistente de Vendas",
    "model": OpenAIChat(id=model_id),
    "tools": [get_products_by_category, get_product_details],
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
