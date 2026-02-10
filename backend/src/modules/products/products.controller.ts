import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ProductsService, ProductFilter } from "./products.service";

@Controller("api/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query("category") category?: string,
    @Query("search") search?: string,
  ) {
    const filter: ProductFilter = {};
    if (category) filter.category = category;
    if (search?.trim()) filter.search = search.trim();
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
