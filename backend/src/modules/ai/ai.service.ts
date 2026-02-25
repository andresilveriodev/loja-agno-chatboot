import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

export interface AiChatInput {
  message: string;
  sessionId: string;
  userId?: string;
}

export interface AiChatOutput {
  reply: string;
}

export interface TranscribeAudioInput {
  audio: Buffer | Uint8Array;
  filename?: string;
  language?: string;
}

export type TranscribeAudioResult =
  | {
      success: true;
      text: string;
    }
  | {
      success: false;
      error: string;
    };

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

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

  private getOpenAIClient(): OpenAI | null {
    const apiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey) {
      console.warn("[AiService] OPENAI_API_KEY vazio — serviço de transcrição desativado");
      return null;
    }
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  async transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioResult> {
    const client = this.getOpenAIClient();
    if (!client) {
      return {
        success: false,
        error: "Serviço de transcrição não está configurado no momento.",
      };
    }

    try {
      const filename = input.filename || "audio.ogg";
      const language = input.language || "pt";

      console.log("[AiService] transcribeAudio() chamando Whisper. language:", language);

      // Converter Buffer/Uint8Array para File compatível com o SDK v4
      const file = await toFile(input.audio, filename);

      // SDK v4: audio.transcriptions.create
      const response = await client.audio.transcriptions.create({
        model: "whisper-1",
        file,
        language,
      });

      const text = (response as any)?.text ?? "";
      console.log("[AiService] transcribeAudio() OK — tamanho da transcrição:", text?.length ?? 0);

      if (!text || !String(text).trim()) {
        return {
          success: false,
          error: "Transcrição vazia retornada pelo serviço de áudio.",
        };
      }

      return {
        success: true,
        text: String(text),
      };
    } catch (err) {
      console.error("[AiService] transcribeAudio() falhou:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido ao transcrever áudio.",
      };
    }
  }
}
