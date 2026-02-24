import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Lead } from "./lead.entity";
import { OrderItem } from "./order-item.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index("IDX_orders_leadId")
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "leadId" })
  lead: Lead;

  @Column()
  @Index("IDX_orders_orderNumber", { unique: true })
  orderNumber: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column("real", { default: 0 })
  subtotal: number;

  @Column("real", { default: 0 })
  discount: number;

  @Column("real", { default: 0 })
  total: number;

  @Column({ length: 24, default: "pix" })
  paymentMethod: string;

  @Column({ length: 24, default: "pending" })
  paymentStatus: string;

  @Column("datetime", { nullable: true })
  paymentConfirmedAt: Date | null;

  /** Endereço de entrega (JSON) */
  @Column("simple-json", { nullable: true })
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;

  @Column({ length: 24, default: "pending" })
  shippingStatus: string;

  @Column("datetime", { nullable: true })
  shippedAt: Date | null;

  @Column("varchar", { length: 255, nullable: true })
  trackingCode: string | null;

  @Column("datetime", { nullable: true })
  deliveredAt: Date | null;

  @Column({ length: 32, default: "payment_pending" })
  @Index("IDX_orders_stage")
  stage: string;

  @CreateDateColumn()
  @Index("IDX_orders_createdAt")
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
