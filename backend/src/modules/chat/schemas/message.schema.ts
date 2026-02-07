import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "messages", timestamps: true })
export class MessageDocument extends Document {
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ required: true, enum: ["user", "bot", "agent"] })
  sender: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: "text" })
  type: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);
