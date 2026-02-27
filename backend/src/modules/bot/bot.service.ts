import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { ChatService } from "../chat/chat.service";
import { CrmService } from "../crm/crm.service";
import { ProductsService } from "../products/products.service";
import {
  KnowledgeBaseService,
  SensitiveClaimType,
} from "../knowledge-base/knowledge-base.service";
import { IntentionClassifierService } from "./intention-classifier.service";
import {
  validateCity,
  validateCEP,
  formatCEP,
  isConfirmationYes,
  isConfirmationNo,
  CONFIRM_CITY_MESSAGE,
  INVALID_CITY_MESSAGE,
  parseScheduleDay,
  parseScheduleTime,
  buildScheduledAtFromDayAndPeriod,
  buildScheduledAtFromDayAndTime,
  type ParsedScheduleDate,
} from "./data-collection";
import type { BotIntention } from "./intentions";
import { MENU_MESSAGE, ATENDENTE_MESSAGE } from "./intentions";
import {
  getBotSession,
  setBotSession,
  updateBotSession,
  clearBotSession,
  getVerMais,
  setVerMais,
  clearVerMais,
  getLastProductIdForSession,
  setLastProductIdForSession as setLastProductIdInStore,
} from "./bot-session.store";
import {
  getFlowStep,
  getAgendamentoSubStep,
  getAgendamentoConfirmMessage,
  FLOWS,
} from "./flows/flow-definitions";
import { isVerMaisRequest, shortWithVerMais } from "./response-style";

/** Resposta do orquestrador: texto a enviar e se veio da base (anti-alucinação). */
export interface BotReplyResult {
  reply: string;
  fromBase: boolean;
}

/** Mensagem quando usuário confirma agendamento mas não há leadId (canal não identificou contato). Dispara handoff no CRM. */
const AGENDAMENTO_SEM_LEAD_MESSAGE =
  "Para concluir o agendamento preciso do seu contato. Vou te passar para um atendente. Tempo médio: alguns minutos.\n*Digite 0 para atendente.*";

/** Padrões para detectar pergunta sobre tema sensível (evitar invenção). */
const SENSITIVE_PATTERNS: { pattern: RegExp; type: SensitiveClaimType }[] = [
  { pattern: /\b(horário|horario|funcionamento|abre|fecha|atendimento)\b/i, type: "horario" },
  { pattern: /\b(endereço|endereco|onde fica|localização|cep)\b/i, type: "endereco" },
  { pattern: /\b(prazo|entrega|demora|quanto tempo|chega quando)\b/i, type: "prazo" },
  { pattern: /\b(garantia|troca|devolução|reembolso|política)\b/i, type: "garantia" },
];

/** Detecta intenção de comprar/fechar quando a última mensagem do bot tinha produto em contexto. */
const FECHAR_COMPRA_USER_REGEX =
  /\b(quero\s+fechar|fechar\s+esse|fechar\s+o\s+produto|fechar\s+esse\s+produto|quero\s+compr(ar|a)|sim\s+quero\s+compra|quero\s+esse|vou\s+levar|levar\s+esse|comprar\s+esse)\b/i;
const PRODUCT_ID_REGEX = /\bprod_\d+\b/i;

/** Mensagem final do fluxo fechar compra: agendamento e pedido gravados, handoff para pagamento. */
const FECHAR_COMPRA_HANDOFF_MESSAGE =
  "Agendamento de entrega e pedido anotados! 💚 Pagamento pendente.\nVou te passar para um atendente finalizar o pagamento. Tempo médio: alguns minutos.\n*Digite 0 a qualquer momento.*";

@Injectable()
export class BotService {
  constructor(
    private readonly aiService: AiService,
    private readonly knowledgeBase: KnowledgeBaseService,
    private readonly chatService: ChatService,
    private readonly crmService: CrmService,
    private readonly productsService: ProductsService,
    private readonly intentionClassifier: IntentionClassifierService,
  ) {}

