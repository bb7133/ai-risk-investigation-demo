// Thin fetch wrapper. Every backend call in the app routes through here.
// During Phase 1 (and probably Phase 2), MSW intercepts these and returns
// hardcoded mock data — no real backend is reached.

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      // ignore — error body was unreadable
    }
    throw new ApiError(
      `GET ${path} failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}
