/**
 * Popula o SQLite com os produtos do catálogo.
 * Execute na pasta backend: npm run seed
 * Ou: npx ts-node src/scripts/seed-products.ts
 */
import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm";
import { Product } from "../entities/product.entity";

const defaultDbPath = "data/loja.db";

interface ProductSeed {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  specs: string;
  features: string[];
}

async function seed() {
  const databasePath = process.env.DATABASE_PATH ?? defaultDbPath;
  const dbDir = path.dirname(databasePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: databasePath,
    entities: [Product],
    synchronize: true,
  });

  await dataSource.initialize();

  const fromBackend = path.join(process.cwd(), "..", "PRODUTOS_CATALOGO.json");
  const fromRoot = path.join(process.cwd(), "PRODUTOS_CATALOGO.json");
  const filePath = fs.existsSync(fromBackend) ? fromBackend : fromRoot;

  if (!fs.existsSync(filePath)) {
    console.error(
      "Arquivo PRODUTOS_CATALOGO.json não encontrado. Procure em:",
      fromBackend,
      "ou",
      fromRoot,
    );
    await dataSource.destroy();
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const products: ProductSeed[] = JSON.parse(raw);

  const repo = dataSource.getRepository(Product);
  await repo.clear();
  await repo.save(products);

  console.log(
    `Seed concluído: ${products.length} produtos inseridos em ${databasePath}.`,
  );
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
