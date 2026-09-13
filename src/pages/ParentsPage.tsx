import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import type { ParentDetail, ParentListItem, PagedResult } from '../api/types'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormField, { FormGrid } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = { firstName: '', lastName: '', phoneNumber: '', email: '', occupation: '', workplace: '', address: '', notes: '' }

export default function ParentsPage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const [data, setData] = useState<PagedResult<ParentListItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<ParentDetail | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get<PagedResult<ParentListItem>>('/parents', { params: { page, pageSize: 10, search } })
      setData(data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [page, search]) // eslint-disable-line

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  async function openEdit(row: ParentListItem) {
    const { data } = await api.get<ParentDetail>(`/parents/${row.id}`)
    setEditing(data); setForm({ ...data }); setShowForm(true)
  }
  async function handleSave() {
    setSaving(true)
    try {
      if (editing) await api.put(`/parents/${editing.id}`, form)
      else await api.post('/parents', form)
      setShowForm(false); load()
    } finally { setSaving(false) }
  }
  async function handleDelete() { if (!deletingId) return; await api.delete(`/parents/${deletingId}`); setDeletingId(null); load() }

  const columns: Column<ParentListItem>[] = [
    { key: 'name', header: t('parents.name'), render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={r.fullName} photoUrl={r.photoUrl} />
        <div><div style={{ fontWeight: 600 }}>{r.fullName}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.parentCode}</div></div>
      </div>
    ) },
    { key: 'phone', header: t('common.phone'), render: (r) => r.phoneNumber },
    { key: 'email', header: t('common.email'), render: (r) => r.email || '—' },
    { key: 'children', header: t('parents.children'), render: (r) => <span className="badge badge-info">{r.childrenCount}</span> },
    { key: 'actions', header: t('common.actions'), render: (r) => (
      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
        {hasPermission('parents.write') && <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}><Pencil size={14} /></button>}
        {hasPermission('parents.delete') && <button className="btn btn-ghost btn-sm" onClick={() => setDeletingId(r.id)}><Trash2 size={14} color="var(--status-danger)" /></button>}
      </div>
    ) }
  ]

  return (
    <div>
      <PageHeader title={t('parents.title')} subtitle={t('parents.subtitle')} actions={
        hasPermission('parents.write') && <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> {t('parents.addParent')}</button>
      } />

      <DataTable columns={columns} rows={data?.items || []} getRowId={(r) => r.id} onRowClick={openEdit}
        loading={loading} search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }}
        page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />

      {showForm && (
        <Modal title={editing ? editing.fullName : t('parents.addParent')} onClose={() => setShowForm(false)} width={600}
          footer={<><button className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? t('common.loading') : t('common.save')}</button></>}>
          <FormGrid>
            <FormField label="First name" required><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></FormField>
            <FormField label="Last name" required><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></FormField>
            <FormField label={t('common.phone')} required><input className="input" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></FormField>
            <FormField label={t('common.email')}><input className="input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
            <FormField label={t('parents.occupation')}><input className="input" value={form.occupation || ''} onChange={(e) => setForm({ ...form, occupation: e.target.value })} /></FormField>
            <FormField label={t('parents.workplace')}><input className="input" value={form.workplace || ''} onChange={(e) => setForm({ ...form, workplace: e.target.value })} /></FormField>
          </FormGrid>
          <FormField label={t('common.address')}><input className="input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></FormField>

          {editing && editing.children.length > 0 && (
            <>
              <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-tertiary)', margin: '18px 0 10px' }}>{t('students.title')}</h4>
              {editing.children.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13.5 }}>
                  <span>{c.fullName} <span style={{ color: 'var(--text-tertiary)' }}>({c.relationship}{c.className ? `, ${c.className}` : ''})</span></span>
                  {c.canPickup && <span className="badge badge-success">{t('parents.canPickup')}</span>}
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
