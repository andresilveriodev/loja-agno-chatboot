import { Injectable } from "@nestjs/common";

export interface AiChatInput {
  message: string;
  sessionId: string;
  userId?: string;
}

export interface AiChatOutput {
  reply: string;
}

@Injectable()
export class AiService {
  async chat(input: AiChatInput): Promise<AiChatOutput | null> {
    const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "").trim();
    console.log("[AiService] chat() chamado. AI_SERVICE_URL =", AI_SERVICE_URL ? `${AI_SERVICE_URL.substring(0, 30)}...` : "(vazio)");
    if (!AI_SERVICE_URL) {
      console.warn("[AiService] AI_SERVICE_URL vazio — retornando null (fallback)");
      return null;
    }
    const url = `${AI_SERVICE_URL.replace(/\/$/, "")}/chat`;
    console.log("[AiService] POST", url, "body:", { message: input.message?.substring(0, 50), sessionId: input.sessionId });
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.message,
          sessionId: input.sessionId,
          userId: input.userId ?? input.sessionId,
        }),
      });
      console.log("[AiService] Response status:", res.status, res.statusText);
      if (!res.ok) {
        const text = await res.text();
        console.error("[AiService] AI service error:", res.status, text);
        return null;
      }
      const data = (await res.json()) as AiChatOutput;
      console.log("[AiService] OK — reply length:", data?.reply?.length ?? 0);
      return { reply: data.reply ?? "" };
    } catch (err) {
      console.error("[AiService] Request failed:", err instanceof Error ? err.message : err);
      return null;
    }
  }
}
