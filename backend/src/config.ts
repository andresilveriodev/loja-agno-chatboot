/**
 * Origens permitidas para CORS (REST e WebSocket).
 * Use CORS_ORIGIN com várias URLs separadas por vírgula, ou uma única URL.
 */
const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3004",
];

export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return DEFAULT_ORIGINS;
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}
