export class SendMessageDto {
  sessionId: string;
  content: string;
  sender?: "user" | "bot" | "agent";
  type?: string;
  /** Canal de origem: "web" | "whatsapp" (para CRM/timeline) */
  source?: string;
  /** Origem do canal (web, whatsapp) para omnichannel/CRM */
  metadata?: Record<string, unknown>;
  /** Quando preenchido, mensagem aparece na timeline do lead no CRM */
  leadId?: string | null;
}
