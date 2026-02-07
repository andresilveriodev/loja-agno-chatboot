import type { Product } from "@/lib/types";
import { apiGet } from "./client";

export async function fetchProducts(category?: string): Promise<Product[]> {
  const path = category
    ? `api/products?category=${encodeURIComponent(category)}`
    : "api/products";
  const data = await apiGet<Product[]>(path);
  return Array.isArray(data) ? data : [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    return await apiGet<Product>(`api/products/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}
