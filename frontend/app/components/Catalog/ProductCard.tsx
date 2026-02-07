"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/e2e8f0/64748b?text=Produto";

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
      className="group flex flex-col overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm transition hover:shadow-md"
      aria-label={product.name}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary-50">
        <Image
          src={PLACEHOLDER_IMAGE}
          alt={product.name}
          width={400}
          height={300}
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute left-2 top-2 rounded bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
          {product.category.split(" ")[0]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-primary-900">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-primary-600">
          {product.description}
        </p>
        <div className="mt-auto pt-4">
          <p className="text-xl font-bold text-primary-700">
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
