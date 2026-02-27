"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import { getApiUrl } from "@/lib/api/client";
import { getProductImageUrls } from "@/lib/getProductImage";

/** Placeholder em JPEG (picsum) para evitar Next/Image rejeitar SVG do placehold.co. */
const PLACEHOLDER = "https://picsum.photos/400/300?blur=1";

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
  const urls = useMemo(() => {
    const apiImageUrl = getApiUrl(`api/products/${product.id}/image`);
    const localUrls = getProductImageUrls(product);
    return [apiImageUrl, ...localUrls];
  }, [product.id, product.name]);

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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={product.name}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={handleError}
    />
  );
}
