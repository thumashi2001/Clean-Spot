// client/src/lib/api.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle(res) {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // non-JSON response
  }
  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ---------- JSON requests ----------
export function api(path, { method = "GET", body, headers } = {}) {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  }).then(handle);
}

// ---------- FormData requests (don't set Content-Type manually) ----------
export function apiForm(path, formData, { method = "POST" } = {}) {
  return fetch(`${API_URL}${path}`, {
    method,
    body: formData,
    credentials: "include",
  }).then(handle);
}

/* ===================== AUTH ===================== */
export function getMe() {
  return api("/api/auth/me");
}
export function loginReq(email, password) {
  return api("/api/auth/login", { method: "POST", body: { email, password } });
}
export function signupReq(name, email, password) {
  return api("/api/auth/signup", { method: "POST", body: { name, email, password } });
}
export function logoutReq() {
  return api("/api/auth/logout", { method: "POST" });
}

/* ===================== RESTROOMS ===================== */
export function fetchRestrooms(params = {}) {
  const q = new URLSearchParams(params);
  return api(`/api/restrooms?${q.toString()}`, { method: "GET" });
}

// Admin CRUD
export function listAllRestrooms() {
  return api(`/api/restrooms`);
}
export function createRestroom(data) {
  return api(`/api/restrooms`, { method: "POST", body: data });
}
export function updateRestroom(id, data) {
  return api(`/api/restrooms/${id}`, { method: "PUT", body: data });
}
export function deleteRestroom(id) {
  return api(`/api/restrooms/${id}`, { method: "DELETE" });
}

/* ===================== REPORTS ===================== */
// Map statuses for a list of restroom ids
export function getStatusByRestroom(ids = []) {
  const q = new URLSearchParams({ ids: ids.join(",") });
  return api(`/api/reports/status-by-restroom?${q.toString()}`);
}

// Create report (photos up to 3)
export function createReport({ restroomId, description, files = [] }) {
  const fd = new FormData();
  fd.append("restroomId", restroomId);
  if (description) fd.append("description", description);
  for (const f of files.slice(0, 3)) fd.append("photos", f);
  return apiForm("/api/reports", fd, { method: "POST" });
}

// Admin/Staff list & actions
export function getReports(params = {}) {
  const q = new URLSearchParams(params);
  return api(`/api/reports?${q.toString()}`);
}
export function confirmReport(id, assignedTo) {
  return api(`/api/reports/${id}/confirm`, {
    method: "PATCH",
    body: assignedTo ? { assignedTo } : {},
  });
}
export function assignReport(id, assignedTo) {
  return api(`/api/reports/${id}/assign`, {
    method: "PATCH",
    body: { assignedTo },
  });
}
export function startReport(id) {
  return api(`/api/reports/${id}/start`, { method: "PATCH" });
}
export function resolveReport(id) {
  return api(`/api/reports/${id}/resolve`, { method: "PATCH" });
}

/* ===================== USERS (admin) ===================== */
export function listStaff() {
  return api(`/api/auth/users?role=staff`);
}
export function createStaff({ name, email, password }) {
  return api(`/api/auth/staff`, { method: "POST", body: { name, email, password } });
}