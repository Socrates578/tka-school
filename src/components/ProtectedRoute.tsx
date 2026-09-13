import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, permission }: { children: ReactNode; permission?: string }) {
  const { user, loading, hasPermission } = useAuth()
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (permission && !hasPermission(permission)) return <Navigate to="/" replace />
  return <>{children}</>
}
