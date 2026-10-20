// server address
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// login token
const TOKEN_KEY = 'token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// call backend with token attached
export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}

  // send token so server knows who's asking
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // don't crach if response has no body
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // forget token if expired or account gone
    if (data.code === 'UNAUTHENTICATED') clearToken()

    const error = new Error(data.error || 'Something went wrong.')
    error.status = response.status
    throw error
  }

  return data
}