  /**
   * Gera a resposta do bot: menu/intenção (Fase 2), base de conhecimento (Fase 1), fluxos, ou IA.
   * @param leadId Obrigatório para persistir agendamento no CRM. Canais (ex.: WhatsApp) devem
   *        sempre passar o lead identificado para que visita/retorno/entrega sejam gravados em schedules.
   */
  async getReply(
    message: string,
    sessionId: string,
    userId?: string,
    leadId?: string,
  ): Promise<BotReplyResult> {
    const text = (message || "").trim();
    // Fase 3: "ver mais" sob demanda
    if (isVerMaisRequest(text)) {
      const fullText = getVerMais(sessionId);
      if (fullText) {
        clearVerMais(sessionId);
        return { reply: fullText, fromBase: true };
      }
    }

    const lastBotMessage = await this.getLastBotMessage(sessionId);
    const state = getBotSession(sessionId);

    // Fluxo "fechar compra": já está no fluxo ou usuário disse "quero comprar/fechar" com produto no contexto
    if (state?.intention === "fechar_compra") {
      const flowReply = await this.runFecharCompraFlow(sessionId, text, leadId);
      if (flowReply) return flowReply;
    } else if (FECHAR_COMPRA_USER_REGEX.test(text)) {
      // Produto em contexto: store (controller), última mensagem, histórico ou inferência por nome
      let productId: string | null = getLastProductIdForSession(sessionId);
      if (!productId && lastBotMessage && PRODUCT_ID_REGEX.test(lastBotMessage)) {
        const match = lastBotMessage.match(PRODUCT_ID_REGEX);
        productId = match ? match[0].toLowerCase() : null;
      }
      if (!productId) {
        productId = await this.getLastProductIdFromHistory(sessionId);
      }
      if (!productId && lastBotMessage) {
        productId = await this.getLastProductIdByInference(lastBotMessage);
      }
      if (productId) {
        const product = await this.productsService.findById(productId);
        if (product) {
          const price = Number(product.price) ?? 0;
          const priceStr = price.toFixed(2).replace(".", ",");
          setBotSession(sessionId, "fechar_compra", 0, {
            productId,
            productName: product.name,
            price,
          });
          return {
            reply: `Ótimo! 😊 O *${product.name}* está R$ ${priceStr}.\n\nVou anotar o agendamento de entrega e depois te passo para um atendente finalizar o pagamento.\n\n*Qual o endereço completo de entrega?*`,
            fromBase: true,
          };
        }
      }
    }

    const intention = this.intentionClassifier.classify(text, lastBotMessage);

    // Pedido explícito de atendente
    if (intention === "atendente") {
      clearBotSession(sessionId);
      return { reply: ATENDENTE_MESSAGE, fromBase: true };
    }

    // Menu: primeira interação ou "oi" / "menu" / "opções"
    if (intention === "menu" || (intention === "outros" && !lastBotMessage && text.length < 30)) {
      const trimmed = text.toLowerCase().trim();
      if (!trimmed || /^(oi|olá|ola|menu|opções|opcoes|começar|comecar)$/i.test(trimmed)) {
        return { reply: MENU_MESSAGE, fromBase: true };
      }
    }

    // Escolha do menu (1-5) já tratada no classifier; aqui intention já é venda_orcamento, agendamento, etc.
    // Fluxos: suporte, agendamento, status_pedido
    const flowIntentions: BotIntention[] = ["suporte", "agendamento", "status_pedido"];
    if (flowIntentions.includes(intention)) {
      const flowReply = await this.runFlow(
        sessionId,
        intention as "suporte" | "agendamento" | "status_pedido",
        text,
        leadId,
      );
      if (flowReply) return flowReply;
    }

    // info / politicas: base de conhecimento (Fase 1 + Fase 3 ver mais)
    if (intention === "info" || intention === "politicas") {
      const baseReply = await this.replyFromBase(text, sessionId);
      if (baseReply) return baseReply;
    }

    // venda_orcamento ou outros: IA (produtos, orçamento)
    clearBotSession(sessionId);
    const aiResult = await this.aiService.chat({
      message: text,
      sessionId,
      userId: userId ?? sessionId,
    });

    const reply =
      aiResult?.reply?.trim() ||
      "Assistente temporariamente indisponível. Tente em instantes.\n*Digite 0 para atendente.*";

    return { reply, fromBase: false };
  }

