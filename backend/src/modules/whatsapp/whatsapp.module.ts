import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppService } from "./whatsapp.service";
import { ChatModule } from "../chat/chat.module";
import { AiModule } from "../ai/ai.module";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [ChatModule, AiModule, ProductsModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}
