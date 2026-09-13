import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Modal({ title, onClose, children, footer, width = 560 }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: number }) {
  const { t } = useTranslation()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,20,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }} onClick={onClose}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: width, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label={t('common.close')}><X size={16} /></button>
        </div>
        <div style={{ padding: 22, overflowY: 'auto' }}>{children}</div>
        {footer && <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div>}
      </div>
    </div>
  )
}
