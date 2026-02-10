"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { getProductImageUrls } from "@/lib/getProductImage";

const PLACEHOLDER = "https://placehold.co/400x300/e2e8f0/64748b?text=Produto";

interface ProductImageProps {
  product: Product;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  product,
  width,
  height,
  className,
  sizes,
  priority,
}: ProductImageProps) {
  const urls = getProductImageUrls(product);
  const [tryIndex, setTryIndex] = useState(0);
  const [usePlaceholder, setUsePlaceholder] = useState(false);

  const src = usePlaceholder ? PLACEHOLDER : urls[tryIndex];

  const handleError = () => {
    if (tryIndex < urls.length - 1) {
      setTryIndex((i) => i + 1);
    } else {
      setUsePlaceholder(true);
    }
  };

  return (
    <Image
      src={src}
      alt={product.name}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}
