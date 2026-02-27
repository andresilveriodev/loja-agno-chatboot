"use client";

import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";

/** Ícone Info inline para evitar problema de bundle com lucide-react no SSR (Next 15). */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const handleClick = () => {
    onSelect?.(product);
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lm-md border border-black/6 bg-[var(--lm-surface)] shadow-lm-soft transition-[box-shadow] duration-150 ease-out hover:shadow-lm-strong"
      aria-label={product.name}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-[var(--lm-surface-alt)]">
        <ProductImage
          product={product}
          width={256}
          height={256}
          className="object-cover transition-transform duration-150 ease-out group-hover:scale-105"
          sizes="(min-width: 1024px) 208px, 256px"
        />
        <span className="absolute left-2 top-2 rounded-full bg-[var(--lm-green)] px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
          {product.category.split(" ")[0]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-2">
        <h3 className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--lm-text)]">
          {product.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--lm-text-muted)]">
          {product.description}
        </p>
        <div className="mt-auto pt-4">
          <p className="text-lg font-bold tabular-nums text-[var(--lm-text)]">
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--lm-green)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_rgba(21,129,16,0.35)] transition-[background-color,transform,box-shadow] duration-[220ms] ease-out hover:bg-[var(--lm-green-dark)] hover:-translate-y-px hover:shadow-[0_14px_36px_rgba(21,129,16,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-green)]"
            aria-label={`Saber mais sobre ${product.name}`}
          >
            <InfoIcon className="h-4 w-4" />
            Saber mais
          </button>
        </div>
      </div>
    </article>
  );
}
