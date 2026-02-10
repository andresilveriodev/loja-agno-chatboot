import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product as ProductEntity } from "../../entities/product.entity";

export interface ProductFilter {
  category?: string;
  /** Busca por texto em nome, descrição e especificações (todas as categorias). */
  search?: string;
}

/** Objeto plano retornado pela API. */
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
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
  ) {}

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    const qb = this.productRepo.createQueryBuilder("p");
    if (filter?.category) {
      qb.andWhere("p.category = :category", { category: filter.category });
    }
    if (filter?.search?.trim()) {
      const term = `%${filter.search.trim()}%`;
      qb.andWhere(
        "(p.name LIKE :term OR p.description LIKE :term OR p.specs LIKE :term OR p.category LIKE :term OR p.features LIKE :term)",
        { term },
      );
    }
    const list = await qb.getMany();
    return list as Product[];
  }

  async findById(id: string): Promise<Product | null> {
    const one = await this.productRepo.findOne({ where: { id } });
    return one as Product | null;
  }
}
