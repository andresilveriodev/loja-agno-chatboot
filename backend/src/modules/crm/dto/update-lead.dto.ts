/**
 * Body para PUT /api/crm/leads/:id
 * Campos opcionais; usado principalmente para drag-and-drop (stage).
 */
export interface UpdateLeadDto {
  stage?: string;
  name?: string;
  company?: string | null;
  email?: string | null;
  city?: string | null;
  intent?: string | null;
  productsOfInterest?: string[];
  estimatedValue?: number;
  source?: string;
  notes?: string | null;
}
