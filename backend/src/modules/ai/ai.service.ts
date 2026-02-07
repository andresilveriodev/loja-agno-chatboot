import { Injectable } from "@nestjs/common";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "";

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
    if (!AI_SERVICE_URL.trim()) {
      return null;
    }
    const url = `${AI_SERVICE_URL.replace(/\/$/, "")}/chat`;
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
      if (!res.ok) {
        console.error("AI service error:", res.status, await res.text());
        return null;
      }
      const data = (await res.json()) as AiChatOutput;
      return { reply: data.reply ?? "" };
    } catch (err) {
      console.error("AI service request failed:", err);
      return null;
    }
  }
}
