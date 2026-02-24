/**
 * Cria 6 leads de exemplo no banco (SQLite).
 * Execute na pasta backend: npm run seed:leads
 * Ou: npx ts-node src/scripts/seed-leads.ts
 */
import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm";
import { Lead } from "../entities/lead.entity";

const defaultDbPath = "data/loja.db";

const EXAMPLE_PHONES = [
  "11999990001",
  "11999990002",
  "11999990003",
  "11999990004",
  "11999990005",
  "11999990006",
];

interface LeadSeed {
  name: string;
  phone: string;
  company: string | null;
  email: string | null;
  intent: string | null;
  productsOfInterest: string[];
  estimatedValue: number;
  stage: string;
  source: string;
  notes: string | null;
  lastInteractionAt: Date | null;
}

const EXAMPLE_LEADS: LeadSeed[] = [
  {
    name: "Ana Silva",
    phone: "11999990001",
    company: "Indústria Beta Ltda",
    email: "ana.silva@industriabeta.com.br",
    intent: "Cotação de equipamentos",
    productsOfInterest: ["Compressor 2HP", "Serra tico-tico"],
    estimatedValue: 8500,
    stage: "new_lead",
    source: "web",
    notes: "Primeiro contato pelo site.",
    lastInteractionAt: new Date(),
  },
  {
    name: "Bruno Oliveira",
    phone: "11999990002",
    company: "Construtora Norte",
    email: "bruno@construtoranorte.com",
    intent: "Compra imediata",
    productsOfInterest: ["Betoneira", "Vibrador de concreto"],
    estimatedValue: 15000,
    stage: "qualified",
    source: "whatsapp",
    notes: null,
    lastInteractionAt: new Date(Date.now() - 3600000),
  },
  {
    name: "Carla Mendes",
    phone: "11999990003",
    company: null,
    email: "carla.mendes@gmail.com",
    intent: "Dúvida técnica",
    productsOfInterest: ["Furadeira de impacto"],
    estimatedValue: 1200,
    stage: "products_shown",
    source: "web",
    notes: "Interesse em linha profissional.",
    lastInteractionAt: new Date(Date.now() - 86400000),
  },
  {
    name: "Diego Costa",
    phone: "11999990004",
    company: "Auto Center Central",
    email: "diego@autocenter.com.br",
    intent: "Revenda",
    productsOfInterest: ["Compressor", "Lixadeira", "Pistola de pintura"],
    estimatedValue: 22000,
    stage: "quotation",
    source: "whatsapp",
    notes: "Pediu proposta para 3 unidades de cada.",
    lastInteractionAt: new Date(Date.now() - 7200000),
  },
  {
    name: "Elena Santos",
    phone: "11999990005",
    company: "Restaurante Sabor & Arte",
    email: "elena@saborearte.com.br",
    intent: "Compra imediata",
    productsOfInterest: ["Fogão industrial", "Freezer vertical"],
    estimatedValue: 18500,
    stage: "negotiation",
    source: "whatsapp",
    notes: "Aguardando aprovação de desconto.",
    lastInteractionAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    name: "Fernando Lima",
    phone: "11999990006",
    company: "Academia Força Total",
    email: "fernando@forcatotal.com",
    intent: "Orçamento anual",
    productsOfInterest: ["Esteira", "Bicicleta ergométrica", "Aparelhos de musculação"],
    estimatedValue: 45000,
    stage: "won",
    source: "web",
    notes: "Fechado em 18/02. Entregar em 30 dias.",
    lastInteractionAt: new Date(Date.now() - 86400000 * 2),
  },
];

async function seed() {
  const databasePath = process.env.DATABASE_PATH ?? defaultDbPath;
  const dbDir = path.dirname(databasePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: databasePath,
    entities: [Lead],
    synchronize: false,
  });

  await dataSource.initialize();

  const repo = dataSource.getRepository(Lead);

  for (let i = 0; i < EXAMPLE_PHONES.length; i++) {
    const phone = EXAMPLE_PHONES[i];
    const existing = await repo.findOne({ where: { phone } });
    if (existing) {
      await repo.update(existing.id, EXAMPLE_LEADS[i]);
      console.log("Atualizado lead:", EXAMPLE_LEADS[i].name, "(", phone, ")");
    } else {
      await repo.save(repo.create(EXAMPLE_LEADS[i]));
      console.log("Criado lead:", EXAMPLE_LEADS[i].name, "(", phone, ")");
    }
  }

  await dataSource.destroy();
  console.log("Seed de leads concluído. 6 leads de exemplo disponíveis.");
}

seed().catch((err) => {
  console.error("Erro ao executar seed de leads:", err);
  process.exit(1);
});
