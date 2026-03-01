/**
 * Sincroniza o schema do SQLite (cria/atualiza tabelas) antes de subir o Nest.
 * Uso no Render: Start Command = "npm run sync-db && npm run start"
 * Ou: node scripts/sync-db.js && npm run start
 */
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "loja.db");
const dbDir = path.dirname(dbPath);
if (dbDir && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const distEntities = path.join(process.cwd(), "dist", "entities");
const entityNames = [
  "activity.entity.js",
  "lead.entity.js",
  "message.entity.js",
  "order-counter.entity.js",
  "order-item.entity.js",
  "order.entity.js",
  "product.entity.js",
  "schedule.entity.js",
];
const entityFiles = entityNames
  .map((name) => path.join(distEntities, name))
  .filter((p) => fs.existsSync(p));
if (entityFiles.length === 0) {
  console.error("[sync-db] Nenhuma entity em dist/entities. Rode 'npm run build' antes.");
  process.exit(1);
}

async function sync() {
  const { DataSource } = require("typeorm");
  const ds = new DataSource({
    type: "better-sqlite3",
    database: dbPath,
    entities: entityFiles,
    synchronize: true,
  });
  await ds.initialize();
  await ds.synchronize();
  await ds.destroy();
  console.log("[sync-db] Schema sincronizado.");
}

sync().catch((err) => {
  console.error("[sync-db] Erro:", err);
  process.exit(1);
});
