import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Lead } from "./lead.entity";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  /** Opcional: quando preenchido, mensagem faz parte do CRM (timeline do lead). */
  @Column("varchar", { length: 36, nullable: true })
  @Index("IDX_messages_leadId")
  leadId: string | null;

  @ManyToOne(() => Lead, (lead) => lead.messages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "leadId" })
  lead: Lead | null;

  /** Sessão do chat (web); usado quando ainda não há lead vinculado. */
  @Column("varchar", { length: 255, nullable: true })
  @Index("IDX_messages_sessionId")
  sessionId: string | null;

  @Column({ length: 16 })
  sender: string;

  @Column("text")
  content: string;

  @Column({ default: "text" })
  type: string;

  @Column({ length: 16, default: "web" })
  @Index("IDX_messages_source")
  source: string;

  @CreateDateColumn()
  @Index("IDX_messages_createdAt")
  createdAt: Date;

  @Column("simple-json", { nullable: true })
  metadata?: Record<string, unknown>;
}
