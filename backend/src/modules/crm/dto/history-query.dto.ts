/**
 * Query params para GET /api/crm/leads/:id/history
 */
export interface HistoryQueryDto {
  limit?: number;
  offset?: number;
  /** Opcional: buscar antes desta data (cursor) */
  before?: string;
}

export const DEFAULT_HISTORY_LIMIT = 50;
export const MAX_HISTORY_LIMIT = 100;
