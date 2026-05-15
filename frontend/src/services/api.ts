import type { ApiResponse } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/property-management/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.errors?.[0] || body.message || `API request failed with status ${response.status}`);
  }

  return body.data;
}

export function apiGet<T>(path: string) {
  return request<T>(path);
}

export function apiPost<T>(path: string, payload: unknown) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function apiPut<T>(path: string, payload: unknown) {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function apiDelete(path: string) {
  return request<null>(path, {
    method: "DELETE"
  });
}
