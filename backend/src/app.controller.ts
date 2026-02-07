import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      service: "loja-backend",
      docs: {
        health: "GET /health",
        products: "GET /api/products",
        productById: "GET /api/products/:id",
      },
    };
  }

  @Get("health")
  health() {
    return { status: "ok", service: "loja-backend" };
  }
}
