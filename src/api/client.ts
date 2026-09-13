import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

let accessToken: string | null = localStorage.getItem('tka_access_token')
let refreshToken: string | null = localStorage.getItem('tka_refresh_token')

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access
  refreshToken = refresh
  if (access) localStorage.setItem('tka_access_token', access); else localStorage.removeItem('tka_access_token')
  if (refresh) localStorage.setItem('tka_refresh_token', refresh); else localStorage.removeItem('tka_refresh_token')
}
export function getAccessToken() { return accessToken }

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let isRefreshing = false
let queue: Array<() => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve))
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        setTokens(data.accessToken, data.refreshToken)
        queue.forEach((resolve) => resolve())
        queue = []
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (e) {
        setTokens(null, null)
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
