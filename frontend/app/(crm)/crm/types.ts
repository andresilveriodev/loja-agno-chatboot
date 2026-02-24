/**
 * Filtros da listagem CRM (leads e orders).
 */

export interface CrmFiltersState {
  stage: string[];
  source: string;
  from: string;
  to: string;
  intent: string;
  q: string;
}

export const DEFAULT_CRM_FILTERS: CrmFiltersState = {
  stage: [],
  source: "",
  from: "",
  to: "",
  intent: "",
  q: "",
};
