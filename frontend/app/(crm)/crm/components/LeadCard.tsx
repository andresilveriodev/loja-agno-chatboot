"use client";

import type { Lead } from "@/lib/api/crm";
import { formatPrice } from "@/lib/format";
import { MessageCircle, Building2 } from "lucide-react";

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  isUpdating?: boolean;
}

export function LeadCard({ lead, isDragging, isUpdating }: LeadCardProps) {
  const products = lead.productsOfInterest ?? [];
  const summary = products.slice(0, 2).join(", ") + (products.length > 2 ? ` +${products.length - 2}` : "");

  return (
    <div
      data-card-type="lead"
      data-card-id={lead.id}
      className={`
        crm-card
        ${isDragging ? "opacity-80 shadow-md" : ""}
        ${isUpdating ? "pointer-events-none animate-pulse opacity-70" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="crm-text-name" style={{ marginBottom: "var(--crm-ds-spacing-02)" }}>{lead.name}</p>
          <p className="crm-text-body" style={{ margin: 0, fontSize: "13px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            <a
              href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--crm-ds-primary-text)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {lead.phone}
            </a>
            {lead.company && (
              <>
                <span style={{ color: "var(--crm-ds-neutral-icon-low)" }}>·</span>
                <span className="flex items-center gap-0.5 truncate">
                  <Building2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--crm-ds-neutral-icon-low)" }} />
                  {lead.company}
                </span>
              </>
            )}
          </p>
          <p className="crm-text-meta" style={{ marginTop: "var(--crm-ds-spacing-01)" }}>
            {lead.estimatedValue > 0 && (
              <span>{formatPrice(lead.estimatedValue)}</span>
            )}
            <span>{formatRelativeTime(lead.lastInteractionAt)}</span>
          </p>
          {(summary || lead.intent) && (
            <p className="crm-text-meta truncate" style={{ marginTop: "2px" }}>
              {summary || lead.intent || ""}
            </p>
          )}
        </div>
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
      </div>
    </div>
  );
}
