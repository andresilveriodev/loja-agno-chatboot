import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  sessionId: string;

  @Column()
  sender: string;

  @Column("text")
  content: string;

  @Column({ default: "text" })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column("simple-json", { nullable: true })
  metadata?: Record<string, unknown>;
}
