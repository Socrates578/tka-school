import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import type { AuditLogEntry, PagedResult } from '../api/types'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'

export default function AuditPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<PagedResult<AuditLogEntry> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get<PagedResult<AuditLogEntry>>('/audit-logs', { params: { page, pageSize: 15 } }).then((r) => setData(r.data)).finally(() => setLoading(false))
  }, [page])

  const filtered = (data?.items || []).filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))

  const actionTone: Record<string, string> = { create: 'success', update: 'info', delete: 'danger', login: 'neutral' }

  const columns: Column<AuditLogEntry>[] = [
    { key: 'when', header: t('audit.when'), render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: 'user', header: t('audit.user'), render: (r) => r.userDisplay || 'System' },
    { key: 'action', header: t('audit.action'), render: (r) => <span className={`badge badge-${actionTone[r.action] || 'neutral'}`}>{r.action}</span> },
    { key: 'entity', header: t('audit.entity'), render: (r) => r.entityType },
    { key: 'ip', header: 'IP', render: (r) => r.ipAddress || '—' }
  ]

  return (
    <div>
      <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />
      <DataTable columns={columns} rows={filtered} getRowId={(r) => String(r.id)} loading={loading} search={search} onSearchChange={setSearch} page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
    </div>
  )
}
