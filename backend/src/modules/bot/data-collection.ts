/**
 * Fase 5: validação e confirmação de dados coletados (coleta progressiva).
 */

const CITY_MIN_LEN = 2;
const CITY_MAX_LEN = 100;

export function validateCEP(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 8 && /^\d{8}$/.test(digits);
}

/** CEP formatado (12345-678) a partir de string. */
export function formatCEP(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function validateCity(value: string): { valid: boolean; message?: string } {
  const t = value.trim();
  if (t.length < CITY_MIN_LEN) {
    return { valid: false, message: "Cidade ou bairro muito curto. Pode digitar de novo?" };
  }
  if (t.length > CITY_MAX_LEN) {
    return { valid: false, message: "Texto muito longo. Pode mandar só a cidade ou bairro?" };
  }
  return { valid: true };
}

/** Resposta do usuário indica confirmação (1, sim, isso, correto). */
export function isConfirmationYes(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^1\s*$/.test(text.trim()) || /^(sim|isso|correto|confirmo|pode ser)$/.test(t);
}

/** Resposta do usuário indica correção (2, não, corrigir). */
export function isConfirmationNo(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^2\s*$/.test(text.trim()) || /^(não|nao|corrigir|errado|outra)$/.test(t);
}

export const CONFIRM_CITY_MESSAGE = (city: string) =>
  `Confirma: *${city}*?\n1) Sim\n2) Corrigir`;

export const INVALID_CITY_MESSAGE =
  "Cidade ou bairro inválido. Pode digitar de novo? (ex.: São Paulo, Centro)";

/** Resultado do parse de data para agendamento. */
export interface ParsedScheduleDate {
  date: Date;
  isoDate: string; // YYYY-MM-DD
}

/**
 * Parse de dia informado pelo usuário: "amanhã", "25/02", "25/02/2026".
 * Retorna null se não reconhecer.
 */
export function parseScheduleDay(text: string): ParsedScheduleDate | null {
  const t = text.trim().toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (/amanhã|amanha/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return {
      date: d,
      isoDate: d.toISOString().slice(0, 10),
    };
  }
  const ddmmyy = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (ddmmyy) {
    const day = parseInt(ddmmyy[1], 10);
    const month = parseInt(ddmmyy[2], 10) - 1;
    const year = ddmmyy[3]
      ? parseInt(ddmmyy[3], 10) <= 99
        ? 2000 + parseInt(ddmmyy[3], 10)
        : parseInt(ddmmyy[3], 10)
      : today.getFullYear();
    const d = new Date(year, month, day);
    if (Number.isNaN(d.getTime()) || d.getTime() < today.getTime()) return null;
    return { date: d, isoDate: d.toISOString().slice(0, 10) };
  }
  return null;
}

/**
 * Converte período Manhã/Tarde em hora e minuto.
 */
export function periodToTime(periodo: string): { hour: number; minute: number } {
  const p = (periodo || "").toLowerCase();
  if (p.includes("manhã") || p.includes("manha") || p === "1") return { hour: 9, minute: 0 };
  return { hour: 14, minute: 0 };
}

/**
 * Parse de horário: "14h", "14:30", "14:00".
 * Retorna null se não reconhecer.
 */
export function parseScheduleTime(text: string): { hour: number; minute: number } | null {
  const t = text.trim().replace(/\s/g, "");
  const match = t.match(/^(\d{1,2})(?::|h|horas?)?(\d{2})?$/i);
  if (match) {
    const hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
  }
  return null;
}

/**
 * Monta ISO datetime (YYYY-MM-DDTHH:mm) a partir de dia + período (Manhã/Tarde).
 */
export function buildScheduledAtFromDayAndPeriod(
  day: ParsedScheduleDate,
  periodo: string,
): string {
  const { hour, minute } = periodToTime(periodo);
  const d = new Date(day.date);
  d.setHours(hour, minute, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dayNum = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${dayNum}T${h}:${min}`;
}

/**
 * Monta ISO datetime (YYYY-MM-DDTHH:mm) a partir de dia + hora (ex: "14h30").
 */
export function buildScheduledAtFromDayAndTime(
  day: ParsedScheduleDate,
  time: { hour: number; minute: number },
): string {
  const d = new Date(day.date);
  d.setHours(time.hour, time.minute, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dayNum = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${dayNum}T${h}:${min}`;
}
