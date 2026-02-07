import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { ProductsModule } from "./modules/products/products.module";
import { ChatModule } from "./modules/chat/chat.module";
import { AiModule } from "./modules/ai/ai.module";

const databaseUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/loja-db";

@Module({
  imports: [
    MongooseModule.forRoot(databaseUrl),
    ProductsModule,
    AiModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
