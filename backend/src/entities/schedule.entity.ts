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

  /** Endereço de entrega (tipo delivery) */
  @Column({ type: "text", nullable: true })
  address: string | null;

  /** CEP (tipo delivery) */
  @Column({ type: "varchar", length: 20, nullable: true })
  cep: string | null;

  /** Itens a entregar, ex: "2x Produto A, 1x Produto B" (tipo delivery) */
  @Column({ type: "text", nullable: true })
  deliveryItems: string | null;

  @Column({ length: 16, default: "pending" })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
