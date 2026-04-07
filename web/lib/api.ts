const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const headers: HeadersInit = {
    ...(options.headers ?? {}),
  };
  const token = getToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  let body = options.body;
  if (options.json !== undefined) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }
  const res = await fetch(`${API}${path}`, { ...options, headers, body });
  const text = await res.text();
  let data: T = undefined as T;
  try {
    data = text ? (JSON.parse(text) as T) : (undefined as T);
  } catch {
    data = text as unknown as T;
  }
  return { ok: res.ok, status: res.status, data };
}

export { API };
