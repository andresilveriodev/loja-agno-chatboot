"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@/lib/api/crm";
import type { Order } from "@/lib/api/crm";
import { updateLeadStage, updateOrderStage } from "@/lib/api/crm";
import { ALL_KANBAN_COLUMNS } from "../constants";
import type { CardDropPayload } from "./KanbanColumn";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  leads: Lead[];
  orders: Order[];
  onOpenLead?: (leadId: string) => void;
}

export function KanbanBoard({ leads, orders, onOpenLead }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCardDrop = useCallback(
    async (payload: CardDropPayload, newStage: string) => {
      if (payload.currentStage === newStage) return;
      const id = payload.id;
      setUpdatingId(id);
      try {
        if (payload.type === "lead") {
          await updateLeadStage(id, newStage);
          await queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
        } else {
          await updateOrderStage(id, newStage);
          await queryClient.invalidateQueries({ queryKey: ["crm", "orders"] });
        }
      } finally {
        setUpdatingId(null);
      }
    },
    [queryClient],
  );

  const leadsByStage = groupBy(leads, "stage");
  const ordersByStage = groupBy(orders, "stage");

  return (
    <div className="crm-kanban-board">
      {ALL_KANBAN_COLUMNS.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          leads={column.type === "lead" ? leadsByStage[column.id] ?? [] : []}
          orders={column.type === "order" ? ordersByStage[column.id] ?? [] : []}
          updatingId={updatingId}
          onCardDrop={handleCardDrop}
          onOpenLead={onOpenLead}
        />
      ))}
    </div>
  );
}

function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) {
    const k = String(item[key]);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}
