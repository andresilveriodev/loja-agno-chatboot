export class SendMessageDto {
  sessionId: string;
  content: string;
  sender?: "user" | "bot" | "agent";
  type?: string;
  /** Origem do canal (web, whatsapp) para omnichannel/CRM */
  metadata?: Record<string, unknown>;
}
