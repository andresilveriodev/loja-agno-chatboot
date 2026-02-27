"use client";

import { useMemo, useState } from "react";
import { useFilterStore } from "@/app/store/filterStore";
import type { Product } from "@/lib/types";
import { useProducts } from "@/app/hooks/useProducts";
import { CategoryFilter } from "./CategoryFilter";
import { CatalogGrid } from "./CatalogGrid";
import { ProductDetailModal } from "./ProductDetailModal";
import { LoadingSkeleton } from "./LoadingSkeleton";

export function CatalogSection() {
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: products = [], isLoading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) return products;
    return products.filter((p) => selectedCategories.includes(p.category));
  }, [products, selectedCategories]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <section className="mb-16 last:mb-0" aria-labelledby="catalogo-title">
        <div className="flex flex-col gap-8 lg:flex-row">
          <CategoryFilter />
          <div className="min-w-0 flex-1">
            <h2 id="catalogo-title" className="text-[32px] leading-tight m-0 mb-2 text-[var(--lm-text)]">
              Catálogo de produtos
            </h2>
            <p className="m-0 mb-6 text-[var(--lm-text-muted)]">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""}
            </p>
            {error && (
              <div className="rounded-lm-md border border-red-200 bg-red-50 p-4 text-red-800 shadow-lm-soft">
                <p className="font-medium">Erro ao carregar produtos</p>
                <p className="mt-1 text-sm">
                  O backend não está respondendo (conexão recusada). Inicie-o em outro terminal:
                </p>
                <code className="mt-2 block rounded bg-red-100 px-2 py-1 text-xs">
                  cd backend; npm run start:dev
                </code>
                <p className="mt-1 text-xs text-red-600">
                  (PowerShell: use ; em vez de &amp;&amp;. Antes: npm install na pasta backend.)
                </p>
                <p className="mt-2 text-xs text-red-700">
                  URL esperada: {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}
                </p>
              </div>
            )}
            {isLoading && <LoadingSkeleton />}
            {!isLoading && !error && (
              <CatalogGrid
                products={filteredProducts}
                onProductSelect={handleProductSelect}
              />
            )}
          </div>
        </div>
      </section>
      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
