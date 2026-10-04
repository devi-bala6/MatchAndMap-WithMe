const API_BASE = "/api"

export function getToken() {
  return localStorage.getItem("travel_companion_token")
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)

  headers.set("Content-Type", "application/json")

  const token = getToken()

  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  const data = await response.json().catch(() => null)

  if (!response.ok) throw new Error(data?.message || "Request failed")

  return data as T
}
