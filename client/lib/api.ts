import { API_BASE_URL } from "./constants";
import { getJwtToken } from "./auth-client";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: unknown;
  serverBaseUrl?: string;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { auth = false, body, headers: customHeaders, serverBaseUrl, ...rest } =
    options;

  const base = serverBaseUrl || API_BASE_URL;
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(customHeaders);
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth && typeof window !== "undefined") {
    const token = await getJwtToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    cache: rest.cache ?? "no-store",
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload?.message || payload?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, payload);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}
