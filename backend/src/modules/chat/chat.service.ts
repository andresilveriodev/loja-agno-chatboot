import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MessageDocument } from "./schemas/message.schema";
import type { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(MessageDocument.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async saveMessage(dto: SendMessageDto): Promise<MessageDocument> {
    const doc = {
      sessionId: dto.sessionId,
      sender: dto.sender ?? "user",
      content: dto.content,
      type: dto.type ?? "text",
    };
    return this.messageModel.create(doc);
  }

  async getHistory(sessionId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({ sessionId }).sort({ createdAt: 1 }).exec();
  }
}
