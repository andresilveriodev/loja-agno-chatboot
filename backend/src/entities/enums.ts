/**
 * Estágios do funil de vendas (Lead) – colunas 1 a 7 do Kanban.
 * Não usar para pedidos (Order).
 */
export enum LeadStage {
  NEW_LEAD = "new_lead",
  QUALIFIED = "qualified",
  PRODUCTS_SHOWN = "products_shown",
  QUOTATION = "quotation",
  NEGOTIATION = "negotiation",
  WON = "won",
  LOST = "lost",
}

/**
 * Estágios do funil de compra (Order) – colunas 8 a 12 do Kanban.
 * Não usar para leads.
 */
export enum OrderStage {
  PAYMENT_PENDING = "payment_pending",
  PAYMENT_CONFIRMED = "payment_confirmed",
  PREPARING = "preparing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
}

export const LEAD_STAGES: LeadStage[] = Object.values(LeadStage);
export const ORDER_STAGES: OrderStage[] = Object.values(OrderStage);

/** Origem do lead/contato */
export type LeadSource = "web" | "whatsapp";

/** Remetente da mensagem */
export type MessageSender = "user" | "bot" | "agent";

/** Tipo de agendamento */
export type ScheduleType = "call" | "visit" | "callback";

/** Status do agendamento */
export type ScheduleStatus = "pending" | "completed" | "cancelled";

export const SCHEDULE_TYPES: ScheduleType[] = ["call", "visit", "callback"];
export const SCHEDULE_STATUSES: ScheduleStatus[] = [
  "pending",
  "completed",
  "cancelled",
];

/** Tipo de atividade (timeline/auditoria) */
export type ActivityType = "stage_change" | "note" | "message" | "call";

/** Método de pagamento */
export type PaymentMethod = "pix" | "boleto" | "card" | "transfer";

/** Status do pagamento */
export type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";

/** Status da entrega */
export type ShippingStatus = "pending" | "preparing" | "shipped" | "delivered";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "pix",
  "boleto",
  "card",
  "transfer",
];
export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "confirmed",
  "failed",
  "refunded",
];
export const SHIPPING_STATUSES: ShippingStatus[] = [
  "pending",
  "preparing",
  "shipped",
  "delivered",
];
