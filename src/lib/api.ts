import { supabase } from "@/integrations/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  detail?: string | unknown;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const envelope: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    throw new Error(envelope.error || "Request failed");
  }

  return envelope.data as T;
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { headers });

  const envelope: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    throw new Error(envelope.error || "Request failed");
  }

  return envelope.data as T;
}

/** GET without auth — for public endpoints like pricing. */
export async function apiGetNoAuth<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });

  const envelope: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    throw new Error(envelope.error || "Request failed");
  }

  return envelope.data as T;
}

/** POST without auth header — for signup/signin. */
export async function apiPostNoAuth<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const envelope = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    const msg = typeof envelope.detail === "string" ? envelope.detail : envelope.error || "Request failed";
    throw new Error(msg);
  }

  return envelope.data as T;
}

/** Admin API — requires X-Admin-Key header. */
export async function apiAdminGet<T = unknown>(path: string, adminKey: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
  });

  const envelope: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    const msg = typeof envelope.detail === "string" ? envelope.detail : envelope.error || "Request failed";
    throw new Error(msg);
  }

  return envelope.data as T;
}

export async function apiAdminPatch<T = unknown>(path: string, adminKey: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
    body: JSON.stringify(body),
  });

  const envelope: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    const msg = typeof envelope.detail === "string" ? envelope.detail : envelope.error || "Request failed";
    throw new Error(msg);
  }

  return envelope.data as T;
}

export async function apiAdminPost<T = unknown>(path: string, adminKey: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
    body: JSON.stringify(body),
  });

  const envelope: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    const msg = typeof envelope.detail === "string" ? envelope.detail : envelope.error || "Request failed";
    throw new Error(msg);
  }

  return envelope.data as T;
}

export async function apiAdminDelete<T = unknown>(path: string, adminKey: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": adminKey },
  });

  const envelope: ApiEnvelope<T> = await res.json().catch(() => ({
    success: false,
    data: null,
    error: res.statusText,
  }));

  if (!res.ok || !envelope.success) {
    const msg = typeof envelope.detail === "string" ? envelope.detail : envelope.error || "Request failed";
    throw new Error(msg);
  }

  return envelope.data as T;
}
