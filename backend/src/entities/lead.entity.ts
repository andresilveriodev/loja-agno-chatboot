import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Message } from "./message.entity";
import { Schedule } from "./schedule.entity";
import { Activity } from "./activity.entity";
import { Order } from "./order.entity";

@Entity("leads")
export class Lead {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  @Index("IDX_leads_phone", { unique: true })
  phone: string;

  @Column("varchar", { length: 255, nullable: true })
  company: string | null;

  @Column("varchar", { length: 255, nullable: true })
  email: string | null;

  /** Cidade ou bairro (Fase 5 – coleta progressiva). */
  @Column("varchar", { length: 120, nullable: true })
  city: string | null;

  @Column("varchar", { length: 255, nullable: true })
  intent: string | null;

  /** IDs ou nomes de produtos de interesse (JSON array) */
  @Column("simple-json", { default: "[]" })
  productsOfInterest: string[];

  @Column("real", { default: 0 })
  estimatedValue: number;

  @Column({ length: 32, default: "new_lead" })
  @Index("IDX_leads_stage")
  stage: string;

  @Column({ length: 16, default: "web" })
  @Index("IDX_leads_source")
  source: string;

  @Column("text", { nullable: true })
  notes: string | null;

  @CreateDateColumn()
  @Index("IDX_leads_createdAt")
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "datetime", nullable: true })
  @Index("IDX_leads_lastInteractionAt")
  lastInteractionAt: Date | null;

  @OneToMany(() => Message, (m) => m.lead)
  messages: Message[];

  @OneToMany(() => Schedule, (s) => s.lead)
  schedules: Schedule[];

  @OneToMany(() => Activity, (a) => a.lead)
  activities: Activity[];

  @OneToMany(() => Order, (o) => o.lead)
  orders: Order[];
}
