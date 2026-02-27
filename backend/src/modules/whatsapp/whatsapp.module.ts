import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppService } from "./whatsapp.service";
import { ChatModule } from "../chat/chat.module";
import { BotModule } from "../bot/bot.module";
import { ProductsModule } from "../products/products.module";
import { CrmModule } from "../crm/crm.module";
import { AudioModule } from "../audio/audio.module";

@Module({
  imports: [ChatModule, BotModule, ProductsModule, CrmModule, AudioModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}
