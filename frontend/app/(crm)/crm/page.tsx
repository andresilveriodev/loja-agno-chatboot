"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, fetchOrders, fetchSeedLeads } from "@/lib/api/crm";
import { getBaseUrl } from "@/lib/api/client";
import { KanbanBoard } from "./components/KanbanBoard";
import { CrmFilters } from "./components/CrmFilters";
import { LeadDetailModal } from "./components/LeadDetailModal";
import { DEFAULT_CRM_FILTERS, type CrmFiltersState } from "./types";

export default function CrmPage() {
  const [filters, setFilters] = useState<CrmFiltersState>(DEFAULT_CRM_FILTERS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const leadParams = {
    limit: 200,
    stage: filters.stage.length ? filters.stage : undefined,
    source: filters.source || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    intent: filters.intent || undefined,
    q: filters.q || undefined,
  };

  const { data: leadsData, isLoading: loadingLeads, error: errorLeads } = useQuery({
    queryKey: ["crm", "leads", leadParams],
    queryFn: () => fetchLeads(leadParams),
  });

  const { data: ordersData, isLoading: loadingOrders, error: errorOrders } = useQuery({
    queryKey: ["crm", "orders", { limit: 200 }],
    queryFn: () => fetchOrders({ limit: 200 }),
  });

  const leads = leadsData?.data ?? [];
  const orders = ordersData?.data ?? [];
  const isLoading = loadingLeads || loadingOrders;
  const error = errorLeads || errorOrders;

  const queryClient = useQueryClient();
  const seedMutation = useMutation({
    mutationFn: fetchSeedLeads,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
    },
  });

  const handleApplyFilters = useCallback((f: CrmFiltersState) => {
    setFilters(f);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_CRM_FILTERS);
  }, []);

  return (
    <>
      <div className="crm-toolbar">
        <div className="crm-flex-wrap">
          <span className="crm-text-stage">Funil</span>
          <span className="crm-text-meta">(leads e pedidos)</span>
        </div>
        <div className="crm-flex-wrap">
          <CrmFilters
            filters={filters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>
      </div>

      <div className="crm-main">
        {error && (
          <div className="crm-card crm-mb-4" style={{ borderColor: "var(--crm-ds-neutral-border)", marginBottom: "var(--crm-ds-spacing-04)" }}>
            <p className="crm-text-body" style={{ color: "#b91c1c" }}>
              Erro ao carregar dados. Backend usado: <code>{getBaseUrl()}</code> (rota <code>api/crm</code>). No Vercel, defina <code>NEXT_PUBLIC_API_URL</code> em Production e Preview e faça Redeploy.
            </p>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
            <div className="crm-spinner" />
          </div>
        ) : !error && leads.length === 0 && orders.length === 0 ? (
          <div className="crm-card" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "var(--crm-ds-spacing-08)" }}>
            <p className="crm-text-name" style={{ marginBottom: "var(--crm-ds-spacing-02)" }}>
              Nenhum lead ou pedido ainda
            </p>
            <p className="crm-text-body" style={{ marginBottom: "var(--crm-ds-spacing-04)" }}>
              Clique no botão abaixo para criar 6 leads de exemplo no banco.
            </p>
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="crm-btn crm-btn-primary"
            >
              {seedMutation.isPending ? "Criando…" : "Popular com dados de exemplo"}
            </button>
            {seedMutation.isError && (
              <p className="crm-text-meta" style={{ marginTop: "var(--crm-ds-spacing-03)", color: "#b91c1c" }}>
                {seedMutation.error instanceof Error ? seedMutation.error.message : "Erro ao popular."}
              </p>
            )}
            {seedMutation.isSuccess && (
              <p className="crm-text-meta" style={{ marginTop: "var(--crm-ds-spacing-03)" }}>
                {seedMutation.data.created} lead(s) criado(s), {seedMutation.data.updated} atualizado(s). A lista deve atualizar em instantes.
              </p>
            )}
            <p className="crm-text-meta" style={{ marginTop: "var(--crm-ds-spacing-06)" }}>
              Ou na pasta <code>backend</code> execute: <code>npm run seed:leads</code>
            </p>
          </div>
        ) : (
          <KanbanBoard
            leads={leads}
            orders={orders}
            onOpenLead={setSelectedLeadId}
          />
        )}
      </div>

      <LeadDetailModal
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </>
  );
}
