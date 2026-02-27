import { Injectable } from "@nestjs/common";
import type { BotIntention } from "./intentions";

/** Par de padrão regex e intenção. Ordem importa: primeiro match ganha. */
const INTENTION_RULES: { pattern: RegExp; intention: BotIntention }[] = [
  { pattern: /\b(atendente|humano|falar\s+com\s+(alguém|alguem)|pessoa\s+real|operador)\b/i, intention: "atendente" },
  { pattern: /^0\s*$/, intention: "atendente" },
  { pattern: /\b(qual\s+valor|quanto\s+custa|preço|preco|orçamento|orcamento|valor\s+do|quero\s+comprar|quero\s+o\s+produto)\b/i, intention: "venda_orcamento" },
  { pattern: /\b(furadeira|serra|freezer|produto|catálogo|catalogo|buscar\s+produto)\b/i, intention: "venda_orcamento" },
  { pattern: /\b(suporte|reclamação|reclamacao|problema|não\s+chegou|defeito|dúvida\s+técnica)\b/i, intention: "suporte" },
  { pattern: /\b(agendar|agendamento|marcar\s+(visita|entrega|reunião)|agendar\s+visita)\b/i, intention: "agendamento" },
  { pattern: /\b(status\s+do\s+pedido|rastrear|onde\s+está\s+meu\s+pedido|número\s+do\s+pedido)\b/i, intention: "status_pedido" },
  { pattern: /\b(endereço|endereco|onde\s+fica|horário|horario|que\s+horas\s+abre|funcionamento)\b/i, intention: "info" },
  { pattern: /\b(garantia|troca|devolução|política\s+de)\b/i, intention: "politicas" },
];

/** Quando a última mensagem do bot foi o menu, interpretar dígito como escolha. */
const MENU_CHOICE_TO_INTENTION: Record<string, BotIntention> = {
  "1": "venda_orcamento",
  "2": "agendamento",
  "3": "suporte",
  "4": "info",
  "5": "status_pedido",
};

@Injectable()
export class IntentionClassifierService {
  /**
   * Classifica a intenção do usuário a partir do texto.
   * Se `lastBotMessage` for a mensagem de menu (contém "1) Orçamento"), interpreta "1"-"5" e "0" como escolha.
   */
  classify(text: string, lastBotMessage?: string | null): BotIntention {
    const t = (text || "").trim();
    if (!t) return "outros";

    const isMenuReply = lastBotMessage?.includes("1) Orçamento") ?? false;
    if (isMenuReply && /^[0-5]\s*$/.test(t)) {
      const choice = t.replace(/\s/g, "");
      if (choice === "0") return "atendente";
      const mapped = MENU_CHOICE_TO_INTENTION[choice];
      if (mapped) return mapped;
    }

    const lower = t.toLowerCase();
    if (/^(oi|olá|ola|menu|opções|opcoes|começar|comecar)\s*$/i.test(lower)) {
      return "menu";
    }

    for (const { pattern, intention } of INTENTION_RULES) {
      if (pattern.test(t)) return intention;
    }

    return "outros";
  }

  /** Indica se a última mensagem do bot era o menu (para interpretar "1"-"5"). */
  isMenuMessage(botMessage: string): boolean {
    return (botMessage || "").includes("1) Orçamento");
  }
}
