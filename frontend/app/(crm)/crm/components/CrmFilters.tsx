"use client";

import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import type { CrmFiltersState } from "../types";
import { LEAD_STAGE_COLUMNS } from "../constants";

interface CrmFiltersProps {
  filters: CrmFiltersState;
  onApply: (f: CrmFiltersState) => void;
  onClear: () => void;
}

export function CrmFilters({ filters, onApply, onClear }: CrmFiltersProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<CrmFiltersState>(filters);

  const hasActive =
    filters.stage.length > 0 ||
    filters.source !== "" ||
    filters.from !== "" ||
    filters.to !== "" ||
    filters.intent !== "" ||
    filters.q !== "";

  function handleApply() {
    onApply(local);
    setOpen(false);
  }

  function handleClear() {
    setLocal({
      stage: [],
      source: "",
      from: "",
      to: "",
      intent: "",
      q: "",
    });
    onClear();
    setOpen(false);
  }

  function toggleStage(id: string) {
    setLocal((prev) => ({
      ...prev,
      stage: prev.stage.includes(id)
        ? prev.stage.filter((s) => s !== id)
        : [...prev.stage, id],
    }));
  }

  return (
    <div className="crm-flex-wrap">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`crm-btn crm-btn-outline ${hasActive ? "crm-filters-active" : ""}`}
      >
        <Filter style={{ width: 16, height: 16 }} />
        Filtros
        {hasActive && (
          <span className="crm-tag" style={{ marginLeft: 4, padding: "2px 6px" }}>ativo</span>
        )}
        <ChevronDown style={{ width: 16, height: 16, transform: open ? "rotate(180deg)" : undefined, transition: "transform var(--crm-ds-motion)" }} />
      </button>

      {open && (
        <div className="crm-filters-panel crm-card" style={{ width: "100%", maxWidth: 360, marginTop: "var(--crm-ds-spacing-02)", padding: "var(--crm-ds-spacing-04)", boxShadow: "var(--crm-ds-shadow-md)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--crm-ds-spacing-03)" }}>
            <label className="crm-text-name" style={{ fontSize: 14, margin: 0 }}>Busca (nome, telefone, empresa)</label>
            <input
              type="text"
              value={local.q}
              onChange={(e) => setLocal((p) => ({ ...p, q: e.target.value }))}
              placeholder="Digite para buscar..."
              className="crm-input"
            />

            <label className="crm-text-name" style={{ fontSize: 14, margin: 0 }}>Estágio (leads)</label>
            <div className="crm-flex-wrap">
              {LEAD_STAGE_COLUMNS.map((col) => (
                <label
                  key={col.id}
                  className="crm-filter-chip"
                >
                  <input
                    type="checkbox"
                    checked={local.stage.includes(col.id)}
                    onChange={() => toggleStage(col.id)}
                    style={{ marginRight: 6 }}
                  />
                  {col.label}
                </label>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--crm-ds-spacing-02)" }}>
              <div>
                <label className="crm-text-meta" style={{ display: "block", marginBottom: 4 }}>Origem</label>
                <select
                  value={local.source}
                  onChange={(e) => setLocal((p) => ({ ...p, source: e.target.value }))}
                  className="crm-input"
                >
                  <option value="">Todos</option>
                  <option value="web">Web</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="crm-text-meta" style={{ display: "block", marginBottom: 4 }}>Data de</label>
                <input
                  type="date"
                  value={local.from}
                  onChange={(e) => setLocal((p) => ({ ...p, from: e.target.value }))}
                  className="crm-input"
                />
              </div>
              <div>
                <label className="crm-text-meta" style={{ display: "block", marginBottom: 4 }}>Data até</label>
                <input
                  type="date"
                  value={local.to}
                  onChange={(e) => setLocal((p) => ({ ...p, to: e.target.value }))}
                  className="crm-input"
                />
              </div>
              <div>
                <label className="crm-text-meta" style={{ display: "block", marginBottom: 4 }}>Intenção</label>
                <input
                  type="text"
                  value={local.intent}
                  onChange={(e) => setLocal((p) => ({ ...p, intent: e.target.value }))}
                  placeholder="Ex: compra imediata"
                  className="crm-input"
                />
              </div>
            </div>
          </div>

          <div className="crm-flex-wrap" style={{ marginTop: "var(--crm-ds-spacing-04)", justifyContent: "flex-end", gap: "var(--crm-ds-spacing-02)" }}>
            <button type="button" onClick={handleClear} className="crm-btn crm-btn-outline">
              <X style={{ width: 16, height: 16 }} />
              Limpar
            </button>
            <button type="button" onClick={handleApply} className="crm-btn crm-btn-primary">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
