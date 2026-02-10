"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useChatStore } from "@/app/store/chatStore";
import { X, Check } from "lucide-react";
import { ProductImage } from "./ProductImage";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  open: boolean;
}

export function ProductDetailModal({ product, onClose, open }: ProductDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const setChatOpen = useChatStore((s) => s.setOpen);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl transition opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {product ? (
          <>
            <div className="relative aspect-[571/368] w-full overflow-hidden bg-primary-50">
              <ProductImage
                product={product}
                width={571}
                height={368}
                className="object-cover"
                priority
              />
              <span className="absolute left-3 top-3 rounded bg-primary-600 px-2 py-1 text-sm font-medium text-white">
                {product.category}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-primary-700 shadow transition hover:bg-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <h2 id="product-detail-title" className="text-2xl font-bold text-primary-900">
                {product.name}
              </h2>
              <p className="mt-2 text-xl font-semibold text-primary-700">
                {formatPrice(product.price)}
              </p>
              <p className="mt-4 text-primary-600">{product.description}</p>
              {product.specs && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-500">
                    Especificações
                  </h3>
                  <p className="mt-1 text-sm text-primary-700">{product.specs}</p>
                </div>
              )}
              {product.features && product.features.length > 0 && (
                <ul className="mt-4 space-y-2" aria-label="Características">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-primary-700">
                      <Check className="h-4 w-4 shrink-0 text-primary-500" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-primary-300 bg-white px-4 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setChatOpen(true);
                  }}
                  className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
                  aria-label={`Falar sobre ${product.name} no chat`}
                >
                  Falar no chat
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-2 text-primary-600 hover:bg-primary-100"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-primary-600">Produto não encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
