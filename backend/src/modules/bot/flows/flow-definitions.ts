import type { BotIntention } from "../intentions";

/**
 * Fluxos por intenção: 1 pergunta por vez, com opções.
 * step 0 = primeira pergunta; ao receber resposta, step 1 = handoff/finalização.
 */
export interface FlowStep {
  message: string;
  /** Se true, após esta mensagem o fluxo encerra (handoff). */
  isFinal?: boolean;
}

/** Fase 3: mensagens em 1–3 linhas, com opções numeradas. */
export const FLOWS: Record<Exclude<BotIntention, "venda_orcamento" | "info" | "politicas" | "menu" | "atendente" | "outros" | "fechar_compra">, FlowStep[]> = {
  suporte: [
    {
      message: "Sobre o que é? 😊\n1) Problema com pedido\n2) Dúvida técnica\n3) Outro",
    },
    {
      message: "Entendi. Vou te passar para um atendente. Tempo médio: alguns minutos.\nSua cidade ou número do pedido (se tiver)?\n*Digite 0 a qualquer momento.*",
      isFinal: true,
    },
  ],
  agendamento: [
    {
      message: "Qual tipo de agendamento?\n1) Visita\n2) Retorno\n3) Entrega",
    },
    // A partir daqui o step é do subfluxo (visita/retorno ou entrega), obtido por getAgendamentoSubStep
  ],
  status_pedido: [
    {
      message: "Me diga o número do pedido ou o telefone/email da compra.\nTe passo para um atendente verificar.\n*Digite 0 para atendente.*",
      isFinal: true,
    },
  ],
};

/** Subfluxo Visita/Retorno: dia → período → cidade → confirmar → criar agendamento. */
export const FLOW_AGENDAMENTO_VISITA: FlowStep[] = [
  { message: "Qual dia? (ex.: amanhã, 25/02)" },
  { message: "Manhã ou tarde?\n1) Manhã\n2) Tarde" },
  { message: "Qual sua cidade ou bairro?" },
  { message: "" }, // Confirma cidade (preenchido em runFlow)
  { message: "Agendamento criado! Em breve um atendente pode confirmar.\n*Digite 0 para atendente.*", isFinal: true },
];

/** Subfluxo Entrega: endereço → CEP → descrição local → dia → hora → itens → confirmar → criar. */
export const FLOW_AGENDAMENTO_ENTREGA: FlowStep[] = [
  { message: "Qual o endereço completo onde vai ser a entrega?" },
  { message: "Qual o CEP?" },
  { message: "Alguma informação do local? (ex.: portaria, bloco A, apto 101)" },
  { message: "Qual dia da entrega? (ex.: amanhã, 25/02)" },
  { message: "Que horário? (ex.: 14h ou 14:30)" },
  { message: "O que vai ser entregue? (ex.: 2x Furadeira, 1x Serra)" },
  { message: "" }, // Confirma (preenchido em runFlow)
  { message: "Agendamento de entrega criado! Em breve um atendente pode confirmar.\n*Digite 0 para atendente.*", isFinal: true },
];

/** Retorna o passo do subfluxo de agendamento (visita/retorno ou entrega). */
export function getAgendamentoSubStep(
  tipo: "visit" | "callback" | "delivery",
  subStepIndex: number,
): FlowStep | null {
  const steps = tipo === "delivery" ? FLOW_AGENDAMENTO_ENTREGA : FLOW_AGENDAMENTO_VISITA;
  if (subStepIndex < 0 || subStepIndex >= steps.length) return null;
  return steps[subStepIndex];
}

export function getAgendamentoConfirmMessage(tipo: "visit" | "callback" | "delivery", data: Record<string, unknown>): string {
  if (tipo === "delivery") {
    const dia = data.dia as string;
    const hora = data.hora as string;
    const endereco = data.endereco as string;
    const cep = data.cep as string;
    const descricao = (data.descricaoLocal as string) || "";
    const itens = data.itensEntrega as string;
    return (
      `Confirma agendamento de *entrega*?\n` +
      `📍 ${endereco}${cep ? ` — CEP ${cep}` : ""}\n` +
      (descricao ? `📝 ${descricao}\n` : "") +
      `📅 ${dia} às ${hora}\n` +
      `📦 ${itens}\n\n1) Sim\n2) Corrigir`
    );
  }
  return ""; // visita/retorno usa CONFIRM_CITY_MESSAGE
}

export function getFlowStep(
  intention: keyof typeof FLOWS,
  step: number,
): FlowStep | null {
  const steps = FLOWS[intention];
  if (!steps || step < 0 || step >= steps.length) return null;
  return steps[step];
}
