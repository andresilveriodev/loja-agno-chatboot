import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductDocument } from "./schemas/product.schema";

export interface ProductFilter {
  category?: string;
}

/** Objeto plano retornado pela API (sem métodos do Mongoose). */
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  specs: string;
  features: string[];
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ProductDocument.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    const query: Record<string, unknown> = {};
    if (filter?.category) {
      query.category = filter.category;
    }
    const result = await this.productModel.find(query).lean().exec();
    return result as Product[];
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.productModel.findOne({ id }).lean().exec();
    return result as Product | null;
  }
}
