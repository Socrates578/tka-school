import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn, LogOut, Plus } from 'lucide-react'
import { api } from '../api/client'
import type { AttendanceEvent, AttendanceStats, PagedResult } from '../api/types'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function AttendancePage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const [data, setData] = useState<PagedResult<AttendanceEvent> | null>(null)
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [date, setDate] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualForm, setManualForm] = useState({ ownerType: 'student', ownerId: '', eventType: 'entry', notes: '' })

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get<PagedResult<AttendanceEvent>>('/attendance/events', { params: { page, pageSize: 12, date: date || undefined } })
      setData(data)
      const s = await api.get<AttendanceStats>('/attendance/today-stats')
      setStats(s.data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [page, date]) // eslint-disable-line

  async function submitManual() {
    await api.post('/attendance/manual', manualForm)
    setShowManual(false)
    setManualForm({ ownerType: 'student', ownerId: '', eventType: 'entry', notes: '' })
    load()
  }

  const filtered = (data?.items || []).filter((r) => r.ownerName.toLowerCase().includes(search.toLowerCase()))

  const columns: Column<AttendanceEvent>[] = [
    { key: 'owner', header: t('attendance.owner'), render: (r) => (
      <div><div style={{ fontWeight: 600 }}>{r.ownerName}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.ownerType}</div></div>
    ) },
    { key: 'event', header: t('attendance.event'), render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {r.eventType === 'entry' ? <LogIn size={14} color="var(--status-success)" /> : <LogOut size={14} color="var(--status-info)" />}
        <StatusBadge status={r.eventType} />
      </div>
    ) },
    { key: 'timestamp', header: t('attendance.timestamp'), render: (r) => new Date(r.eventTimestamp).toLocaleString() },
    { key: 'source', header: t('attendance.source'), render: (r) => <span className="badge badge-neutral">{r.source}</span> },
    { key: 'device', header: t('attendance.device'), render: (r) => r.deviceName || r.recordedByName || '—' }
  ]

  return (
    <div>
      <PageHeader title={t('attendance.title')} subtitle={t('attendance.subtitle')} actions={
        hasPermission('attendance.write') && <button className="btn btn-primary" onClick={() => setShowManual(true)}><Plus size={15} /> {t('attendance.recordManual')}</button>
      } />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label={t('attendance.present')} value={stats?.presentToday ?? '—'} tone="success" />
        <StatCard label={t('attendance.absent')} value={stats?.absentToday ?? '—'} tone="danger" />
        <StatCard label={t('attendance.late')} value={stats?.lateToday ?? '—'} tone="warning" />
        <StatCard label={t('dashboard.attendanceRate')} value={stats ? `${stats.attendanceRatePercent}%` : '—'} />
      </div>

      <DataTable columns={columns} rows={filtered} getRowId={(r) => r.id}
        loading={loading} search={search} onSearchChange={setSearch}
        page={page} totalPages={data?.totalPages || 1} onPageChange={setPage}
        filters={<input type="date" className="input" style={{ maxWidth: 170 }} value={date} onChange={(e) => { setDate(e.target.value); setPage(1) }} />}
      />

      {showManual && (
        <Modal title={t('attendance.recordManual')} onClose={() => setShowManual(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowManual(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={submitManual}>{t('common.save')}</button></>}>
          <FormField label="Person type">
            <select className="input" value={manualForm.ownerType} onChange={(e) => setManualForm({ ...manualForm, ownerType: e.target.value })}>
              <option value="student">Student</option><option value="employee">Employee</option>
            </select>
          </FormField>
          <FormField label="Person ID (UUID)" required>
            <input className="input" value={manualForm.ownerId} onChange={(e) => setManualForm({ ...manualForm, ownerId: e.target.value })} placeholder="Paste employee/student ID" />
          </FormField>
          <FormField label={t('attendance.event')}>
            <select className="input" value={manualForm.eventType} onChange={(e) => setManualForm({ ...manualForm, eventType: e.target.value })}>
              <option value="entry">{t('attendance.entry')}</option><option value="exit">{t('attendance.exit')}</option>
            </select>
          </FormField>
          <FormField label={t('common.notes')}><textarea className="input" rows={2} value={manualForm.notes} onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })} /></FormField>
        </Modal>
      )}
    </div>
  )
}
