import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import * as path from "path";
import { Repository } from "typeorm";
import { Product as ProductEntity } from "../../entities/product.entity";

const PRODUCT_IMAGES_BASE_URL = (process.env.PRODUCT_IMAGES_BASE_URL || "").trim();
// Trabalhamos exclusivamente com JPG, tanto no mapeamento externo (WordPress)
// quanto no fallback via PRODUCT_IMAGES_BASE_URL.
const EXTENSIONS = [".jpg"] as const;

/**
 * Mapeamento nome do arquivo local → URL no servidor (ex.: WordPress).
 * Carregado de product-image-urls.json.
 *
 * Observação importante:
 * - Em modo dev, o Nest costuma rodar a partir de dist/, então __dirname aponta
 *   para dist/modules/products em vez de src/modules/products.
 * - Para funcionar bem em dev e em build, tentamos caminhos em src/ e dist/.
 */
let productImageUrls: Record<string, string> | null = null;
function getProductImageUrls(): Record<string, string> {
  if (productImageUrls !== null) return productImageUrls;
  const candidatePaths = [
    // Mesmo diretório (útil se o JSON for copiado para dist/)
    path.join(__dirname, "product-image-urls.json"),
    // Caminho a partir da raiz do projeto em dev
    path.resolve(process.cwd(), "src/modules/products/product-image-urls.json"),
    // Caminho a partir da raiz em build (caso o JSON seja copiado para dist)
    path.resolve(process.cwd(), "dist/modules/products/product-image-urls.json"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        productImageUrls = JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, string>;
        return productImageUrls;
      }
    } catch {
      // tenta o próximo caminho
    }
  }

  // Se nada deu certo, usa mapeamento vazio
  productImageUrls = {};
  return productImageUrls;
}

/** Nome do produto → nome da pasta no frontend (quando diferem, ex.: barra em 110/220V). */
const NAME_TO_FOLDER: Record<string, string> = {
  "Kit Sensor de Presença Bocal E27 - 110/220V":
    "Kit Sensor de Presença Bocal E27 - 110220V",
  "Medidor Digital de Energia Elétrica - Trifásico 220/380V":
    "Medidor Digital de Energia Elétrica - Trifásico 220380V",
  "Bosch Parafusadeira/Chave Impacto GDX 18V-285 - 285Nm":
    "Bosch ParafusadeiraChave Impacto GDX 18V-285 - 285Nm",
};

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

  /**
   * Resolve a URL da imagem do produto, sem baixar nem converter.
   * Usa o mapeamento product-image-urls.json quando disponível.
   * Caso não haja mapeamento, monta URL usando PRODUCT_IMAGES_BASE_URL.
   */
  getProductImageUrl(product: Product): string | null {
    const folderName = NAME_TO_FOLDER[product.name] ?? product.name;
    // Candidatos de nome de arquivo: exato, " 1", "1", " 2", e product.image (quando informado)
    const fileCandidates: string[] = [];
    for (const ext of EXTENSIONS) {
      fileCandidates.push(folderName + ext);
      fileCandidates.push(folderName + " 1" + ext);
      fileCandidates.push(folderName + "1" + ext);
      fileCandidates.push(folderName + " 2" + ext);
    }
    if (product.image?.trim()) {
      fileCandidates.push(product.image.trim());
    }

    // 1) Tenta mapeamento de URLs externas (product-image-urls.json)
    const mapping = getProductImageUrls();
    if (Object.keys(mapping).length > 0) {
      for (const key of fileCandidates) {
        const url = mapping[key];
        if (url) {
          return url;
        }
      }
    }

    // 2) Fallback: PRODUCT_IMAGES_BASE_URL (imagens locais no frontend, ex.: /NomeProduto.jpg)
    if (!PRODUCT_IMAGES_BASE_URL) return null;
    const base = PRODUCT_IMAGES_BASE_URL.replace(/\/$/, "");
    const firstKey = fileCandidates[0];
    if (!firstKey) return null;
    return `${base}/${encodeURIComponent(firstKey)}`;
  }
}
