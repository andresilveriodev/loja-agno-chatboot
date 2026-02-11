import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "../../entities/message.entity";
import type { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async saveMessage(dto: SendMessageDto): Promise<Message> {
    const msg = this.messageRepo.create({
      sessionId: dto.sessionId,
      sender: dto.sender ?? "user",
      content: dto.content,
      type: dto.type ?? "text",
      metadata: dto.metadata,
    });
    return this.messageRepo.save(msg);
  }

  async getHistory(sessionId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: "ASC" },
    });
  }
}
