import { Body, Controller, Post, Get } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";
import { ChatService } from "../chat/chat.service";
import { AiService } from "../ai/ai.service";
import { ProductsService } from "../products/products.service";
import { CrmService } from "../crm/crm.service";
import type { EvolutionWebhookPayload } from "./dto/evolution-webhook.dto";
import {
  extractPhoneFromRemoteJid,
  extractTextFromMessage,
  extractAudioUrlFromMessage,
  isAudioMessage,
} from "./dto/evolution-webhook.dto";
import { AudioService } from "../audio/audio.service";

function extractCustomerName(text: string): string | null {
  if (!text) return null;

  const normalized = text.trim();

  const patterns: RegExp[] = [
    /(?:meu nome é|meu nome eh|meu nome e|me chamo|eu me chamo)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)$/i,
    /(?:eu sou o|eu sou a|sou o|sou a)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)$/i,
    /(?:aqui é o|aqui é a|aqui e o|aqui e a)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)$/i,
  ];

  for (const regex of patterns) {
    const match = normalized.match(regex);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length >= 2 && name.length <= 80) {
        return name
          .replace(/\s+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
  }

  return null;
}

const SESSION_PREFIX = "wa:";
/** IDs de produto mencionados na resposta (ex: prod_001, prod_005). */
const PRODUCT_ID_REGEX = /\bprod_\d+\b/gi;

@Controller("api/whatsapp")
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly chatService: ChatService,
    private readonly aiService: AiService,
    private readonly productsService: ProductsService,
    private readonly crmService: CrmService,
    private readonly audioService: AudioService,
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
    if (!phone) {
      console.log("[WhatsApp] Ignorado: phone ausente. remoteJid:", key?.remoteJid ?? "(vazio)");
      return { ok: true };
    }

    let text = extractTextFromMessage(payload.data.message);

    // Fluxo de áudio: quando não há texto e mensagem contém audio/PTT
    if (!text && isAudioMessage(payload.data)) {
      const audioUrl = extractAudioUrlFromMessage(payload.data.message);
      const durationSeconds =
        (payload.data.message as any)?.audioMessage?.seconds ??
        (payload.data.message as any)?.pttMessage?.seconds;
      const mimetype =
        (payload.data.message as any)?.audioMessage?.mimetype ??
        (payload.data.message as any)?.pttMessage?.mimetype;

      // Preferir áudio via Evolution API (getBase64FromMediaMessage) — evita mmg.whatsapp.net que pode vir criptografado/HTML
      let audioResult: Awaited<ReturnType<AudioService["processWhatsAppAudio"]>>;
      if (key?.id) {
        const base64Result = await this.whatsappService.getMediaBase64FromMessage({
          id: key.id,
          remoteJid: key.remoteJid,
          fromMe: key.fromMe,
        });
        if (base64Result.success && base64Result.base64) {
          let base64Data = base64Result.base64.trim();
          if (base64Data.includes(",")) base64Data = base64Data.split(",")[1] ?? base64Data;
          try {
            const audioBuffer = Buffer.from(base64Data, "base64");
            if (audioBuffer.length > 0) {
              audioResult = await this.audioService.processWhatsAppAudio({
                audioBuffer,
                mimetype,
                remoteJid: key?.remoteJid,
                durationSeconds,
              });
            } else {
              audioResult = await this.audioService.processWhatsAppAudio({
                audioUrl: audioUrl ?? "",
                remoteJid: key?.remoteJid,
                durationSeconds,
              });
            }
          } catch {
            audioResult = await this.audioService.processWhatsAppAudio({
              audioUrl: audioUrl ?? "",
              remoteJid: key?.remoteJid,
              durationSeconds,
            });
          }
        } else {
          console.warn("[WhatsApp] getBase64FromMediaMessage falhou:", !base64Result.success ? base64Result.error : "sem base64", "— usando audioUrl");
          audioResult = await this.audioService.processWhatsAppAudio({
            audioUrl: audioUrl ?? "",
            remoteJid: key?.remoteJid,
            durationSeconds,
          });
        }
      } else {
        audioResult = await this.audioService.processWhatsAppAudio({
          audioUrl: audioUrl ?? "",
          remoteJid: key?.remoteJid,
          durationSeconds,
        });
      }

      if (!audioResult.success) {
        console.warn("[WhatsApp] Falha ao processar áudio:", audioResult.details ?? audioResult.error);
        await this.whatsappService.sendText(
          phone,
          audioResult.error || "Não consegui entender seu áudio, pode repetir em texto?",
        );
        return { ok: true };
      }

      text = audioResult.text;
    }

    if (!text) {
      console.log(
        "[WhatsApp] Ignorado: mensagem sem texto nem áudio suportado. message keys:",
        payload.data.message ? Object.keys(payload.data.message) : "null",
      );
      return { ok: true };
    }

    console.log("[WhatsApp] Mensagem recebida de", phone + ":", text);

    const sessionId = `${SESSION_PREFIX}${phone}`;
    const metadata = { source: "whatsapp", phone };

    try {
      const lead = await this.crmService.findOrCreateLeadByPhone(phone);
      const leadId = lead.id;

      const extractedName = extractCustomerName(text);
      if (extractedName && extractedName !== lead.name) {
        try {
          await this.crmService.updateLead(leadId, { name: extractedName });
          console.log("[WhatsApp] Nome do lead atualizado para:", extractedName);
        } catch (err) {
          console.error("[WhatsApp] Erro ao atualizar nome do lead:", err);
        }
      }

      await this.chatService.saveMessage({
        sessionId,
        sender: "user",
        content: text,
        type: isAudioMessage(payload.data) ? "audio" : "text",
        source: "whatsapp",
        metadata,
        leadId,
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
        source: "whatsapp",
        metadata,
        leadId,
      });

      let productIds = [...new Set((reply.match(PRODUCT_ID_REGEX) || []).map((id) => id.toLowerCase()))];

      // Fallback: usuário pediu foto/imagem mas a IA não incluiu id na resposta — buscar último produto no histórico
      const fotoKeywords = /\b(foto|imagem|foto\s*dele|foto\s*dela|quero\s*(a\s*)?foto|mostra\s*(a\s*)?foto|manda\s*(a\s*)?foto)\b/i;
      if (productIds.length === 0 && fotoKeywords.test(text)) {
        const history = await this.chatService.getHistory(sessionId);
        for (let i = history.length - 1; i >= 0; i--) {
          const content = history[i]?.content;
          if (content) {
            const ids = (content.match(PRODUCT_ID_REGEX) || []).map((id) => id.toLowerCase());
            if (ids.length > 0) {
              productIds = [...new Set(ids)];
              console.log("[WhatsApp] Fallback: extraído produto(s) do histórico:", productIds.join(", "));
              break;
            }
          }
        }
      }

      if (productIds.length > 0) {
        for (const productId of productIds) {
          const product = await this.productsService.findById(productId);
          if (!product) continue;

          const imageUrl = this.productsService.getProductImageUrl(product);
          if (!imageUrl) {
            console.warn(
              "[WhatsApp] Imagem do produto",
              productId,
              "não disponível (PRODUCT_IMAGES_BASE_URL ou mapeamento product-image-urls.json?)",
            );
            continue;
          }

          const mediaResult = await this.whatsappService.sendMediaFromUrl(
            phone,
            imageUrl,
            product.name,
          );
          if (mediaResult.sent) {
            console.log("[WhatsApp] Foto do produto", productId, "enviada para", phone);
          } else {
            console.warn("[WhatsApp] Falha ao enviar foto do produto", productId, ":", mediaResult.error);
          }
        }
      }

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
