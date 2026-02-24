/**
 * Body para PUT /api/crm/orders/:id
 * Atualização de estágio e campos de pagamento/entrega.
 */
export interface UpdateOrderDto {
  stage?: string;
  paymentStatus?: string;
  paymentConfirmedAt?: string | null;
  shippingStatus?: string;
  shippedAt?: string | null;
  trackingCode?: string | null;
  deliveredAt?: string | null;
}
