import { Injectable } from "@nestjs/common";
import { AiService, TranscribeAudioResult } from "../ai/ai.service";

export type ProcessWhatsAppAudioResult =
  | { success: true; text: string; durationSeconds?: number }
  | { success: false; error: string; details?: string };

/** Assinaturas de formato (magic bytes). Whisper aceita: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm. */
function getAudioExtensionFromMagicBytes(buffer: Buffer): string {
  if (!buffer || buffer.length < 4) return "ogg";
  // Ogg (OggS)
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) return "ogg";
  // WAV (RIFF)
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return "wav";
  // MP3 ID3
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return "mp3";
  // MP3 frame sync
  if (buffer[0] === 0xff && (buffer[1] & 0xfe) === 0xfa) return "mp3";
  // WebM (0x1A 0x45 0xDF 0xA3)
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return "webm";
  // FLAC (fLaC)
  if (buffer[0] === 0x66 && buffer[1] === 0x4c && buffer[2] === 0x61 && buffer[3] === 0x43) return "flac";
  // MP4/M4A (ftyp na posição 4)
  if (buffer.length >= 8 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) return "m4a";
  return "ogg";
}

/** Mapeia mimetype (ex: audio/ogg; codecs=opus) para extensão aceita pelo Whisper. */
function extensionFromMimetype(mimetype: string | undefined): string {
  if (!mimetype || typeof mimetype !== "string") return "ogg";
  const lower = mimetype.split(";")[0].trim().toLowerCase();
  if (lower.includes("ogg") || lower.includes("opus")) return "ogg";
  if (lower.includes("mpeg") || lower.includes("mp3")) return "mp3";
  if (lower.includes("wav")) return "wav";
  if (lower.includes("webm")) return "webm";
  if (lower.includes("flac")) return "flac";
  if (lower.includes("mp4") || lower.includes("x-m4a") || lower.includes("m4a")) return "m4a";
  return "ogg";
}

interface ProcessWhatsAppAudioInput {
  /** URL direta do áudio (mmg.whatsapp.net) — usada só se audioBuffer não for passado. */
  audioUrl?: string;
  /** Buffer do áudio (ex.: da Evolution getBase64FromMediaMessage). Preferir sobre audioUrl. */
  audioBuffer?: Buffer;
  /** Mimetype do áudio (ex: audio/ogg; codecs=opus). Usado para extensão quando audioBuffer é passado. */
  mimetype?: string;
  remoteJid?: string;
  durationSeconds?: number;
}

@Injectable()
export class AudioService {
  constructor(private readonly aiService: AiService) {}

  async processWhatsAppAudio(input: ProcessWhatsAppAudioInput): Promise<ProcessWhatsAppAudioResult> {
    const { audioUrl, audioBuffer: inputBuffer, mimetype, remoteJid, durationSeconds } = input;

    if (!inputBuffer && !audioUrl) {
      return {
        success: false,
        error: "Não consegui baixar seu áudio, pode repetir em texto?",
        details: "audioUrl e audioBuffer ausentes",
      };
    }

    console.log("[AudioService] processWhatsAppAudio chamado:", {
      hasBuffer: Boolean(inputBuffer),
      audioUrl: audioUrl ? audioUrl.substring(0, 80) : undefined,
      remoteJid,
      durationSeconds,
    });

    let audioBuffer: Buffer;
    let extension: string;

    if (inputBuffer && inputBuffer.length > 0) {
      audioBuffer = inputBuffer;
      extension = extensionFromMimetype(mimetype);
      const fromMagic = getAudioExtensionFromMagicBytes(audioBuffer);
      if (fromMagic !== "ogg") extension = fromMagic;
      console.log("[AudioService] Usando buffer da Evolution. extensão:", extension, "| primeiros bytes:", audioBuffer.slice(0, 8).toString("hex"));
    } else {
      try {
        const res = await fetch(audioUrl!);
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.error("[AudioService] Falha ao baixar áudio:", res.status, "content-type:", contentType, body.substring(0, 200));
          return {
            success: false,
            error: "Não consegui baixar seu áudio, pode repetir em texto?",
            details: `HTTP ${res.status}`,
          };
        }
        const arrayBuffer = await res.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        if (!audioBuffer.length) {
          console.error("[AudioService] Buffer de áudio vazio após download");
          return {
            success: false,
            error: "Não consegui baixar seu áudio, pode repetir em texto?",
            details: "buffer vazio",
          };
        }
        extension = getAudioExtensionFromMagicBytes(audioBuffer);
        console.log("[AudioService] Download por URL. content-type:", contentType, "| primeiros bytes (hex):", audioBuffer.slice(0, 16).toString("hex"), "| extensão inferida:", extension);
        if (extension === "ogg" && audioBuffer[0] !== 0x4f) {
          console.warn("[AudioService] Arquivo não parece OGG (OggS). Pode ser HTML/JSON/criptografado. Evolution getBase64FromMediaMessage é preferível.");
        }
      } catch (err) {
        console.error("[AudioService] Erro de rede ao baixar áudio:", err);
        return {
          success: false,
          error: "Não consegui baixar seu áudio, pode repetir em texto?",
          details: err instanceof Error ? err.message : String(err),
        };
      }
    }

    const filename = `audio.${extension}`;
    let result: TranscribeAudioResult;
    try {
      result = await this.aiService.transcribeAudio({
        audio: audioBuffer,
        filename,
        language: "pt",
      });
    } catch (err) {
      console.error("[AudioService] Erro inesperado ao chamar transcribeAudio:", err);
      return {
        success: false,
        error: "Não consegui entender seu áudio, pode repetir em texto?",
        details: err instanceof Error ? err.message : String(err),
      };
    }

    if (!result.success) {
      console.error("[AudioService] transcribeAudio retornou erro:", result.error);
      return {
        success: false,
        error: "Não consegui entender seu áudio, pode repetir em texto?",
        details: result.error,
      };
    }

    const text = (result.text || "").trim();
    if (!text) {
      console.warn("[AudioService] transcrição vazia retornada por transcribeAudio");
      return {
        success: false,
        error: "Não consegui entender seu áudio, pode repetir em texto?",
        details: "transcrição vazia",
      };
    }

    console.log("[AudioService] Transcrição obtida. Tamanho:", text.length);

    return {
      success: true,
      text,
      durationSeconds,
    };
  }
}

