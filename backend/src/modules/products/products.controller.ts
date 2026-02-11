import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from "@nestjs/common";
import { Response } from "express";
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

  /**
   * Retorna/resolve a imagem do produto.
   * Hoje apenas redireciona para a URL pública (mapeada ou baseada em PRODUCT_IMAGES_BASE_URL),
   * sem baixar nem converter a imagem no backend.
   */
  @Get(":id/image")
  async getProductImage(
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<void> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException("Produto não encontrado");
    }
    const imageUrl = this.productsService.getProductImageUrl(product);
    if (!imageUrl) {
      throw new NotFoundException("Imagem do produto não disponível");
    }
    res.redirect(imageUrl);
  }
}
