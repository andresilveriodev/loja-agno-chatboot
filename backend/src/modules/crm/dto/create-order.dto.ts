/**
 * Item do pedido para POST /api/crm/orders
 */
export interface CreateOrderItemDto {
  productId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Endereço de entrega
 */
export interface ShippingAddressDto {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Body para POST /api/crm/orders
 */
export interface CreateOrderDto {
  leadId: string;
  items: CreateOrderItemDto[];
  discount?: number;
  /** pix | boleto | card | transfer */
  paymentMethod: string;
  /** pending | confirmed - status inicial do pagamento */
  paymentStatus?: string;
  shippingAddress: ShippingAddressDto | null;
}
