export class SendMessageDto {
  sessionId: string;
  content: string;
  sender?: "user" | "bot" | "agent";
  type?: string;
}
