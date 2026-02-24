import { getApiUrl } from "./client";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  company: string | null;
  email: string | null;
  intent: string | null;
  productsOfInterest: string[];
  estimatedValue: number;
  stage: string;
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastInteractionAt: string | null;
}

export interface Schedule {
  id: string;
  leadId: string;
  type: string;
  scheduledAt: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface LeadDetail extends Lead {
  schedules?: Schedule[];
  orders?: Order[];
  activities?: unknown[];
}

export interface HistoryMessage {
  id: number;
  leadId: string | null;
  sender: string;
  content: string;
  type: string;
  source: string;
  createdAt: string;
}

export interface HistoryActivity {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface LeadHistoryResponse {
  data: Array<
    | { type: "message"; item: HistoryMessage }
    | { type: "activity"; item: HistoryActivity }
  >;
  total: number;
  limit: number;
  offset: number;
}

export interface Order {
  id: string;
  leadId: string;
  orderNumber: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentConfirmedAt: string | null;
  shippingAddress: unknown;
  shippingStatus: string;
  shippedAt: string | null;
  trackingCode: string | null;
  deliveredAt: string | null;
  stage: string;
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; name: string; phone: string };
  items?: unknown[];
}

export interface LeadsResponse {
  data: Lead[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  limit: number;
  offset: number;
}

function buildQuery(params: Record<string, string | number | undefined | string[]>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export interface SeedLeadsResponse {
  created: number;
  updated: number;
}

export async function fetchSeedLeads(): Promise<SeedLeadsResponse> {
  const res = await fetch(getApiUrl("api/crm/seed-leads"), {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<SeedLeadsResponse>;
}

export async function fetchLeads(params: {
  limit?: number;
  offset?: number;
  stage?: string | string[];
  source?: string;
  from?: string;
  to?: string;
  intent?: string;
  q?: string;
  sort?: string;
}): Promise<LeadsResponse> {
  const query = buildQuery(params);
  const res = await fetch(getApiUrl(`api/crm/leads${query}`), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<LeadsResponse>;
}

export async function fetchLeadById(id: string): Promise<LeadDetail> {
  const res = await fetch(getApiUrl(`api/crm/leads/${id}`), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<LeadDetail>;
}

export async function fetchLeadHistory(
  leadId: string,
  params?: { limit?: number; offset?: number }
): Promise<LeadHistoryResponse> {
  const query = buildQuery(params ?? {});
  const res = await fetch(getApiUrl(`api/crm/leads/${leadId}/history${query}`), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<LeadHistoryResponse>;
}

export async function createSchedule(body: {
  leadId: string;
  type: string;
  scheduledAt: string;
  title: string;
  description?: string;
}): Promise<Schedule> {
  const res = await fetch(getApiUrl("api/crm/schedule"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<Schedule>;
}

export async function updateSchedule(
  id: string,
  body: { type?: string; scheduledAt?: string; title?: string; description?: string; status?: string }
): Promise<Schedule> {
  const res = await fetch(getApiUrl(`api/crm/schedule/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<Schedule>;
}

export async function fetchOrders(params: {
  limit?: number;
  offset?: number;
  stage?: string | string[];
  leadId?: string;
  sort?: string;
}): Promise<OrdersResponse> {
  const query = buildQuery(params);
  const res = await fetch(getApiUrl(`api/crm/orders${query}`), { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<OrdersResponse>;
}

export async function updateLeadStage(leadId: string, stage: string): Promise<Lead> {
  const res = await fetch(getApiUrl(`api/crm/leads/${leadId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<Lead>;
}

export async function updateOrderStage(orderId: string, stage: string): Promise<Order> {
  const res = await fetch(getApiUrl(`api/crm/orders/${orderId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json() as Promise<Order>;
}
