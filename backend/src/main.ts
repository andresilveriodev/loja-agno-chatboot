import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { getCorsOrigins } from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;
  app.enableCors({ origin: getCorsOrigins(), credentials: true });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(port);
  console.log(`Backend rodando em http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error("Falha ao iniciar:", err);
  process.exit(1);
});
