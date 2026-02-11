import { Injectable } from "@nestjs/common";

const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || "http://localhost:8080").replace(/\/$/, "");
/**
 * Token usado para endpoints /message/* da Evolution API.
 * Pelo guia oficial, este DEVE ser o token da instância (hash), e não o token global.
 * Mantemos compatibilidade usando EVOLUTION_API_KEY como fallback.
 */
const EVOLUTION_MESSAGE_API_KEY = (process.env.EVOLUTION_INSTANCE_API_KEY || process.env.EVOLUTION_API_KEY || "").trim();
/** Nome da instância na Evolution API (igual ao nome no Evolution Manager). */
const EVOLUTION_INSTANCE = (process.env.EVOLUTION_INSTANCE_NAME || "loja").trim();

/**
 * Normaliza número de telefone seguindo o guia da Evolution API.
 * - Remove caracteres não numéricos
 * - Garante DDI 55 para Brasil quando aplicável
 * - Aceita números já no formato 55DDXXXXXXXXX
 */
function formatPhoneNumber(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");

  // Já tem DDI 55 com pelo menos 12 dígitos
  if (digits.length >= 12 && digits.startsWith("55")) {
    return digits;
  }

  // 11 dígitos (DDD + 9 + número)
  if (digits.length === 11) {
    return `55${digits}`;
  }

  // 10 dígitos (DDD + número) → tenta inferir celular/fixo
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const firstDigit = digits[2];

    // Celular começando com 8 ou 9
    if (firstDigit === "8" || firstDigit === "9") {
      // Se começa com 8, adiciona o 9
      if (firstDigit === "8") {
        digits = ddd + "9" + digits.slice(2);
      }
      return `55${digits}`;
    }

    // Fixo
    return `55${digits}`;
  }

  // 9 dígitos → assume DDD 11
  if (digits.length === 9) {
    return `5511${digits}`;
  }

  // Outros casos: considera inválido
  return null;
}

export interface SendTextResult {
  sent: boolean;
  error?: string;
}

export interface SendMediaResult {
  sent: boolean;
  error?: string;
}

@Injectable()
export class WhatsAppService {
  private get baseUrl(): string {
    const instanceEncoded = encodeURIComponent(EVOLUTION_INSTANCE || "loja");
    return `${EVOLUTION_API_URL}/message/sendText/${instanceEncoded}`;
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      ...(EVOLUTION_MESSAGE_API_KEY ? { apikey: EVOLUTION_MESSAGE_API_KEY } : {}),
    };
  }

  /**
   * Envia mensagem de texto via Evolution API.
   * @param phone Número no formato 5511999999999 (sem + ou @s.whatsapp.net)
   */
  async sendText(phone: string, text: string): Promise<SendTextResult> {
    if (!EVOLUTION_API_URL) {
      return { sent: false, error: "EVOLUTION_API_URL não configurada" };
    }
    const number = formatPhoneNumber(phone);
    if (!number) {
      return { sent: false, error: "Número inválido" };
    }
    console.log("[WhatsApp] Enviando para", number, "via", this.baseUrl);
    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ number, text }),
      });
      const bodyText = await res.text();
      if (!res.ok) {
        console.error("[WhatsApp] Evolution API erro:", res.status, bodyText);
        const shortError =
          res.status === 401
            ? "API Key inválida. Confira EVOLUTION_API_KEY no .env (deve ser igual à AUTHENTICATION_API_KEY do container)."
            : res.status === 404
              ? "Instância não encontrada. Confira EVOLUTION_INSTANCE_NAME (nome exato no Evolution Manager, sem espaços)."
              : `Evolution API ${res.status}: ${bodyText.slice(0, 200)}`;
        return { sent: false, error: shortError };
      }
      console.log("[WhatsApp] Evolution API OK para", number);
      return { sent: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[WhatsApp] Erro ao chamar Evolution:", msg);
      const isNetwork =
        /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(msg) ||
        (err instanceof TypeError && err.message.includes("fetch"));
      return {
        sent: false,
        error: isNetwork
          ? `Não foi possível conectar à Evolution API (${EVOLUTION_API_URL}). Verifique se está rodando e se EVOLUTION_API_URL está correto.`
          : msg,
      };
    }
  }

  /**
   * Envia imagem via Evolution API usando **URL direta**.
   * NÃO baixa nem converte a imagem no backend; a Evolution/WhatsApp fazem o download.
   *
   * Formato esperado pela Evolution:
   * POST /message/sendMedia/{instance}
   * {
   *   number: string,
   *   mediaMessage: {
   *     mediatype: "image",
   *     media: string, // URL direta
   *     caption?: string
   *   }
   * }
   *
   * @param phone Número no formato 5511999999999
   * @param mediaUrl URL pública da imagem
   * @param caption Legenda opcional
   */
  async sendMediaFromUrl(
    phone: string,
    mediaUrl: string,
    caption?: string,
  ): Promise<SendMediaResult> {
    if (!EVOLUTION_API_URL) {
      return { sent: false, error: "EVOLUTION_API_URL não configurada" };
    }
    const number = formatPhoneNumber(phone);
    if (!number) {
      return { sent: false, error: "Número inválido" };
    }
    const instanceEncoded = encodeURIComponent(EVOLUTION_INSTANCE || "loja");
    const sendUrl = `${EVOLUTION_API_URL}/message/sendMedia/${instanceEncoded}`;

    const body: {
      number: string;
      mediatype: "image";
      media: string;
      caption?: string;
      mediaMessage: {
        mediatype: "image";
        media: string;
        caption?: string;
      };
    } = {
      number,
      mediatype: "image",
      media: mediaUrl,
      mediaMessage: {
        mediatype: "image",
        media: mediaUrl,
      },
    };
    if (caption?.trim()) {
      const safeCaption = caption.trim();
      body.caption = safeCaption;
      body.mediaMessage.caption = safeCaption;
    }

    console.log("[WhatsApp] Enviando mídia (URL) para", number, "via", sendUrl, {
      mediaUrl,
    });
    try {
      const res = await fetch(sendUrl, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
      });
      const bodyText = await res.text();
      if (!res.ok) {
        console.error("[WhatsApp] Evolution sendMedia erro:", res.status, bodyText);
        return {
          sent: false,
          error: `Evolution API ${res.status}: ${bodyText.slice(0, 150)}`,
        };
      }
      console.log("[WhatsApp] Mídia enviada para", number);
      return { sent: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[WhatsApp] Erro sendMedia:", msg);
      return { sent: false, error: msg };
    }
  }

  /** Verifica se a integração está configurada (URL e instância). */
  isConfigured(): boolean {
    return Boolean(EVOLUTION_API_URL && EVOLUTION_INSTANCE);
  }

  /** Retorna a URL do webhook que a Evolution API deve chamar (para documentação). */
  getWebhookUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/$/, "")}/api/whatsapp/webhook`;
  }
}
