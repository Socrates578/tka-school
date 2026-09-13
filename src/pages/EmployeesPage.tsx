import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import { api } from '../api/client'
import type { EmployeeDetail, EmployeeListItem, PagedResult } from '../api/types'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import Avatar from '../components/Avatar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormField, { FormGrid } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = {
  firstName: '', lastName: '', middleName: '', email: '', phoneNumber: '', address: '',
  hireDate: new Date().toISOString().slice(0, 10), employmentStatus: 'active', contractType: 'full_time',
  emergencyContactName: '', emergencyContactPhone: '', notes: ''
}

export default function EmployeesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const [data, setData] = useState<PagedResult<EmployeeListItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const [editing, setEditing] = useState<EmployeeDetail | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get<PagedResult<EmployeeListItem>>('/employees', { params: { page, pageSize: 10, search, status: statusFilter || undefined } })
      setData(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, search, statusFilter]) // eslint-disable-line

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  async function openEdit(row: EmployeeListItem) {
    const { data } = await api.get<EmployeeDetail>(`/employees/${row.id}`)
    setEditing(data)
    setForm({ ...data })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) await api.put(`/employees/${editing.id}`, form)
      else await api.post('/employees', form)
      setShowForm(false)
      load()
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deletingId) return
    await api.delete(`/employees/${deletingId}`)
    setDeletingId(null)
    load()
  }

  async function handleExport() {
    const res = await api.get('/data/export/employees', { params: { format: 'xlsx' }, responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a'); a.href = url; a.download = 'employees.xlsx'; a.click()
  }

  const columns: Column<EmployeeListItem>[] = [
    { key: 'name', header: t('employees.name'), render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={r.fullName} photoUrl={r.photoUrl} />
        <div><div style={{ fontWeight: 600 }}>{r.fullName}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.employeeCode}</div></div>
      </div>
    ) },
    { key: 'department', header: t('employees.department'), render: (r) => r.departmentName || '—' },
    { key: 'position', header: t('employees.position'), render: (r) => r.positionTitle || '—' },
    { key: 'phone', header: t('common.phone'), render: (r) => r.phoneNumber || '—' },
    { key: 'status', header: t('common.status'), render: (r) => <StatusBadge status={r.employmentStatus} /> },
    { key: 'actions', header: t('common.actions'), render: (r) => (
      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
        {hasPermission('employees.write') && <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}><Pencil size={14} /></button>}
        {hasPermission('employees.delete') && <button className="btn btn-ghost btn-sm" onClick={() => setDeletingId(r.id)}><Trash2 size={14} color="var(--status-danger)" /></button>}
      </div>
    ) }
  ]

  return (
    <div>
      <PageHeader title={t('employees.title')} subtitle={t('employees.subtitle')} actions={<>
        <button className="btn btn-ghost" onClick={handleExport}><Download size={15} /> {t('common.export')}</button>
        {hasPermission('employees.write') && <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> {t('employees.addEmployee')}</button>}
      </>} />

      <DataTable
        columns={columns} rows={data?.items || []} getRowId={(r) => r.id} onRowClick={openEdit}
        loading={loading} search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }}
        page={page} totalPages={data?.totalPages || 1} onPageChange={setPage}
        filters={
          <select className="input" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">{t('common.all')} {t('common.status')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="on_leave">On leave</option>
            <option value="terminated">Terminated</option>
          </select>
        }
      />

      {showForm && (
        <Modal
          title={editing ? editing.fullName : t('employees.addEmployee')}
          onClose={() => setShowForm(false)}
          width={680}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? t('common.loading') : t('common.save')}</button>
          </>}
        >
          <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-tertiary)', marginBottom: 12 }}>{t('employees.personalInfo')}</h4>
          <FormGrid>
            <FormField label={t('students.name') + ' (first)'} required><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></FormField>
            <FormField label={t('students.name') + ' (last)'} required><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></FormField>
            <FormField label={t('common.email')}><input className="input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
            <FormField label={t('common.phone')}><input className="input" value={form.phoneNumber || ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></FormField>
          </FormGrid>
          <FormField label={t('common.address')}><input className="input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></FormField>

          <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-tertiary)', margin: '18px 0 12px' }}>{t('employees.employmentInfo')}</h4>
          <FormGrid>
            <FormField label={t('employees.hireDate')} required><input type="date" className="input" value={form.hireDate?.slice(0, 10)} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} /></FormField>
            <FormField label={t('employees.employmentStatus')}>
              <select className="input" value={form.employmentStatus} onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}>
                <option value="active">Active</option><option value="on_leave">On leave</option><option value="terminated">Terminated</option>
              </select>
            </FormField>
          </FormGrid>

          <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-tertiary)', margin: '18px 0 12px' }}>{t('employees.emergencyContact')}</h4>
          <FormGrid>
            <FormField label="Contact name"><input className="input" value={form.emergencyContactName || ''} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} /></FormField>
            <FormField label="Contact phone"><input className="input" value={form.emergencyContactPhone || ''} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} /></FormField>
          </FormGrid>
          <FormField label={t('common.notes')}><textarea className="input" rows={3} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FormField>
        </Modal>
      )}

      {deletingId && <ConfirmDialog onConfirm={handleDelete} onCancel={() => setDeletingId(null)} />}
    </div>
  )
}
