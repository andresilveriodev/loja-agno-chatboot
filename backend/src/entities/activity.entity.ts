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

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index("IDX_activities_leadId")
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.activities, { onDelete: "CASCADE" })
  @JoinColumn({ name: "leadId" })
  lead: Lead;

  @Column({ length: 32 })
  type: string;

  @Column({ default: "" })
  title: string;

  @Column("text", { nullable: true })
  description: string | null;

  /** Para type=stage_change: previousStage, newStage, userId (JSON) */
  @Column("simple-json", { nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  @Index("IDX_activities_createdAt")
  createdAt: Date;
}
