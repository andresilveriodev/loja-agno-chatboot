import type { BotIntention } from "./intentions";

/** Estado da sessão do bot por conversa (fluxo em andamento). */
export interface BotSessionState {
  intention: BotIntention;
  step: number;
  /** Dados coletados no fluxo (ex.: dia, período, diaParsed, horaParsed). */
  data: Record<string, unknown>;
  updatedAt: number;
}

const TTL_MS = 1000 * 60 * 60 * 2; // 2 horas

const store = new Map<string, BotSessionState>();

export function getBotSession(sessionId: string): BotSessionState | null {
  const state = store.get(sessionId);
  if (!state) return null;
  if (Date.now() - state.updatedAt > TTL_MS) {
    store.delete(sessionId);
    return null;
  }
  return state;
}

export function setBotSession(
  sessionId: string,
  intention: BotIntention,
  step: number,
  data: Record<string, unknown> = {},
): void {
  store.set(sessionId, {
    intention,
    step,
    data: { ...data },
    updatedAt: Date.now(),
  });
}

export function updateBotSession(
  sessionId: string,
  updates: Partial<Pick<BotSessionState, "step" | "data">>,
): void {
  const current = store.get(sessionId);
  if (!current) return;
  const next: BotSessionState = {
    ...current,
    ...updates,
    data: { ...current.data, ...(updates.data ?? {}) },
    updatedAt: Date.now(),
  };
  store.set(sessionId, next);
}

export function clearBotSession(sessionId: string): void {
  store.delete(sessionId);
  verMaisStore.delete(sessionId);
}

/** Fase 3: texto completo para "ver mais" (sob demanda). TTL 30 min. */
const VER_MAIS_TTL_MS = 1000 * 60 * 30;
const verMaisStore = new Map<string, { fullText: string; updatedAt: number }>();

export function setVerMais(sessionId: string, fullText: string): void {
  verMaisStore.set(sessionId, { fullText, updatedAt: Date.now() });
}

export function getVerMais(sessionId: string): string | null {
  const entry = verMaisStore.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.updatedAt > VER_MAIS_TTL_MS) {
    verMaisStore.delete(sessionId);
    return null;
  }
  return entry.fullText;
}

export function clearVerMais(sessionId: string): void {
  verMaisStore.delete(sessionId);
}

/** Último produto em contexto na conversa (ex.: quando enviamos imagem do produto). TTL 2h. */
const LAST_PRODUCT_TTL_MS = 1000 * 60 * 60 * 2;
const lastProductBySession = new Map<string, { productId: string; updatedAt: number }>();

export function setLastProductIdForSession(sessionId: string, productId: string): void {
  lastProductBySession.set(sessionId, {
    productId: productId.toLowerCase(),
    updatedAt: Date.now(),
  });
}

export function getLastProductIdForSession(sessionId: string): string | null {
  const entry = lastProductBySession.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.updatedAt > LAST_PRODUCT_TTL_MS) {
    lastProductBySession.delete(sessionId);
    return null;
  }
  return entry.productId;
}
