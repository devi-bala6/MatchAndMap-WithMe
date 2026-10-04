const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  }
  // If hosted on vercel or other domain without env var set, target live Render backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://matchandmap-withme.onrender.com/api'
  }
  return '/api'
}

export function getToken() {
  return localStorage.getItem("travel_companion_token")
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const baseUrl = getApiBase()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  try {
    const response = await fetch(`${baseUrl}${cleanPath}`, { ...options, headers })
    const contentType = response.headers.get("content-type") || ""
    
    let data: any = null
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null)
    } else {
      const text = await response.text().catch(() => "")
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text || `HTTP ${response.status}` }
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || `Server error (${response.status})`)
    }

    return data as T
  } catch (err: any) {
    console.error("API Request Error:", err)
    throw err
  }
}
