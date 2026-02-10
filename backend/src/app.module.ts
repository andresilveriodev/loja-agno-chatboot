import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { ProductsModule } from "./modules/products/products.module";
import { ChatModule } from "./modules/chat/chat.module";
import { AiModule } from "./modules/ai/ai.module";
import { Product } from "./entities/product.entity";
import { Message } from "./entities/message.entity";

const databasePath =
  process.env.DATABASE_PATH || "data/loja.db";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: databasePath,
      entities: [Product, Message],
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV === "development",
    }),
    ProductsModule,
    AiModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
