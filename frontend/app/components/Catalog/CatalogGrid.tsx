"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

interface CatalogGridProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
}

export function CatalogGrid({ products, onProductSelect }: CatalogGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lm-md border-2 border-dashed border-[var(--lm-border)] bg-[var(--lm-surface-alt)] py-16 text-center">
        <p className="text-lg font-medium text-[var(--lm-text)]">Nenhum produto encontrado</p>
        <p className="mt-1 text-sm text-[var(--lm-text-muted)]">
          Tente alterar os filtros de categoria.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      id="catalogo"
      role="list"
      aria-label="Lista de produtos do catálogo"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} onSelect={onProductSelect} />
        </div>
      ))}
    </div>
  );
}
