"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, MessageCircle, Calendar, Package, FileText } from "lucide-react";
import {
  fetchLeadById,
  fetchLeadHistory,
  createSchedule,
  updateSchedule,
  type LeadDetail,
  type LeadHistoryResponse,
  type Schedule,
} from "@/lib/api/crm";
import { formatPrice } from "@/lib/format";

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
}

const SCHEDULE_TYPE_LABEL: Record<string, string> = {
  call: "Ligação",
  visit: "Visita",
  callback: "Retorno",
  delivery: "Entrega",
};

const SCHEDULE_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  completed: "Realizado",
  cancelled: "Cancelado",
};

export function LeadDetailModal({ leadId, onClose }: LeadDetailModalProps) {
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["crm", "lead", leadId],
    queryFn: () => fetchLeadById(leadId!),
    enabled: !!leadId,
  });

  const { data: history } = useQuery({
    queryKey: ["crm", "lead", leadId, "history"],
    queryFn: () => fetchLeadHistory(leadId!, { limit: 50 }),
    enabled: !!leadId,
  });

  const createScheduleMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateSchedule>[1] }) =>
      updateSchedule(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
    },
  });

  if (!leadId) return null;

  return (
    <div
      className="crm-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-detail-title"
    >
      <div
        className="crm-modal-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100vh" }}>
          <div className="crm-modal-header">
            <h2 id="lead-detail-title" className="crm-text-drawer-title" style={{ margin: 0 }}>
              Detalhe do lead
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="crm-btn crm-btn-icon"
              aria-label="Fechar"
            >
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px 0" }}>
                <div className="crm-spinner" style={{ width: 32, height: 32 }} />
              </div>
            ) : lead ? (
              <LeadDetailContent
                lead={lead}
                historyData={history?.data}
                onCreateSchedule={createScheduleMutation.mutateAsync}
                onUpdateSchedule={(id, body) =>
                  updateScheduleMutation.mutateAsync({ id, body })
                }
                isCreatingSchedule={createScheduleMutation.isPending}
              />
            ) : (
              <p className="crm-text-body" style={{ padding: "var(--crm-ds-spacing-04)" }}>Lead não encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadDetailContent({
  lead,
  historyData,
  onCreateSchedule,
  onUpdateSchedule,
  isCreatingSchedule,
}: {
  lead: LeadDetail;
  historyData: LeadHistoryResponse["data"] | undefined;
  onCreateSchedule: (body: Parameters<typeof createSchedule>[0]) => Promise<Schedule>;
  onUpdateSchedule: (id: string, body: Parameters<typeof updateSchedule>[1]) => Promise<Schedule>;
  isCreatingSchedule: boolean;
}) {
  const schedules = lead.schedules ?? [];
  const orders = lead.orders ?? [];

  return (
    <div style={{ padding: "var(--crm-ds-spacing-04)", display: "flex", flexDirection: "column", gap: "var(--crm-ds-spacing-06)" }}>
      <ResumoSection lead={lead} />
      <AgendamentosSection
        leadId={lead.id}
        schedules={schedules}
        onCreateSchedule={onCreateSchedule}
        onUpdateSchedule={onUpdateSchedule}
        isCreating={isCreatingSchedule}
      />
      <TimelineSection items={historyData ?? []} />
      <PedidosSection orders={orders} />
      {lead.notes && (
        <section>
          <h3 className="crm-text-name" style={{ marginBottom: "var(--crm-ds-spacing-02)", display: "flex", alignItems: "center", gap: "var(--crm-ds-spacing-02)" }}>
            <FileText style={{ width: 16, height: 16 }} />
            Notas
          </h3>
          <p className="crm-card crm-text-body" style={{ margin: 0, padding: "var(--crm-ds-spacing-03)", whiteSpace: "pre-wrap" }}>
            {lead.notes}
          </p>
        </section>
      )}
    </div>
  );
}

function ResumoSection({ lead }: { lead: LeadDetail }) {
  const stageLabel =
    lead.stage === "new_lead"
      ? "Novo Lead"
      : lead.stage === "qualified"
        ? "Qualificado"
        : lead.stage === "products_shown"
          ? "Produtos Apresentados"
          : lead.stage === "quotation"
            ? "Cotação"
            : lead.stage === "negotiation"
              ? "Negociação"
              : lead.stage === "won"
                ? "Fechado (Ganho)"
                : lead.stage === "lost"
                  ? "Perdido"
                  : lead.stage;

  return (
    <section>
      <h3 className="crm-text-name" style={{ marginBottom: "var(--crm-ds-spacing-02)", fontSize: 14 }}>Resumo</h3>
      <div className="crm-card" style={{ padding: "var(--crm-ds-spacing-03)" }}>
        <p className="crm-text-name" style={{ margin: 0 }}>{lead.name}</p>
        <p style={{ marginTop: "var(--crm-ds-spacing-01)", margin: "var(--crm-ds-spacing-01) 0 0 0" }}>
          <a
            href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#16a34a", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <MessageCircle style={{ width: 16, height: 16 }} />
            {lead.phone}
          </a>
        </p>
        {lead.company && <p className="crm-text-meta" style={{ margin: 0 }}>{lead.company}</p>}
        {lead.email && <p className="crm-text-meta" style={{ margin: 0 }}>{lead.email}</p>}
        <p style={{ marginTop: "var(--crm-ds-spacing-02)", display: "flex", flexWrap: "wrap", gap: "var(--crm-ds-spacing-02)" }}>
          <span className="crm-tag">{stageLabel}</span>
          <span className="crm-tag">{lead.source === "whatsapp" ? "WhatsApp" : "Web"}</span>
          {lead.intent && <span className="crm-tag" style={{ background: "rgba(245,158,11,0.2)", color: "#92400e" }}>{lead.intent}</span>}
        </p>
        {lead.estimatedValue > 0 && (
          <p className="crm-text-body" style={{ marginTop: "var(--crm-ds-spacing-02)", marginBottom: 0, fontWeight: 600 }}>
            Valor estimado: {formatPrice(lead.estimatedValue)}
          </p>
        )}
        <p className="crm-text-meta" style={{ marginTop: "var(--crm-ds-spacing-01)", marginBottom: 0 }}>
          Criado em {new Date(lead.createdAt).toLocaleString("pt-BR")}
          {lead.lastInteractionAt &&
            ` · Última interação: ${new Date(lead.lastInteractionAt).toLocaleString("pt-BR")}`}
        </p>
      </div>
    </section>
  );
}

function TimelineSection({
  items,
}: {
  items: LeadHistoryResponse["data"];
}) {
  if (items.length === 0) {
    return (
      <section>
        <h3 className="crm-text-name" style={{ marginBottom: "var(--crm-ds-spacing-02)", fontSize: 14 }}>Timeline</h3>
        <p className="crm-text-meta">Nenhuma mensagem ou atividade ainda.</p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="crm-text-name" style={{ marginBottom: "var(--crm-ds-spacing-02)", fontSize: 14 }}>Timeline</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--crm-ds-spacing-02)" }}>
        {items.map((entry, i) => (
          <li
            key={
              entry.type === "message"
                ? `msg-${entry.item.id}-${i}`
                : `act-${entry.item.id}-${i}`
            }
            className="crm-card"
            style={{ padding: "var(--crm-ds-spacing-03)" }}
          >
            {entry.type === "message" ? (
              <>
                <p className="crm-text-meta" style={{ display: "flex", justifyContent: "space-between", margin: 0 }}>
                  <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{entry.item.sender}</span>
                  <span>
                    {new Date(entry.item.createdAt).toLocaleString("pt-BR")} ·
                    {entry.item.source === "whatsapp" ? " WhatsApp" : " Web"}
                  </span>
                </p>
                <p className="crm-text-body" style={{ marginTop: "var(--crm-ds-spacing-01)", marginBottom: 0, whiteSpace: "pre-wrap" }}>
                  {entry.item.content}
                </p>
              </>
            ) : (
              <>
                <p className="crm-text-meta" style={{ display: "flex", justifyContent: "space-between", margin: 0 }}>
                  <span style={{ fontWeight: 600 }}>{entry.item.title}</span>
                  {new Date(entry.item.createdAt).toLocaleString("pt-BR")}
                </p>
                {entry.item.description && (
                  <p className="crm-text-body" style={{ marginTop: "var(--crm-ds-spacing-01)", marginBottom: 0 }}>{entry.item.description}</p>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function AgendamentosSection({
  leadId,
  schedules,
  onCreateSchedule,
  onUpdateSchedule,
  isCreating,
}: {
  leadId: string;
  schedules: Schedule[];
  onCreateSchedule: (body: Parameters<typeof createSchedule>[0]) => Promise<Schedule>;
  onUpdateSchedule: (id: string, body: Parameters<typeof updateSchedule>[1]) => Promise<Schedule>;
  isCreating: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "call",
    scheduledAt: "",
    title: "",
    description: "",
    address: "",
    cep: "",
    deliveryItems: "",
  });

  const isDelivery = form.type === "delivery";
  const initialForm = { type: "call" as const, scheduledAt: "", title: "", description: "", address: "", cep: "", deliveryItems: "" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.scheduledAt || !form.title.trim()) return;
    const payload: Parameters<typeof onCreateSchedule>[0] = {
      leadId,
      type: form.type,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      title: form.title.trim(),
      description: form.description.trim(),
    };
    if (isDelivery) {
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.cep.trim()) payload.cep = form.cep.trim();
      if (form.deliveryItems.trim()) payload.deliveryItems = form.deliveryItems.trim();
    }
    await onCreateSchedule(payload);
    setForm(initialForm);
    setShowForm(false);
  }

  return (
    <section>
      <div style={{ marginBottom: "var(--crm-ds-spacing-02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 className="crm-text-name" style={{ margin: 0, display: "flex", alignItems: "center", gap: "var(--crm-ds-spacing-02)", fontSize: 14 }}>
          <Calendar style={{ width: 16, height: 16 }} />
          Agendamentos
        </h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="crm-btn crm-btn-outline"
          style={{ padding: "var(--crm-ds-spacing-01) var(--crm-ds-spacing-02)", fontSize: 12 }}
        >
          {showForm ? "Cancelar" : "Novo agendamento"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="crm-card"
          style={{ marginBottom: "var(--crm-ds-spacing-03)", padding: "var(--crm-ds-spacing-03)" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--crm-ds-spacing-02)" }}>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="crm-input"
            >
              <option value="call">Ligação</option>
              <option value="visit">Visita</option>
              <option value="callback">Retorno</option>
              <option value="delivery">Entrega</option>
            </select>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
              required
              className="crm-input"
            />
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Título"
              required
              className="crm-input"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={isDelivery ? "Descrição do local (ex.: portaria, bloco A)" : "Descrição (opcional)"}
              rows={2}
              className="crm-input"
              style={{ minHeight: 60, padding: "var(--crm-ds-spacing-02) var(--crm-ds-spacing-03)" }}
            />
            {isDelivery && (
              <>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Endereço completo"
                  className="crm-input"
                />
                <input
                  type="text"
                  value={form.cep}
                  onChange={(e) => setForm((p) => ({ ...p, cep: e.target.value }))}
                  placeholder="CEP"
                  className="crm-input"
                />
                <input
                  type="text"
                  value={form.deliveryItems}
                  onChange={(e) => setForm((p) => ({ ...p, deliveryItems: e.target.value }))}
                  placeholder="Itens (ex.: 2x Furadeira, 1x Serra)"
                  className="crm-input"
                />
              </>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="crm-btn crm-btn-primary"
            >
              {isCreating ? "Salvando…" : "Criar agendamento"}
            </button>
          </div>
        </form>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--crm-ds-spacing-02)" }}>
        {schedules.length === 0 && !showForm ? (
          <p className="crm-text-meta">Nenhum agendamento.</p>
        ) : (
          schedules.map((s) => (
            <li
              key={s.id}
              className="crm-card"
              style={{ padding: "var(--crm-ds-spacing-03)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--crm-ds-spacing-02)" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="crm-text-name" style={{ margin: 0, fontSize: 14 }}>{s.title}</p>
                <p className="crm-text-meta" style={{ margin: 0 }}>
                  {SCHEDULE_TYPE_LABEL[s.type] ?? s.type} · {new Date(s.scheduledAt).toLocaleString("pt-BR")} · {SCHEDULE_STATUS_LABEL[s.status] ?? s.status}
                </p>
                {s.type === "delivery" && (s.address || s.cep || s.deliveryItems || s.description) && (
                  <div className="crm-text-meta" style={{ marginTop: "var(--crm-ds-spacing-02)", fontSize: 12 }}>
                    {s.address && <p style={{ margin: 0 }}>📍 {s.address}{s.cep ? ` — CEP ${s.cep}` : ""}</p>}
                    {s.description && <p style={{ margin: "var(--crm-ds-spacing-01) 0 0" }}>📝 {s.description}</p>}
                    {s.deliveryItems && <p style={{ margin: "var(--crm-ds-spacing-01) 0 0" }}>📦 {s.deliveryItems}</p>}
                  </div>
                )}
              </div>
              {s.status === "pending" && (
                <div className="crm-flex-wrap">
                  <button
                    type="button"
                    onClick={() => onUpdateSchedule(s.id, { status: "completed" })}
                    className="crm-btn crm-btn-outline"
                    style={{ fontSize: 12, padding: "var(--crm-ds-spacing-01) var(--crm-ds-spacing-02)", borderColor: "#16a34a", color: "#16a34a" }}
                  >
                    Realizado
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSchedule(s.id, { status: "cancelled" })}
                    className="crm-btn crm-btn-outline"
                    style={{ fontSize: 12, padding: "var(--crm-ds-spacing-01) var(--crm-ds-spacing-02)", borderColor: "#b91c1c", color: "#b91c1c" }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function PedidosSection({ orders }: { orders: LeadDetail["orders"] }) {
  const list = orders ?? [];
  if (list.length === 0) return null;

  return (
    <section>
      <h3 className="crm-text-name" style={{ marginBottom: "var(--crm-ds-spacing-02)", display: "flex", alignItems: "center", gap: "var(--crm-ds-spacing-02)", fontSize: 14 }}>
        <Package style={{ width: 16, height: 16 }} />
        Pedidos
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--crm-ds-spacing-02)" }}>
        {list.map((order: { id: string; orderNumber: number; total: number; stage: string }) => (
          <li key={order.id} className="crm-card" style={{ padding: "var(--crm-ds-spacing-03)" }}>
            <p className="crm-text-name" style={{ margin: 0, fontSize: 14 }}>
              Pedido #{order.orderNumber} · {formatPrice(order.total)}
            </p>
            <p className="crm-text-meta" style={{ margin: 0 }}>Estágio: {order.stage}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
