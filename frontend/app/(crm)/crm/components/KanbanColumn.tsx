"use client";

import type { Lead } from "@/lib/api/crm";
import type { Order } from "@/lib/api/crm";
import type { KanbanColumnConfig } from "../constants";
import { LeadCard } from "./LeadCard";
import { OrderCard } from "./OrderCard";

export type CardDropPayload = {
  type: "lead" | "order";
  id: string;
  currentStage: string;
};

interface KanbanColumnProps {
  column: KanbanColumnConfig;
  leads: Lead[];
  orders: Order[];
  updatingId: string | null;
  onCardDrop: (payload: CardDropPayload, newStage: string) => void;
  onOpenLead?: (leadId: string) => void;
}

export function KanbanColumn({
  column,
  leads,
  orders,
  updatingId,
  onCardDrop,
  onOpenLead,
}: KanbanColumnProps) {
  const count = column.type === "lead" ? leads.length : orders.length;

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("crm-column-drag-over");
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove("crm-column-drag-over");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.currentTarget.classList.remove("crm-column-drag-over");
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const payload = JSON.parse(raw) as CardDropPayload;
      if (!payload.type || !payload.id || payload.currentStage === column.id) return;
      if (payload.type !== column.type) return;
      onCardDrop(payload, column.id);
    } catch {
      // ignore invalid drop data
    }
  }

  return (
    <div
      className={`crm-column min-w-[280px] max-w-[280px] shrink-0 rounded-xl border-2 border-dashed ${column.accentClass} ${column.bgClass} p-2 transition`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`mb-2 flex items-center justify-between rounded-lg border ${column.accentClass} px-3 py-2`}>
        <h3 className="crm-text-stage" style={{ margin: 0, fontSize: "14px" }}>{column.label}</h3>
        <span className="crm-tag" style={{ padding: "2px 8px" }}>{count}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {column.type === "lead" &&
          leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              currentStage={column.id}
              isUpdating={updatingId === lead.id}
              onOpenLead={onOpenLead}
            />
          ))}
        {column.type === "order" &&
          orders.map((order) => (
            <DraggableOrderCard
              key={order.id}
              order={order}
              currentStage={column.id}
              isUpdating={updatingId === order.id}
            />
          ))}
        {count === 0 && (
          <p className="crm-text-meta" style={{ padding: "16px 0", textAlign: "center" }}>
            Nenhum {column.type === "lead" ? "lead" : "pedido"} aqui
          </p>
        )}
      </div>
    </div>
  );
}

function DraggableLeadCard({
  lead,
  currentStage,
  isUpdating,
  onOpenLead,
}: {
  lead: Lead;
  currentStage: string;
  isUpdating: boolean;
  onOpenLead?: (leadId: string) => void;
}) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "lead",
        id: lead.id,
        currentStage,
      } satisfies CardDropPayload),
    );
    e.dataTransfer.effectAllowed = "move";
  }

  function handleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) return;
    onOpenLead?.(lead.id);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenLead?.(lead.id);
        }
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <LeadCard lead={lead} isUpdating={isUpdating} />
    </div>
  );
}

function DraggableOrderCard({
  order,
  currentStage,
  isUpdating,
}: {
  order: Order;
  currentStage: string;
  isUpdating: boolean;
}) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "order",
        id: order.id,
        currentStage,
      } satisfies CardDropPayload),
    );
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing"
    >
      <OrderCard order={order} isUpdating={isUpdating} />
    </div>
  );
}
