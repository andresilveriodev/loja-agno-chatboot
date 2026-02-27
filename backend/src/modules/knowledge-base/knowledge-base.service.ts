import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

const KNOWLEDGE_DIR = "data/knowledge";

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  /** Opcional: versão curta (1–3 linhas); se existir, bot oferece "ver mais" para resposta completa. */
  resumo?: string;
  tags: string[];
}

export interface PolicyItem {
  id: string;
  tipo: string;
  titulo: string;
  texto: string;
  /** Opcional: versão curta; se existir, bot oferece "ver mais" para texto completo. */
  resumo?: string;
}

export interface PrazoItem {
  id: string;
  tipo: string;
  descricao: string;
  valor: number | null;
  observacao: string;
}

export interface EnderecoItem {
  id: string;
  tipo: string;
  endereco: string;
  cidade: string;
  cep?: string;
}

export interface HorarioItem {
  id: string;
  tipo: string;
  dias: string;
  horario: string;
}

export type SensitiveClaimType = "preco" | "prazo" | "garantia" | "endereco" | "horario" | "outro";

/** Template de incerteza (Fase 3: 1–3 linhas + opção 0). */
export const UNCERTAINTY_TEMPLATES: Record<SensitiveClaimType, string> = {
  preco:
    "O preço desse item eu preciso confirmar. Quer que eu verifique e te aviso?\n*Digite 0 para atendente.*",
  prazo:
    "⏱️ O prazo depende da sua região. Posso te passar para um atendente confirmar pro seu CEP?\n*Digite 0 para atendente.*",
  garantia:
    "A garantia desse produto vou confirmar. Quer que eu passe para um atendente?\n*Digite 0 para atendente.*",
  endereco:
    "Não tenho o endereço atualizado aqui. Posso confirmar e te mando?\n*Digite 0 para atendente.*",
  horario:
    "⏱️ O horário eu confirmo e te aviso.\n*Digite 0 para atendente.*",
  outro:
    "Não tenho essa informação certinha aqui. É sobre (A) preço, (B) prazo, (C) garantia ou (D) outro?\n*Digite 0 para atendente.*",
};

@Injectable()
export class KnowledgeBaseService {
  private knowledgePath: string;

  constructor() {
    this.knowledgePath = path.resolve(process.cwd(), KNOWLEDGE_DIR);
    if (!fs.existsSync(this.knowledgePath)) {
      this.knowledgePath = path.resolve(__dirname, "../../../..", KNOWLEDGE_DIR);
    }
  }

  private readJson<T>(filename: string): T | null {
    const filePath = path.join(this.knowledgePath, filename);
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw) as T;
      }
    } catch (e) {
      console.warn("[KnowledgeBase] Erro ao ler", filename, e instanceof Error ? e.message : e);
    }
    return null;
  }

  /** Busca no FAQ por termo (pergunta, resposta ou tags). Retorna o primeiro item que bater. */
  searchFaq(termo: string): FaqItem | null {
    const data = this.readJson<{ itens: FaqItem[] }>("faq.json");
    if (!data?.itens?.length) return null;
    const t = termo.toLowerCase().trim();
    for (const item of data.itens) {
      if (item.pergunta.toLowerCase().includes(t)) return item;
      if (item.resposta.toLowerCase().includes(t)) return item;
      if (item.tags.some((tag) => tag.toLowerCase().includes(t))) return item;
    }
    return null;
  }

  /** Lista todas as políticas ou filtra por tipo. */
  getPolicies(tipo?: string): PolicyItem[] {
    const data = this.readJson<{ itens: PolicyItem[] }>("policies.json");
    const itens = data?.itens ?? [];
    if (tipo) return itens.filter((p) => p.tipo === tipo);
    return itens;
  }

  getPrazos(): PrazoItem[] {
    const data = this.readJson<{ itens: PrazoItem[] }>("prazos.json");
    return data?.itens ?? [];
  }

  getEnderecos(): EnderecoItem[] {
    const data = this.readJson<{ itens: EnderecoItem[] }>("enderecos.json");
    return data?.itens ?? [];
  }

  getHorarios(): HorarioItem[] {
    const data = this.readJson<{ itens: HorarioItem[] }>("horarios.json");
    return data?.itens ?? [];
  }

  /** Retorna o template de incerteza para o tipo informado. */
  getUncertaintyTemplate(tipo: SensitiveClaimType = "outro"): string {
    return UNCERTAINTY_TEMPLATES[tipo] ?? UNCERTAINTY_TEMPLATES.outro;
  }

  /**
   * Indica se uma afirmação sensível provavelmente está na base.
   * Usado para decidir se substitui a resposta da IA pelo template de incerteza.
   */
  hasSensitiveClaimInBase(tipo: SensitiveClaimType): boolean {
    switch (tipo) {
      case "preco":
        return true; // preço vem do ProductsService, não da base estática
      case "prazo":
        return this.getPrazos().length > 0;
      case "garantia":
        return this.getPolicies("garantia").length > 0;
      case "endereco":
        return this.getEnderecos().length > 0;
      case "horario":
        return this.getHorarios().length > 0;
      default:
        return false;
    }
  }
}
