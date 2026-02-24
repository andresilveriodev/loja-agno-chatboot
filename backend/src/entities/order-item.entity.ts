import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./order.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: Order;

  @Column("varchar", { length: 255, nullable: true })
  productId: string | null;

  @Column()
  name: string;

  @Column("real")
  quantity: number;

  @Column("real")
  unitPrice: number;

  @Column("real")
  total: number;
}
