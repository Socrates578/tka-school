import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

export interface Column<T> { key: string; header: string; render: (row: T) => ReactNode; hideOnMobileLabel?: boolean }

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  loading?: boolean
  search: string
  onSearchChange: (v: string) => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  filters?: ReactNode
  emptyMessage?: string
}

export default function DataTable<T>({
  columns, rows, getRowId, onRowClick, loading, search, onSearchChange, page, totalPages, onPageChange, filters, emptyMessage
}: Props<T>) {
  const { t } = useTranslation()

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="input" placeholder={t('common.search') + '…'} value={search}
            onChange={(e) => onSearchChange(e.target.value)} style={{ paddingLeft: 36 }}
          />
        </div>
        {filters}
      </div>

      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.key}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 32 }}>{t('common.loading')}</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 32 }}>{emptyMessage || t('common.noResults')}</td></tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={getRowId(row)} onClick={() => onRowClick?.(row)}>
                {columns.map((c) => <td key={c.key} data-label={c.header}>{c.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{t('common.page')} {page} {t('common.of')} {Math.max(totalPages, 1)}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={15} /></button>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={15} /></button>
        </div>
      </div>
    </div>
  )
}
