// Central API client for communicating with the GaragePro backend

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

// ── Jobs ──────────────────────────────────────────────
export const jobsApi = {
  getAll: () => request('/jobs'),
  getById: (id: string) => request(`/jobs/${id}`),
  create: (data: unknown) => request('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/jobs/${id}`, { method: 'DELETE' }),
  seed: (data: unknown) => request('/jobs/seed', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Inventory ─────────────────────────────────────────
export const inventoryApi = {
  getAll: () => request('/inventory'),
  getLowStock: () => request('/inventory/low-stock'),
  create: (data: unknown) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/inventory/${id}`, { method: 'DELETE' }),
  seed: (data: unknown) => request('/inventory/seed', { method: 'POST', body: JSON.stringify(data) }),
};

// ── AI (Gemini) ───────────────────────────────────────
export const aiApi = {
  generateWhatsAppMessage: (data: {
    customerName: string;
    vehicleModel: string;
    vehicleNumber: string;
    status: string;
    totalAmount?: number;
  }) => request<{ message: string }>('/ai/whatsapp-message', { method: 'POST', body: JSON.stringify(data) }),

  generateInvoiceSummary: (data: {
    customerName: string;
    vehicleModel: string;
    items: Array<{ description: string; quantity: number; price: number }>;
  }) => request<{ summary: string }>('/ai/invoice-summary', { method: 'POST', body: JSON.stringify(data) }),
};
