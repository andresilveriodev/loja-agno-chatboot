"use client";

import { useFilterStore } from "@/app/store/filterStore";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryFilter() {
  const { selectedCategories, toggleCategory, clearFilters } = useFilterStore();
  const hasFilters = selectedCategories.length > 0;

  return (
    <aside className="w-full shrink-0 lg:w-64" aria-label="Filtros por categoria">
      <div className="sticky top-28 rounded-lm-md border border-black/4 bg-[var(--lm-surface)] p-4 shadow-lm-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--lm-text)]">Categorias</h3>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-[var(--lm-green-700)] hover:text-[var(--lm-green-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-green)]"
            >
              Limpar
            </button>
          )}
        </div>
        <ul className="mt-4 space-y-1 list-none pl-0">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <li key={category}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg py-2 px-2 transition-colors hover:bg-[var(--lm-surface-alt)]">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 rounded border-[var(--lm-border)] text-[var(--lm-green)] focus:ring-[var(--lm-green)] focus:ring-offset-0"
                    aria-label={`Filtrar por ${category}`}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      isSelected ? "font-medium text-[var(--lm-text)]" : "text-[var(--lm-text-muted)]"
                    )}
                  >
                    {category}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {hasFilters && (
          <p className="mt-3 text-xs text-[var(--lm-text-muted)]">
            {selectedCategories.length} categorias selecionadas
          </p>
        )}
      </div>
    </aside>
  );
}
