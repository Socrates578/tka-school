import { ReactNode } from 'react'

export default function StatCard({ label, value, icon, tone = 'neutral' }: { label: string; value: ReactNode; icon?: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const toneBg: Record<string, string> = {
    neutral: 'var(--bg-muted)', success: 'var(--status-success-bg)', warning: 'var(--status-warning-bg)', danger: 'var(--status-danger-bg)'
  }
  const toneColor: Record<string, string> = {
    neutral: 'var(--brand-primary)', success: 'var(--status-success)', warning: 'var(--status-warning)', danger: 'var(--status-danger)'
  }
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        {icon && (
          <div style={{ width: 34, height: 34, borderRadius: 9, background: toneBg[tone], color: toneColor[tone], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{value}</div>
    </div>
  )
}
