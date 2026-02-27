import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { ProductsModule } from "./modules/products/products.module";
import { ChatModule } from "./modules/chat/chat.module";
import { AiModule } from "./modules/ai/ai.module";
import { KnowledgeBaseModule } from "./modules/knowledge-base/knowledge-base.module";
import { BotModule } from "./modules/bot/bot.module";
import { WhatsAppModule } from "./modules/whatsapp/whatsapp.module";
import { CrmModule } from "./modules/crm/crm.module";
import { Product } from "./entities/product.entity";
import { Message } from "./entities/message.entity";
import { Lead } from "./entities/lead.entity";
import { Schedule } from "./entities/schedule.entity";
import { Activity } from "./entities/activity.entity";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderCounter } from "./entities/order-counter.entity";

const databasePath =
  process.env.DATABASE_PATH || "data/loja.db";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: databasePath,
      entities: [
        Product,
        Message,
        Lead,
        Schedule,
        Activity,
        Order,
        OrderItem,
        OrderCounter,
      ],
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV === "development",
    }),
    ProductsModule,
    AiModule,
    KnowledgeBaseModule,
    BotModule,
    ChatModule,
    WhatsAppModule,
    CrmModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
