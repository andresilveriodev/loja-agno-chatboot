/**
 * Script para popular o MongoDB com os produtos do catálogo.
 * Execute: npx ts-node src/scripts/seed-products.ts
 * Ou com DATABASE_URL: DATABASE_URL=mongodb://localhost:27017/loja-db npx ts-node src/scripts/seed-products.ts
 */
import * as mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

const COLLECTION = "products";

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
  const databaseUrl = process.env.DATABASE_URL ?? "mongodb://localhost:27017/loja-db";

  const conn = await mongoose.connect(databaseUrl);
  const client = conn.connection.getClient();
  const db = client.db();

  // Executando de backend/: cwd = backend → ../PRODUTOS_CATALOGO.json
  const fromBackend = path.join(process.cwd(), "..", "PRODUTOS_CATALOGO.json");
  const fromRoot = path.join(process.cwd(), "PRODUTOS_CATALOGO.json");
  const filePath = fs.existsSync(fromBackend) ? fromBackend : fromRoot;

  if (!fs.existsSync(filePath)) {
    console.error("Arquivo PRODUTOS_CATALOGO.json não encontrado. Procure em:", fromBackend, "ou", fromRoot);
    await mongoose.disconnect();
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const products: ProductSeed[] = JSON.parse(raw);

  await db.collection(COLLECTION).deleteMany({});
  const result = await db.collection(COLLECTION).insertMany(products as unknown as Record<string, unknown>[]);
  console.log(`Seed concluído: ${result.insertedCount} produtos inseridos em ${COLLECTION}.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
