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

@Entity("schedules")
export class Schedule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index("IDX_schedules_leadId")
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.schedules, { onDelete: "CASCADE" })
  @JoinColumn({ name: "leadId" })
  lead: Lead;

  @Column({ length: 16 })
  type: string;

  @Column("datetime")
  @Index("IDX_schedules_scheduledAt")
  scheduledAt: Date;

  @Column()
  title: string;

  @Column("text", { default: "" })
  description: string;

  @Column({ length: 16, default: "pending" })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
