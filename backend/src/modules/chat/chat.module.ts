import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "../../entities/message.entity";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [TypeOrmModule.forFeature([Message]), AiModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
