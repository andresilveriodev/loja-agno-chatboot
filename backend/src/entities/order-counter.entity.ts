import { Entity, PrimaryColumn, Column } from "typeorm";

/**
 * Contador para geração atômica de orderNumber (ex.: 1001, 1002).
 * Uma única linha (id = 'default'); incrementar em transação ao criar pedido.
 */
@Entity("order_counters")
export class OrderCounter {
  @PrimaryColumn({ default: "default" })
  id: string;

  @Column("integer", { default: 0 })
  nextNumber: number;
}
