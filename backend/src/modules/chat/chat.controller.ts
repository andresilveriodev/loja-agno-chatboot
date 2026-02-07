import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import type { SendMessageDto } from "./dto/send-message.dto";

@Controller("api/chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("message")
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.saveMessage(dto);
  }

  @Get("history/:sessionId")
  async getHistory(@Param("sessionId") sessionId: string) {
    return this.chatService.getHistory(sessionId);
  }
}
