"use client";

import { useMemo, useState } from "react";
import { useFilterStore } from "@/app/store/filterStore";
import type { Product } from "@/lib/types";
import { useProducts } from "@/app/hooks/useProducts";
import { getBaseUrl } from "@/lib/api/client";
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
                  O backend não está respondendo. URL usada: <code className="rounded bg-red-100 px-1">{getBaseUrl()}</code>
                </p>
                <p className="mt-2 text-xs text-red-600">
                  Em desenvolvimento local: inicie o backend (<code>cd backend; npm run start:dev</code>). No Vercel: defina <code>NEXT_PUBLIC_API_URL</code> com a URL do backend (ex.: https://seu-backend.onrender.com) em <strong>Production</strong> e <strong>Preview</strong>, depois faça Redeploy.
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
