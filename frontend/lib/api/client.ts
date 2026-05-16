// Thin fetch wrapper. Browser calls stay on `/api/*`; Next.js route
// handlers adapt that contract to the real backend storage service.
// Set NEXT_PUBLIC_USE_MSW=true to switch back to the browser mock.

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
