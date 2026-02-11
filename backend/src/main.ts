import * as path from "path";
import { config } from "dotenv";

// Carregar .env antes de qualquer outro módulo (para AI_SERVICE_URL, etc.)
config({ path: path.resolve(process.cwd(), ".env") });

import * as fs from "fs";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { getCorsOrigins } from "./config";

async function bootstrap() {
  const dbPath = process.env.DATABASE_PATH || "data/loja.db";
  const dbDir = path.dirname(dbPath);
  if (dbDir && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;
  app.enableCors({
  origin: getCorsOrigins(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(port);
  console.log(`Backend rodando em http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error("Falha ao iniciar:", err);
  process.exit(1);
});
