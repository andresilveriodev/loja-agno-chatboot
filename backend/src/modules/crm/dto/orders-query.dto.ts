/**
 * Query params para GET /api/crm/orders
 */
export interface OrdersQueryDto {
  limit?: number;
  offset?: number;
  /** Estágio do pedido (payment_pending, payment_confirmed, etc.) */
  stage?: string | string[];
  /** Filtrar por lead */
  leadId?: string;
  from?: string;
  to?: string;
  sort?: string;
}

export const DEFAULT_ORDERS_LIMIT = 50;
export const MAX_ORDERS_LIMIT = 200;
