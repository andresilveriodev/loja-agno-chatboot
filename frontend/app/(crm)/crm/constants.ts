/**
 * Colunas do Kanban: estágios de lead (venda) e estágios de pedido (compra).
 */

export interface KanbanColumnConfig {
  id: string;
  label: string;
  type: "lead" | "order";
  bgClass: string;
  accentClass: string;
}

export const LEAD_STAGE_COLUMNS: KanbanColumnConfig[] = [
  { id: "new_lead", label: "Novo Lead", type: "lead", bgClass: "bg-slate-50", accentClass: "border-slate-300 text-slate-700" },
  { id: "qualified", label: "Qualificado", type: "lead", bgClass: "bg-sky-50", accentClass: "border-sky-300 text-sky-700" },
  { id: "products_shown", label: "Produtos Apresentados", type: "lead", bgClass: "bg-blue-50", accentClass: "border-blue-300 text-blue-700" },
  { id: "quotation", label: "Cotação", type: "lead", bgClass: "bg-amber-50", accentClass: "border-amber-300 text-amber-700" },
  { id: "negotiation", label: "Negociação", type: "lead", bgClass: "bg-orange-50", accentClass: "border-orange-300 text-orange-700" },
  { id: "won", label: "Fechado (Ganho)", type: "lead", bgClass: "bg-emerald-50", accentClass: "border-emerald-300 text-emerald-700" },
  { id: "lost", label: "Perdido", type: "lead", bgClass: "bg-red-50", accentClass: "border-red-300 text-red-700" },
];

export const ORDER_STAGE_COLUMNS: KanbanColumnConfig[] = [
  { id: "payment_pending", label: "Pag. pendente", type: "order", bgClass: "bg-amber-50", accentClass: "border-amber-300 text-amber-700" },
  { id: "payment_confirmed", label: "Pag. confirmado", type: "order", bgClass: "bg-green-50", accentClass: "border-green-300 text-green-700" },
  { id: "preparing", label: "Em preparação", type: "order", bgClass: "bg-violet-50", accentClass: "border-violet-300 text-violet-700" },
  { id: "shipped", label: "Enviado", type: "order", bgClass: "bg-indigo-50", accentClass: "border-indigo-300 text-indigo-700" },
  { id: "delivered", label: "Entregue", type: "order", bgClass: "bg-emerald-50", accentClass: "border-emerald-300 text-emerald-700" },
];

export const ALL_KANBAN_COLUMNS = [...LEAD_STAGE_COLUMNS, ...ORDER_STAGE_COLUMNS];
