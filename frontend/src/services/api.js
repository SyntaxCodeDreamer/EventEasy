const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getHeaders = () => {
  const token = localStorage.getItem("eventease_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: getHeaders(),
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => request("/auth/me"),

  // ─── Dashboard (single call, backend aggregates everything) ────────────────
  getDashboardMetrics: () => request("/dashboard/metrics"),

  // ─── Events ────────────────────────────────────────────────────────────────
  getEvents: () => request("/events"),

  getEvent: (id) => request(`/events/${id}`),

  createEvent: (data) =>
    request("/events", { method: "POST", body: JSON.stringify(data) }),

  updateEvent: (id, data) =>
    request(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteEvent: (id) =>
    request(`/events/${id}`, { method: "DELETE" }),

  // ─── AI / Agents ───────────────────────────────────────────────────────────
  extractPrompt: (prompt) =>
    request("/ai/extract-prompt", {
      method: "POST",
      body: JSON.stringify({ natural_language_prompt: prompt })
    }),

  getEventPlan: (eventId) => request(`/ai/plans/${eventId}`),

  simulate: (data) =>
    request("/ai/simulate", { method: "POST", body: JSON.stringify(data) }),

  applySimulation: (eventId, simData) =>
    request(`/ai/apply-simulation/${eventId}`, {
      method: "POST",
      body: JSON.stringify(simData)
    }),

  generateTheme: (data) =>
    request("/ai/generate-theme", { method: "POST", body: JSON.stringify(data) }),

  aiChat: (eventId, message) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId, message })
    }),

  // ─── Budget & Expenses ─────────────────────────────────────────────────────
  getBudget: (eventId) => request(`/budgets/${eventId}`),

  getExpenses: (eventId) => request(`/expenses/${eventId}`),

  createExpense: (data) =>
    request("/expenses", { method: "POST", body: JSON.stringify(data) }),

  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  getTasks: (eventId) => request(`/tasks/${eventId}`),

  createTask: (data) =>
    request("/tasks", { method: "POST", body: JSON.stringify(data) }),

  updateTask: (taskId, updates) =>
    request(`/tasks/${taskId}`, { method: "PUT", body: JSON.stringify(updates) }),

  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: "DELETE" }),

  // ─── Vendors ───────────────────────────────────────────────────────────────
  getVendors: (eventId) => request(`/vendors/${eventId}`),

  createVendor: (data) =>
    request("/vendors", { method: "POST", body: JSON.stringify(data) }),

  updateVendor: (vendorId, updates) =>
    request(`/vendors/${vendorId}`, { method: "PUT", body: JSON.stringify(updates) }),

  deleteVendor: (id) => request(`/vendors/${id}`, { method: "DELETE" }),

  // ─── Guests ────────────────────────────────────────────────────────────────
  getGuests: (eventId) => request(`/guests/${eventId}`),

  createGuest: (data) =>
    request("/guests", { method: "POST", body: JSON.stringify(data) }),

  updateGuest: (guestId, updates) =>
    request(`/guests/${guestId}`, { method: "PUT", body: JSON.stringify(updates) }),

  deleteGuest: (id) => request(`/guests/${id}`, { method: "DELETE" }),

  // ─── Community ─────────────────────────────────────────────────────────────
  getCommunity: (eventId) => request(`/community/${eventId}`),

  createCommunityEvent: (data) =>
    request("/community", { method: "POST", body: JSON.stringify(data) }),

  addVolunteer: (communityId, data) =>
    request(`/community/${communityId}/volunteers`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  addDonation: (communityId, data) =>
    request(`/community/${communityId}/donations`, {
      method: "POST",
      body: JSON.stringify(data)
    })
};
