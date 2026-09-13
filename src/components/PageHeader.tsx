import { ReactNode } from 'react'

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 24 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}
