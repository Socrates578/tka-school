import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, setTokens, getAccessToken } from '../api/client'
import type { UserProfile } from '../api/types'
import { useTranslation } from 'react-i18next'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  login: (username: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor: boolean; error?: string }>
  logout: () => void
  hasPermission: (perm: string) => boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { i18n } = useTranslation()

  async function refreshProfile() {
    try {
      const { data } = await api.get<UserProfile>('/auth/me')
      setUser(data)
      if (data.preferredLanguage) i18n.changeLanguage(data.preferredLanguage)
      document.documentElement.setAttribute('data-theme', data.preferredTheme || 'light')
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    if (getAccessToken()) {
      refreshProfile().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(username: string, password: string, twoFactorCode?: string) {
    try {
      const { data } = await api.post('/auth/login', { username, password, twoFactorCode })
      if (data.requiresTwoFactor) return { requiresTwoFactor: true }
      setTokens(data.accessToken, data.refreshToken)
      await refreshProfile()
      return { requiresTwoFactor: false }
    } catch (err: any) {
      return { requiresTwoFactor: false, error: err.response?.data?.error || 'Unable to sign in' }
    }
  }

  function logout() {
    setTokens(null, null)
    setUser(null)
    window.location.href = '/login'
  }

  function hasPermission(perm: string) {
    return user?.permissions?.includes(perm) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
