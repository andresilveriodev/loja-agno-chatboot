import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppService } from "./whatsapp.service";
import { ChatModule } from "../chat/chat.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [ChatModule, AiModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}
