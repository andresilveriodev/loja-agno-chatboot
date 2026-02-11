/**
 * Estrutura do webhook da Evolution API (messages.upsert e similares).
 * Documentação: https://doc.evolution-api.com
 */
export interface EvolutionWebhookPayload {
  event?: string;
  instance?: string;
  data?: {
    key?: {
      remoteJid?: string;
      fromMe?: boolean;
      id?: string;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: { text?: string };
    };
    messageTimestamp?: number;
  };
}

/** Extrai o número de telefone do remoteJid (ex: 5511999999999@s.whatsapp.net -> 5511999999999). */
export function extractPhoneFromRemoteJid(remoteJid: string | undefined): string | null {
  if (!remoteJid || typeof remoteJid !== "string") return null;
  const match = remoteJid.match(/^(\d+)@/);
  return match ? match[1] : null;
}

type Data = NonNullable<EvolutionWebhookPayload["data"]>;
type MessagePayload = Data["message"];

/** Extrai o texto da mensagem do payload (conversation ou extendedTextMessage). */
export function extractTextFromMessage(message: MessagePayload): string | null {
  if (!message || typeof message !== "object") return null;
  if (typeof (message as { conversation?: string }).conversation === "string") {
    const conv = (message as { conversation: string }).conversation.trim();
    if (conv) return conv;
  }
  const ext = (message as { extendedTextMessage?: { text?: string } }).extendedTextMessage;
  if (ext && typeof ext.text === "string" && ext.text.trim()) {
    return ext.text.trim();
  }
  return null;
}