  private async getLastBotMessage(sessionId: string): Promise<string | null> {
    const history = await this.chatService.getHistory(sessionId);
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i]?.sender === "bot" && history[i]?.content) {
        return history[i].content;
      }
    }
    return null;
  }

  /** Retorna o último product ID (prod_xxx) encontrado no histórico da sessão, para contexto de compra. */
  private async getLastProductIdFromHistory(sessionId: string): Promise<string | null> {
    const history = await this.chatService.getHistory(sessionId);
    for (let i = history.length - 1; i >= 0; i--) {
      const content = history[i]?.content;
      if (content && PRODUCT_ID_REGEX.test(content)) {
        const match = content.match(PRODUCT_ID_REGEX);
        return match ? match[0].toLowerCase() : null;
      }
    }
    return null;
  }

  /**
   * Infere o produto pela última mensagem do bot quando não há prod_xxx no histórico.
   * Ex.: "Aqui estão os detalhes da *Bosch Furadeira de Impacto...*" → match por nome do produto.
   */
  private async getLastProductIdByInference(lastBotMessage: string): Promise<string | null> {
    if (!lastBotMessage || lastBotMessage.length < 5) return null;
    const msg = lastBotMessage.replace(/\*/g, "").toLowerCase();
    const products = await this.productsService.findAll();
    let best: { id: string; nameLen: number } | null = null;
    const MIN_NAME_LEN = 10;
    for (const p of products) {
      const name = (p.name || "").trim();
      if (name.length < MIN_NAME_LEN) continue;
      const nameNorm = name.toLowerCase();
      const matchFull = msg.includes(nameNorm);
      const matchStart = name.length >= 15 && msg.includes(nameNorm.slice(0, 15));
      if (matchFull || matchStart) {
        if (!best || name.length > best.nameLen) {
          best = { id: p.id, nameLen: name.length };
        }
      }
    }
    return best ? best.id : null;
  }

  /** Registra o último produto em contexto (chamado pelo controller quando envia imagem do produto). */
  setLastProductIdForSession(sessionId: string, productId: string): void {
    setLastProductIdInStore(sessionId, productId);
  }

  /**
   * Fluxo "fechar compra": coleta endereço, dia/hora entrega, quantidade, mais produtos?, nota fiscal;
   * na confirmação cria Schedule (entrega) e Order (pagamento pendente) e encerra com handoff.
   */
  private async runFecharCompraFlow(
    sessionId: string,
    userText: string,
    leadId?: string,
  ): Promise<BotReplyResult | null> {
    const state = getBotSession(sessionId);
    if (!state || state.intention !== "fechar_compra") return null;

    const step = state.step;
    const data = state.data;

    // Step 0: endereço
    if (step === 0) {
      const endereco = userText.trim();
      if (endereco.length < 5) {
        return { reply: "Endereço muito curto. Pode digitar o endereço completo?", fromBase: true };
      }
      updateBotSession(sessionId, { step: 1, data: { ...data, endereco } });
      return { reply: "Qual o *CEP*? (8 números)", fromBase: true };
    }

    // Step 1: CEP
    if (step === 1) {
      if (!validateCEP(userText)) {
        return { reply: "CEP inválido. Digite 8 números (ex.: 01310100 ou 01310-100).", fromBase: true };
      }
      const cep = formatCEP(userText) ?? userText.replace(/\D/g, "").slice(0, 8);
      updateBotSession(sessionId, { step: 2, data: { ...data, cep } });
      return { reply: "Qual *dia* da entrega? (ex.: amanhã, 25/02)", fromBase: true };
    }

    // Step 2: dia
    if (step === 2) {
      const parsed = parseScheduleDay(userText);
      if (!parsed) {
        return { reply: "Não entendi o dia. Pode digitar ex.: amanhã ou 25/02?", fromBase: true };
      }
      updateBotSession(sessionId, {
        step: 3,
        data: { ...data, dia: userText.trim(), diaParsed: parsed },
      });
      return { reply: "Qual *horário* da entrega? (ex.: 14h ou 14:30)", fromBase: true };
    }

    // Step 3: hora
    if (step === 3) {
      const time = parseScheduleTime(userText);
      if (!time) {
        return { reply: "Não entendi o horário. Pode digitar ex.: 14h ou 14:30?", fromBase: true };
      }
      const horaStr = `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
      updateBotSession(sessionId, {
        step: 4,
        data: { ...data, hora: horaStr, horaParsed: time },
      });
      return {
        reply: "Qual a *quantidade* desse produto? (digite o número)",
        fromBase: true,
      };
    }

    // Step 4: quantidade
    if (step === 4) {
      const qty = parseInt(userText.replace(/\D/g, ""), 10);
      if (!Number.isFinite(qty) || qty < 1) {
        return { reply: "Digite a quantidade (número maior que 0).", fromBase: true };
      }
      const quantity = Math.min(qty, 999);
      const price = (data.price as number) ?? 0;
      const totalProd = price * quantity;
      updateBotSession(sessionId, {
        step: 5,
        data: { ...data, quantity, totalProd },
      });
      return {
        reply: `Anotado: ${quantity} un. = R$ ${totalProd.toFixed(2).replace(".", ",")}.\n\nQuer *adicionar mais algum produto*? (sim/não)`,
        fromBase: true,
      };
    }

    // Step 5: mais produtos?
    if (step === 5) {
      const t = userText.trim().toLowerCase();
      const maisProdutos = /^(sim|s|1)$/i.test(t);
      const totalProd = (data.totalProd as number) ?? 0;
      updateBotSession(sessionId, {
        step: 6,
        data: { ...data, maisProdutos },
      });
      const totalStr = totalProd.toFixed(2).replace(".", ",");
      return {
        reply: maisProdutos
          ? `Certo! Um atendente pode incluir na hora do pagamento.\n\n*Valor deste item:* R$ ${totalStr}.\nPrecisa de *nota fiscal*? (sim/não)`
          : `*Valor total:* R$ ${totalStr}.\nPrecisa de *nota fiscal*? (sim/não)`,
        fromBase: true,
      };
    }

    // Step 6: nota fiscal?
    if (step === 6) {
      const t = userText.trim().toLowerCase();
      const notaFiscal = /^(sim|s|1)$/i.test(t);
      updateBotSession(sessionId, {
        step: 7,
        data: { ...data, notaFiscal },
      });
      const endereco = (data.endereco as string) || "";
      const cep = (data.cep as string) || "";
      const dia = (data.dia as string) || "";
      const hora = (data.hora as string) || "";
      const quantity = (data.quantity as number) ?? 1;
      const productName = (data.productName as string) || "Produto";
      const totalProd = (data.totalProd as number) ?? 0;
      const totalStr = totalProd.toFixed(2).replace(".", ",");
      const confirmMsg =
        `Confirma agendamento de *entrega*?\n\n` +
        `📍 ${endereco}${cep ? ` — CEP ${cep}` : ""}\n` +
        `📅 ${dia} às ${hora}\n` +
        `📦 ${quantity}x ${productName} — R$ ${totalStr}\n` +
        `📄 Nota fiscal: ${notaFiscal ? "Sim" : "Não"}\n\n1) Sim\n2) Corrigir`;
      return { reply: confirmMsg, fromBase: true };
    }

    // Step 7: confirmação
    if (step === 7) {
      if (isConfirmationNo(userText)) {
        updateBotSession(sessionId, { step: 0, data: { productId: data.productId, productName: data.productName, price: data.price } });
        return {
          reply: "Sem problemas. Qual o *endereço completo* de entrega?",
          fromBase: true,
        };
      }
      if (!isConfirmationYes(userText)) {
        return { reply: "Responda 1) Sim ou 2) Corrigir.", fromBase: true };
      }

      if (!leadId) {
        clearBotSession(sessionId);
        return { reply: AGENDAMENTO_SEM_LEAD_MESSAGE, fromBase: true };
      }

      const diaParsed = data.diaParsed as ParsedScheduleDate | undefined;
      const horaParsed = data.horaParsed as { hour: number; minute: number } | undefined;
      const productId = data.productId as string;
      const productName = (data.productName as string) || "Item";
      const price = (data.price as number) ?? 0;
      const quantity = (data.quantity as number) ?? 1;
      const endereco = (data.endereco as string) || "";
      const cep = (data.cep as string) || "";

      if (!diaParsed || !horaParsed) {
        clearBotSession(sessionId);
        return {
          reply: "Não consegui gravar a data/hora. Vou te passar para um atendente.\n*Digite 0 para atendente.*",
          fromBase: true,
        };
      }

      try {
        const scheduledAt = buildScheduledAtFromDayAndTime(diaParsed, horaParsed);
        const itensDesc = `${quantity}x ${productName}`;
        await this.crmService.createSchedule({
          leadId,
          type: "delivery",
          scheduledAt,
          title: "Entrega",
          description: `Pedido: ${itensDesc}. Pagamento pendente.`,
          address: endereco,
          cep: cep || undefined,
          deliveryItems: itensDesc,
        });
        const totalProd = price * quantity;
        await this.crmService.createOrder({
          leadId,
          items: [{ productId, name: productName, quantity, unitPrice: price }],
          paymentMethod: "pix",
          paymentStatus: "pending",
          discount: 0,
          shippingAddress: {
            street: endereco,
            number: "S/N",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: cep || "",
          },
        });
        await this.crmService.updateLead(leadId, { intent: "fechar_compra" });
      } catch (err) {
        console.warn("[Bot] Erro ao gravar agendamento/pedido fechar compra:", err);
      }
      clearBotSession(sessionId);
      return { reply: FECHAR_COMPRA_HANDOFF_MESSAGE, fromBase: true };
    }

    return null;
  }

  private async runFlow(
    sessionId: string,
    intention: "suporte" | "agendamento" | "status_pedido",
    userText: string,
    leadId?: string,
  ): Promise<BotReplyResult | null> {
    const state = getBotSession(sessionId);
    const steps = FLOWS[intention];
    if (!steps) return null;

    if (!state || state.intention !== intention) {
      // Se pediu agendamento e já mencionou "entrega", inicia direto no fluxo de entrega (endereço → CEP → descrição → dia → hora → itens → criar agendamento)
      const isEntrega =
        intention === "agendamento" &&
        /\b(entrega|entregar)\b/i.test(userText.trim());
      if (isEntrega) {
        setBotSession(sessionId, intention, 1, { tipo: "delivery" });
        const firstDeliveryStep = getAgendamentoSubStep("delivery", 0);
        return firstDeliveryStep?.message ? { reply: firstDeliveryStep.message, fromBase: true } : null;
      }
      setBotSession(sessionId, intention, 0, {});
      const step0 = getFlowStep(intention, 0);
      if (step0?.message) {
        if (step0.isFinal) clearBotSession(sessionId);
        return { reply: step0.message, fromBase: true };
      }
      return null;
    }

    const currentStepIndex = state.step;
    const currentStep = getFlowStep(intention, currentStepIndex);
    if (!currentStep) return null;

    if (intention === "agendamento") {
      const tipo = state.data.tipo as "visit" | "callback" | "delivery" | undefined;
      const subStepIndex = currentStepIndex >= 1 ? currentStepIndex - 1 : -1;

      // Step 0: escolha do tipo (Visita, Retorno, Entrega)
      if (currentStepIndex === 0) {
        const raw = userText.trim().replace(/\s/g, "");
        const tipoMap: Record<string, "visit" | "callback" | "delivery"> = {
          "1": "visit",
          "2": "callback",
          "3": "delivery",
        };
        const chosen = tipoMap[raw] ?? (raw === "visita" ? "visit" : raw === "retorno" ? "callback" : raw === "entrega" ? "delivery" : null);
        if (!chosen) {
          return { reply: "Escolha 1) Visita, 2) Retorno ou 3) Entrega.", fromBase: true };
        }
        updateBotSession(sessionId, { step: 1, data: { tipo: chosen } });
        const next = getAgendamentoSubStep(chosen, 0);
        return next?.message ? { reply: next.message, fromBase: true } : null;
      }

      if (!tipo) return null;

      // Subfluxo Visita/Retorno
      if (tipo === "visit" || tipo === "callback") {
        if (subStepIndex === 0) {
          const parsed = parseScheduleDay(userText);
          if (!parsed) {
            return { reply: "Não entendi o dia. Pode digitar ex.: amanhã ou 25/02?", fromBase: true };
          }
          updateBotSession(sessionId, {
            step: 2,
            data: { ...state.data, dia: userText.trim(), diaParsed: parsed } as Record<string, unknown>,
          });
          const next = getAgendamentoSubStep(tipo, 1);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
        if (subStepIndex === 1) {
          const t = userText.trim().toLowerCase();
          const periodo = /^1\s*$/.test(userText.trim()) || t === "manhã" || t === "manha" ? "Manhã" : "Tarde";
          updateBotSession(sessionId, { step: 3, data: { ...state.data, periodo } });
          const next = getAgendamentoSubStep(tipo, 2);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
        if (subStepIndex === 2) {
          const cityResult = validateCity(userText);
          if (!cityResult.valid) {
            return { reply: cityResult.message ?? INVALID_CITY_MESSAGE, fromBase: true };
          }
          const city = userText.trim();
          updateBotSession(sessionId, { step: 4, data: { ...state.data, cidade: city } });
          return { reply: CONFIRM_CITY_MESSAGE(city), fromBase: true };
        }
        if (subStepIndex === 3) {
          if (isConfirmationNo(userText)) {
            updateBotSession(sessionId, { step: 3, data: { ...state.data, cidade: "" } });
            const next = getAgendamentoSubStep(tipo, 2);
            return next?.message ? { reply: next.message, fromBase: true } : null;
          }
          if (isConfirmationYes(userText) && !leadId) {
            clearBotSession(sessionId);
            return { reply: AGENDAMENTO_SEM_LEAD_MESSAGE, fromBase: true };
          }
          if (isConfirmationYes(userText) && leadId && state.data.cidade && state.data.diaParsed && state.data.periodo) {
            try {
              const scheduledAt = buildScheduledAtFromDayAndPeriod(
                state.data.diaParsed as unknown as ParsedScheduleDate,
                state.data.periodo as string,
              );
              await this.crmService.createSchedule({
                leadId,
                type: tipo,
                scheduledAt,
                title: tipo === "visit" ? "Visita" : "Retorno",
                description: `Cidade: ${(state.data.cidade as string).trim()}`,
              });
              await this.crmService.updateLead(leadId, { city: (state.data.cidade as string).trim(), intent: "agendamento" });
            } catch (err) {
              console.warn("[Bot] Erro ao criar agendamento:", err);
            }
          }
          const next = getAgendamentoSubStep(tipo, 4);
          if (next?.isFinal) clearBotSession(sessionId);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
      }

      // Subfluxo Entrega: endereço → CEP → descrição local → dia → hora → itens → confirmar → criar
      if (tipo === "delivery") {
        if (subStepIndex === 0) {
          const endereco = userText.trim();
          if (endereco.length < 5) {
            return { reply: "Endereço muito curto. Pode digitar o endereço completo?", fromBase: true };
          }
          updateBotSession(sessionId, { step: 2, data: { ...state.data, endereco } });
          const next = getAgendamentoSubStep(tipo, 1);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
        if (subStepIndex === 1) {
          if (!validateCEP(userText)) {
            return { reply: "CEP inválido. Digite 8 números (ex.: 01310100 ou 01310-100).", fromBase: true };
          }
          const cepFormatted = formatCEP(userText) ?? userText.replace(/\D/g, "");
          updateBotSession(sessionId, { step: 3, data: { ...state.data, cep: cepFormatted } });
          const next = getAgendamentoSubStep(tipo, 2);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
        if (subStepIndex === 2) {
          updateBotSession(sessionId, { step: 4, data: { ...state.data, descricaoLocal: userText.trim() } });
          const next = getAgendamentoSubStep(tipo, 3);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
        if (subStepIndex === 3) {
          const parsed = parseScheduleDay(userText);
          if (!parsed) {
            return { reply: "Não entendi o dia. Pode digitar ex.: amanhã ou 25/02?", fromBase: true };
          }
          updateBotSession(sessionId, {
            step: 5,
            data: { ...state.data, dia: userText.trim(), diaParsed: parsed } as Record<string, unknown>,
          });
          const next = getAgendamentoSubStep(tipo, 4);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
        if (subStepIndex === 4) {
          const time = parseScheduleTime(userText);
          if (!time) {
            return { reply: "Não entendi o horário. Pode digitar ex.: 14h ou 14:30?", fromBase: true };
          }
          const horaStr = `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
          updateBotSession(sessionId, {
            step: 6,
            data: { ...state.data, hora: horaStr, horaParsed: time } as Record<string, unknown>,
          });
          const next = getAgendamentoSubStep(tipo, 5);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
        if (subStepIndex === 5) {
          const itens = userText.trim();
          if (!itens) {
            return { reply: "Digite o que será entregue (ex.: 2x Furadeira, 1x Serra).", fromBase: true };
          }
          updateBotSession(sessionId, { step: 7, data: { ...state.data, itensEntrega: itens } });
          const confirmMsg = getAgendamentoConfirmMessage(tipo, { ...state.data, itensEntrega: itens });
          return { reply: confirmMsg, fromBase: true };
        }
        if (subStepIndex === 6) {
          if (isConfirmationNo(userText)) {
            updateBotSession(sessionId, { step: 6, data: { ...state.data, itensEntrega: "" } });
            const next = getAgendamentoSubStep(tipo, 5);
            return next?.message ? { reply: next.message, fromBase: true } : null;
          }
          if (isConfirmationYes(userText) && !leadId) {
            clearBotSession(sessionId);
            return { reply: AGENDAMENTO_SEM_LEAD_MESSAGE, fromBase: true };
          }
          if (isConfirmationYes(userText) && leadId && state.data.diaParsed && state.data.horaParsed) {
            try {
              const scheduledAt = buildScheduledAtFromDayAndTime(
                state.data.diaParsed as unknown as ParsedScheduleDate,
                state.data.horaParsed as unknown as { hour: number; minute: number },
              );
              await this.crmService.createSchedule({
                leadId,
                type: "delivery",
                scheduledAt,
                title: "Entrega",
                description: (state.data.descricaoLocal as string) || "",
                address: (state.data.endereco as string) || "",
                cep: (state.data.cep as string) || "",
                deliveryItems: (state.data.itensEntrega as string) || "",
              });
              await this.crmService.updateLead(leadId, { intent: "agendamento" });
            } catch (err) {
              console.warn("[Bot] Erro ao criar agendamento de entrega:", err);
            }
          }
          const next = getAgendamentoSubStep(tipo, 7);
          if (next?.isFinal) clearBotSession(sessionId);
          return next?.message ? { reply: next.message, fromBase: true } : null;
        }
      }
    }

    if (intention === "suporte") {
      if (currentStepIndex === 0) {
        updateBotSession(sessionId, { step: 1, data: { tipo: userText } });
        const next = getFlowStep(intention, 1);
        if (next?.isFinal) clearBotSession(sessionId);
        return next ? { reply: next.message, fromBase: true } : null;
      }
    }

    if (intention === "status_pedido") {
      clearBotSession(sessionId);
      return null;
    }

    return null;
  }

  private async replyFromBase(text: string, sessionId: string): Promise<BotReplyResult | null> {
    const faq = this.knowledgeBase.searchFaq(text);
    if (faq?.resposta) {
      if (faq.resumo) {
        setVerMais(sessionId, faq.resposta);
        return { reply: shortWithVerMais(faq.resumo, true), fromBase: true };
      }
      return { reply: this.formatShort(faq.resposta), fromBase: true };
    }

    if (/\b(qual\s+o\s+)?horário|horario|que\s+horas\s+abre|funcionamento\b/i.test(text)) {
      const horarios = this.knowledgeBase.getHorarios();
      if (horarios.length > 0) {
        const h = horarios[0];
        return { reply: `⏱️ Atendimento: ${h.dias}, ${h.horario}. Atualizado em 2026-02.`, fromBase: true };
      }
      return { reply: this.knowledgeBase.getUncertaintyTemplate("horario"), fromBase: true };
    }

    if (/\b(endereço|endereco|onde\s+fica|localização|endereço\s+da\s+loja)\b/i.test(text)) {
      const enderecos = this.knowledgeBase.getEnderecos();
      if (enderecos.length > 0) {
        const e = enderecos[0];
        const reply = `📍 ${e.endereco}, ${e.cidade}${e.cep ? ` - ${e.cep}` : ""}. Atualizado em 2026-02.`;
        return { reply, fromBase: true };
      }
      return { reply: this.knowledgeBase.getUncertaintyTemplate("endereco"), fromBase: true };
    }

    if (/\b(prazo|entrega|demora|quanto\s+tempo|chega\s+quando)\b/i.test(text)) {
      const prazos = this.knowledgeBase.getPrazos();
      const prazoEntrega = prazos.find((p) => p.tipo === "entrega");
      if (prazoEntrega?.observacao) {
        return { reply: `⏱️ ${prazoEntrega.observacao} Atualizado em 2026-02.`, fromBase: true };
      }
      return { reply: this.knowledgeBase.getUncertaintyTemplate("prazo"), fromBase: true };
    }

    if (/\b(garantia|troca|devolução|política\s+de)\b/i.test(text)) {
      const politicas = this.knowledgeBase.getPolicies();
      const garantia = politicas.find((p) => p.tipo === "garantia");
      const troca = politicas.find((p) => p.tipo === "troca");
      const pol = garantia && /garantia/i.test(text) ? garantia : troca && /troca|devolução/i.test(text) ? troca : politicas[0];
      if (pol) {
        if (pol.resumo) {
          setVerMais(sessionId, pol.texto);
          return { reply: shortWithVerMais(pol.resumo, true), fromBase: true };
        }
        return { reply: this.formatShort(pol.texto), fromBase: true };
      }
      return { reply: this.knowledgeBase.getUncertaintyTemplate("garantia"), fromBase: true };
    }

    for (const { pattern, type } of SENSITIVE_PATTERNS) {
      if (pattern.test(text) && !this.knowledgeBase.hasSensitiveClaimInBase(type)) {
        return { reply: this.knowledgeBase.getUncertaintyTemplate(type), fromBase: true };
      }
    }

    return null;
  }

  private formatShort(text: string, maxLines = 3): string {
    const lines = text.split(/\n/).filter((l) => l.trim());
    if (lines.length <= maxLines) return text.trim();
    return lines.slice(0, maxLines).join("\n").trim();
  }
}
