/**
 * Body para POST /api/crm/schedule
 */
export interface CreateScheduleDto {
  leadId: string;
  /** call | visit | callback | delivery */
  type: string;
  /** Data/hora do agendamento (ISO ou YYYY-MM-DDTHH:mm) */
  scheduledAt: string;
  title: string;
  description?: string;
  /** Endereço (tipo delivery) */
  address?: string;
  /** CEP (tipo delivery) */
  cep?: string;
  /** Itens a entregar, ex: "2x Produto A, 1x Produto B" (tipo delivery) */
  deliveryItems?: string;
}
