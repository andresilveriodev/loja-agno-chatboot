import { Injectable } from "@nestjs/common";

const EVOLUTION_API_URL = (process.env.EVOLUTION_API_URL || "http://localhost:8080").replace(/\/$/, "");
const EVOLUTION_API_KEY = (process.env.EVOLUTION_API_KEY || "").trim();
/** Nome da instância na Evolution API (igual ao nome no Evolution Manager). */
const EVOLUTION_INSTANCE = (process.env.EVOLUTION_INSTANCE_NAME || "loja").trim();

export interface SendTextResult {
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
      ...(EVOLUTION_API_KEY ? { apikey: EVOLUTION_API_KEY } : {}),
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
    const number = phone.replace(/\D/g, "").replace(/^0/, "");
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

  /** Verifica se a integração está configurada (URL e instância). */
  isConfigured(): boolean {
    return Boolean(EVOLUTION_API_URL && EVOLUTION_INSTANCE);
  }

  /** Retorna a URL do webhook que a Evolution API deve chamar (para documentação). */
  getWebhookUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/$/, "")}/api/whatsapp/webhook`;
  }
}
