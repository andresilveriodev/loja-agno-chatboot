/**
 * Formata valor numérico como moeda em pt-BR.
 * Módulo isolado sem clsx/tailwind-merge para uso seguro em SSR (Next 15).
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
