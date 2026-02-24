"use client";

import type { Order } from "@/lib/api/crm";
import { formatPrice } from "@/lib/format";
import { MessageCircle } from "lucide-react";

const PAYMENT_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Pago",
  failed: "Falha",
  refunded: "Reembolsado",
};

const SHIPPING_LABEL: Record<string, string> = {
  pending: "Pendente",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregue",
};

interface OrderCardProps {
  order: Order;
  isDragging?: boolean;
  isUpdating?: boolean;
}

export function OrderCard({ order, isDragging, isUpdating }: OrderCardProps) {
  const lead = order.lead;
  const paymentLabel = PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus;
  const shippingLabel = SHIPPING_LABEL[order.shippingStatus] ?? order.shippingStatus;
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "—";

  return (
    <div
      data-card-type="order"
      data-card-id={order.id}
      className={`
        crm-card
        ${isDragging ? "opacity-80 shadow-md" : ""}
        ${isUpdating ? "pointer-events-none animate-pulse opacity-70" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="crm-text-name" style={{ margin: 0, marginBottom: "2px" }}>
            #{order.orderNumber}
            {lead?.name && (
              <span className="crm-text-body" style={{ fontWeight: 500, marginLeft: "4px" }}>· {lead.name}</span>
            )}
          </p>
          <p className="crm-text-body" style={{ margin: 0, fontSize: "13px" }}>
            {formatPrice(order.total)} · {date}
          </p>
          <p className="crm-text-meta" style={{ marginTop: "2px" }}>
            {paymentLabel} · {shippingLabel}
            {order.trackingCode && ` · ${order.trackingCode}`}
          </p>
        </div>
        {lead?.phone && (
          <a
            href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded p-1.5 hover:opacity-80"
            style={{ color: "#16a34a" }}
            aria-label="Abrir WhatsApp"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
