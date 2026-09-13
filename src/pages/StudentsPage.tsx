import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import { api } from '../api/client'
import type { StudentDetail, StudentListItem, PagedResult } from '../api/types'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import Avatar from '../components/Avatar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormField, { FormGrid } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = { firstName: '', lastName: '', middleName: '', enrollmentDate: new Date().toISOString().slice(0, 10), studentStatus: 'active', address: '', medicalNotes: '', notes: '' }

export default function StudentsPage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const [data, setData] = useState<PagedResult<StudentListItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState<StudentDetail | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get<PagedResult<StudentListItem>>('/students', { params: { page, pageSize: 10, search, status: statusFilter || undefined } })
      setData(data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [page, search, statusFilter]) // eslint-disable-line

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  async function openEdit(row: StudentListItem) {
    const { data } = await api.get<StudentDetail>(`/students/${row.id}`)
    setEditing(data); setForm({ ...data }); setShowForm(true)
  }
  async function handleSave() {
    setSaving(true)
    try {
      if (editing) await api.put(`/students/${editing.id}`, form)
      else await api.post('/students', form)
      setShowForm(false); load()
    } finally { setSaving(false) }
  }
  async function handleDelete() { if (!deletingId) return; await api.delete(`/students/${deletingId}`); setDeletingId(null); load() }
  async function handleExport() {
    const res = await api.get('/data/export/students', { params: { format: 'xlsx' }, responseType: 'blob' })
    const url = URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = 'students.xlsx'; a.click()
  }

  const columns: Column<StudentListItem>[] = [
    { key: 'name', header: t('students.name'), render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={r.fullName} photoUrl={r.photoUrl} />
        <div><div style={{ fontWeight: 600 }}>{r.fullName}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.studentCode}</div></div>
      </div>
    ) },
    { key: 'class', header: t('students.class'), render: (r) => r.className || '—' },
    { key: 'enrollment', header: t('students.enrollmentDate'), render: (r) => r.enrollmentDate },
    { key: 'status', header: t('common.status'), render: (r) => <StatusBadge status={r.studentStatus} /> },
    { key: 'actions', header: t('common.actions'), render: (r) => (
      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
        {hasPermission('students.write') && <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}><Pencil size={14} /></button>}
        {hasPermission('students.delete') && <button className="btn btn-ghost btn-sm" onClick={() => setDeletingId(r.id)}><Trash2 size={14} color="var(--status-danger)" /></button>}
      </div>
    ) }
  ]

  return (
    <div>
      <PageHeader title={t('students.title')} subtitle={t('students.subtitle')} actions={<>
        <button className="btn btn-ghost" onClick={handleExport}><Download size={15} /> {t('common.export')}</button>
        {hasPermission('students.write') && <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> {t('students.addStudent')}</button>}
      </>} />

      <DataTable
        columns={columns} rows={data?.items || []} getRowId={(r) => r.id} onRowClick={openEdit}
        loading={loading} search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }}
        page={page} totalPages={data?.totalPages || 1} onPageChange={setPage}
        filters={
          <select className="input" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">{t('common.all')} {t('common.status')}</option>
            <option value="active">Active</option><option value="graduated">Graduated</option><option value="transferred">Transferred</option>
          </select>
        }
      />

      {showForm && (
        <Modal title={editing ? editing.fullName : t('students.addStudent')} onClose={() => setShowForm(false)} width={640}
          footer={<><button className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? t('common.loading') : t('common.save')}</button></>}>
          <FormGrid>
            <FormField label="First name" required><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></FormField>
            <FormField label="Last name" required><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></FormField>
            <FormField label={t('students.enrollmentDate')}><input type="date" className="input" value={form.enrollmentDate?.slice(0, 10)} onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })} /></FormField>
            <FormField label={t('students.studentStatus')}>
              <select className="input" value={form.studentStatus} onChange={(e) => setForm({ ...form, studentStatus: e.target.value })}>
                <option value="active">Active</option><option value="graduated">Graduated</option><option value="transferred">Transferred</option><option value="expelled">Expelled</option>
              </select>
            </FormField>
          </FormGrid>
          <FormField label={t('common.address')}><input className="input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></FormField>
          <FormField label={t('students.medical')}><textarea className="input" rows={2} value={form.medicalNotes || ''} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} /></FormField>
          <FormField label={t('common.notes')}><textarea className="input" rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FormField>

          {editing && editing.parents.length > 0 && (
            <>
              <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-tertiary)', margin: '18px 0 10px' }}>{t('students.guardians')}</h4>
              {editing.parents.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13.5 }}>
                  <span>{p.fullName} <span style={{ color: 'var(--text-tertiary)' }}>({p.relationship})</span></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{p.phoneNumber}</span>
                </div>
              ))}
            </>
          )}
        </Modal>
      )}
      {deletingId && <ConfirmDialog onConfirm={handleDelete} onCancel={() => setDeletingId(null)} />}
    </div>
  )
}
