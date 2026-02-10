import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { AiService } from "../ai/ai.service";
import { getCorsOrigins } from "../../config";

@WebSocketGateway({
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: AiService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Chat client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage("message")
  async handleMessage(
    client: Socket,
    payload: { sessionId: string; content: string },
  ) {
    console.log("[ChatGateway] message recebida:", { sessionId: payload?.sessionId, content: payload?.content?.substring(0, 50) });
    if (!payload?.content?.trim()) return;

    const sessionId = payload.sessionId || client.id;

    try {
      await this.chatService.saveMessage({
        sessionId,
        sender: "user",
        content: payload.content.trim(),
      });

      console.log("[ChatGateway] Chamando aiService.chat()...");
      let botReply: string;
      const aiResult = await this.aiService.chat({
        message: payload.content.trim(),
        sessionId,
        userId: payload.sessionId ?? sessionId,
      });
      console.log("[ChatGateway] aiResult:", aiResult === null ? "null" : { hasReply: !!aiResult?.reply, replyLen: aiResult?.reply?.length });
      if (aiResult?.reply) {
        botReply = aiResult.reply;
      } else {
        console.warn("[ChatGateway] aiResult null ou sem reply — usando mensagem de fallback");
        botReply =
          "Obrigado pela sua mensagem! Nosso assistente está temporariamente indisponível. Explore o catálogo ou use os filtros por categoria.";
      }

      await this.chatService.saveMessage({
        sessionId,
        sender: "bot",
        content: botReply,
      });

      client.emit("message", {
        sender: "bot",
        content: botReply,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Chat handleMessage error:", err);
      client.emit("message", {
        sender: "bot",
        content: "Desculpe, ocorreu um erro. Tente novamente.",
        timestamp: new Date(),
      });
    }
  }
}
