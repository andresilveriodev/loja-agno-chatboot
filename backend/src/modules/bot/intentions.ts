/**
 * Intenções do bot (Fase 2). Usado pelo classificador e pelos fluxos.
 */
export type BotIntention =
  | "venda_orcamento"
  | "suporte"
  | "agendamento"
  | "status_pedido"
  | "info"
  | "politicas"
  | "atendente"
  | "menu"
  | "fechar_compra"
  | "outros";

/** Mensagem de saudação inicial ao iniciar a conversa. */
export const MENU_MESSAGE = `Oi! Aqui é o Alé, o assistente virtual da Loja Multidepartamental! 😊
Temos produtos nas áreas de Ferramentas, Energia, Jardinagem, Climatização, Cozinha Industrial, EPIs, Materiais, Armazenagem e Automação.
Em que posso te ajudar hoje?`;

/** Resposta handoff (Fase 3: 1–3 linhas + opção). */
export const ATENDENTE_MESSAGE =
  "Vou te passar para um atendente. Tempo médio: alguns minutos.\nPode me dizer sua cidade ou o produto de interesse?\n*Digite 0 a qualquer momento.*";
