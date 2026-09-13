import { ReactNode } from 'react'

export default function FormField({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="field-label">{label}{required && <span style={{ color: 'var(--status-danger)' }}> *</span>}</label>
      {children}
    </div>
  )
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 16px' }}>{children}</div>
}
