import { Body, Controller, Post, Get } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";
import { ChatService } from "../chat/chat.service";
import { AiService } from "../ai/ai.service";
import type { EvolutionWebhookPayload } from "./dto/evolution-webhook.dto";
import {
  extractPhoneFromRemoteJid,
  extractTextFromMessage,
} from "./dto/evolution-webhook.dto";

const SESSION_PREFIX = "wa:";

@Controller("api/whatsapp")
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly chatService: ChatService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Webhook chamado pela Evolution API quando chega uma mensagem.
   * Configurar na Evolution: URL = {BACKEND_URL}/api/whatsapp/webhook, evento messages.upsert
   */
  @Post("webhook")
  async webhook(@Body() payload: EvolutionWebhookPayload): Promise<{ ok: boolean }> {
    console.log("[WhatsApp] ========== WEBHOOK CHAMADO ==========");
    console.log("[WhatsApp] event:", payload?.event ?? "(vazio)", "| data:", payload?.data ? "ok" : "ausente");

    if (payload?.event !== "messages.upsert" || !payload?.data) {
      console.log("[WhatsApp] Ignorado: evento não é messages.upsert ou data ausente. Payload keys:", payload ? Object.keys(payload) : "null");
      return { ok: true };
    }

    const key = payload.data.key;
    if (key?.fromMe) {
      console.log("[WhatsApp] Ignorado: mensagem enviada por nós (fromMe=true)");
      return { ok: true };
    }

    const phone = extractPhoneFromRemoteJid(key?.remoteJid);
    const text = extractTextFromMessage(payload.data.message);
    if (!phone || !text) {
      console.log("[WhatsApp] Ignorado: phone ou texto ausente. remoteJid:", key?.remoteJid ?? "(vazio)", "| message keys:", payload.data.message ? Object.keys(payload.data.message) : "null");
      return { ok: true };
    }

    console.log("[WhatsApp] Mensagem recebida de", phone + ":", text);

    const sessionId = `${SESSION_PREFIX}${phone}`;
    const metadata = { source: "whatsapp", phone };

    try {
      await this.chatService.saveMessage({
        sessionId,
        sender: "user",
        content: text,
        metadata,
      });

      const aiResult = await this.aiService.chat({
        message: text,
        sessionId,
        userId: sessionId,
      });

      const reply =
        aiResult?.reply?.trim() ||
        "Obrigado pela sua mensagem! Nosso assistente está temporariamente indisponível. Envie outra mensagem em instantes ou acesse nosso site.";

      await this.chatService.saveMessage({
        sessionId,
        sender: "bot",
        content: reply,
        metadata,
      });

      console.log("[WhatsApp] Resposta gerada, enviando para", phone);
      const sendResult = await this.whatsappService.sendText(phone, reply);
      if (sendResult.sent) {
        console.log("[WhatsApp] Resposta enviada com sucesso para", phone);
      } else {
        console.error("[WhatsApp] Falha ao enviar resposta:", sendResult.error);
      }
    } catch (err) {
      console.error("[WhatsApp] Erro ao processar webhook:", err);
    }

    return { ok: true };
  }

  /**
   * Health/status da integração WhatsApp (se Evolution está configurada).
   */
  @Get("status")
  status(): { configured: boolean } {
    return { configured: this.whatsappService.isConfigured() };
  }
}
