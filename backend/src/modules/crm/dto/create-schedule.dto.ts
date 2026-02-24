/**
 * Body para POST /api/crm/schedule
 */
export interface CreateScheduleDto {
  leadId: string;
  /** call | visit | callback */
  type: string;
  /** Data/hora do agendamento (ISO ou YYYY-MM-DDTHH:mm) */
  scheduledAt: string;
  title: string;
  description?: string;
}
