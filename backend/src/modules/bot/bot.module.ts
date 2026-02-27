import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { IntentionClassifierService } from "./intention-classifier.service";
import { AiModule } from "../ai/ai.module";
import { ChatModule } from "../chat/chat.module";
import { CrmModule } from "../crm/crm.module";
import { KnowledgeBaseModule } from "../knowledge-base/knowledge-base.module";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [AiModule, ChatModule, CrmModule, KnowledgeBaseModule, ProductsModule],
  providers: [BotService, IntentionClassifierService],
  exports: [BotService, IntentionClassifierService],
})
export class BotModule {}
