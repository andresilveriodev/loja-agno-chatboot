import {
  Entity,
  PrimaryColumn,
  Column,
} from "typeorm";

@Entity("products")
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column("real")
  price: number;

  @Column({ default: "" })
  description: string;

  @Column({ default: "" })
  image: string;

  @Column({ default: "" })
  specs: string;

  @Column("simple-json", { default: "[]" })
  features: string[];
}
