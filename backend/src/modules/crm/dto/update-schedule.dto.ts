/**
 * Body para PUT /api/crm/schedule/:id
 */
export interface UpdateScheduleDto {
  type?: string;
  scheduledAt?: string;
  title?: string;
  description?: string;
  /** pending | completed | cancelled */
  status?: string;
  address?: string;
  cep?: string;
  deliveryItems?: string;
}
