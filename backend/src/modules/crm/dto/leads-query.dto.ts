/**
 * Query params para GET /api/crm/leads
 * Paginação, filtros e ordenação.
 */
export interface LeadsQueryDto {
  /** Limite de itens (default 50) */
  limit?: number;
  /** Offset para paginação (default 0) */
  offset?: number;
  /** Estágios do funil (vírgula ou múltiplos). Ex: stage=new_lead&stage=qualified */
  stage?: string | string[];
  /** Origem: web | whatsapp */
  source?: string;
  /** Intenção (valor livre) */
  intent?: string;
  /** Data inicial (ISO ou YYYY-MM-DD) - criação ou última interação */
  from?: string;
  /** Data final (ISO ou YYYY-MM-DD) */
  to?: string;
  /** Busca por nome ou telefone */
  q?: string;
  /** Ordenação: createdAt | lastInteractionAt | updatedAt. Prefixo - para desc. Ex: -lastInteractionAt */
  sort?: string;
}

export const DEFAULT_LEADS_LIMIT = 50;
export const MAX_LEADS_LIMIT = 200;
