"use client";

import { useFilterStore } from "@/app/store/filterStore";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryFilter() {
  const { selectedCategories, toggleCategory, clearFilters } = useFilterStore();
  const hasFilters = selectedCategories.length > 0;

  return (
    <aside className="w-full shrink-0 lg:w-64" aria-label="Filtros por categoria">
      <div className="sticky top-24 rounded-xl border border-primary-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary-900">Categorias</h3>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              Limpar
            </button>
          )}
        </div>
        <ul className="mt-4 space-y-1">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <li key={category}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg py-2 px-2 transition hover:bg-primary-50">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    aria-label={`Filtrar por ${category}`}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      isSelected ? "font-medium text-primary-800" : "text-primary-700"
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
          <p className="mt-3 text-xs text-primary-500">
            {selectedCategories.length} categorias selecionadas
          </p>
        )}
      </div>
    </aside>
  );
}
