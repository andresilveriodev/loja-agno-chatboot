/**
 * Fase 3: Formato de resposta curto e escaneável.
 * Padrão 1–3 linhas, bullets, "ver mais" sob demanda.
 */

const MAX_LINES_DEFAULT = 3;

/** Sufixo para oferecer detalhes completos. */
export const VER_MAIS_SUFFIX = "\n\nSe quiser, digite *ver mais* para os detalhes.";

/** Detecta se o usuário está pedindo a versão expandida. */
export function isVerMaisRequest(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    /^ver\s+mais\s*$/i.test(t) ||
    /^detalhes\s*$/i.test(t) ||
    /^completo\s*$/i.test(t) ||
    /^mais\s*(informações|informacoes)?\s*$/i.test(t) ||
    /^quero\s+mais\s*$/i.test(t) ||
    /^manda\s+(os\s+)?detalhes\s*$/i.test(t)
  );
}

/** Garante no máximo N linhas (corta pelo número de quebras). */
export function ensureMaxLines(text: string, maxLines = MAX_LINES_DEFAULT): string {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= maxLines) return text.trim();
  return lines.slice(0, maxLines).join("\n").trim();
}

/** Formata itens como bullets em poucas linhas (ex.: ⏱️ Prazo, 📍 Endereço). */
export function formatBullets(items: { emoji: string; label: string; value?: string }[]): string {
  return items
    .map(({ emoji, label, value }) => (value ? `${emoji} ${label}: ${value}` : `${emoji} ${label}`))
    .join("\n");
}

/** Retorna resumo (1–3 linhas) e adiciona sufixo "ver mais" se houver texto completo. */
export function shortWithVerMais(shortText: string, hasFullVersion: boolean): string {
  const out = ensureMaxLines(shortText);
  return hasFullVersion ? out + VER_MAIS_SUFFIX : out;
}
