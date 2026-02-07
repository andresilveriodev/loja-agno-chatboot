import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "products" })
export class ProductDocument extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: "" })
  image: string;

  @Prop({ default: "" })
  specs: string;

  @Prop({ type: [String], default: [] })
  features: string[];
}

export const ProductSchema = SchemaFactory.createForClass(ProductDocument);
