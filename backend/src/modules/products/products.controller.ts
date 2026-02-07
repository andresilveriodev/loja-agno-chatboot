import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ProductsService, ProductFilter } from "./products.service";

@Controller("api/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query("category") category?: string) {
    const filter: ProductFilter = category ? { category } : {};
    return this.productsService.findAll(filter);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException("Produto não encontrado");
    }
    return product;
  }
}
