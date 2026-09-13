import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, KeyRound, UserX } from 'lucide-react'
import { api } from '../api/client'
import type { UserAdminListItem, RoleDto, PagedResult } from '../api/types'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import Modal from '../components/Modal'
import FormField from '../components/FormField'

export default function UsersPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<PagedResult<UserAdminListItem> | null>(null)
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', roleId: '' })

  async function load() {
    setLoading(true)
    try {
      const [u, r] = await Promise.all([
        api.get<PagedResult<UserAdminListItem>>('/users', { params: { page, pageSize: 10, search } }),
        api.get<RoleDto[]>('/roles')
      ])
      setData(u.data); setRoles(r.data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [page, search]) // eslint-disable-line

  async function submit() { await api.post('/users', form); setShowForm(false); setForm({ username: '', email: '', password: '', fullName: '', roleId: '' }); load() }
  async function deactivate(id: string) { await api.post(`/users/${id}/deactivate`); load() }

  const columns: Column<UserAdminListItem>[] = [
    { key: 'name', header: 'Name', render: (r) => <div><div style={{ fontWeight: 600 }}>{r.fullName}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.username}</div></div> },
    { key: 'email', header: t('common.email'), render: (r) => r.email },
    { key: 'role', header: t('users.role'), render: (r) => <span className="badge badge-info">{r.roleName}</span> },
    { key: 'status', header: t('common.status'), render: (r) => <span className={`badge badge-${r.isActive ? 'success' : 'neutral'}`}>{r.isActive ? t('common.active') : t('common.inactive')}</span> },
    { key: 'lastLogin', header: t('users.lastLogin'), render: (r) => r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : '—' },
    { key: 'actions', header: t('common.actions'), render: (r) => (
      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-ghost btn-sm" title={t('users.resetPassword')}><KeyRound size={14} /></button>
        {r.isActive && <button className="btn btn-ghost btn-sm" onClick={() => deactivate(r.id)} title={t('users.deactivate')}><UserX size={14} color="var(--status-danger)" /></button>}
      </div>
    ) }
  ]

  return (
    <div>
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')} actions={<button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> {t('users.addUser')}</button>} />
      <DataTable columns={columns} rows={data?.items || []} getRowId={(r) => r.id} loading={loading} search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }} page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />

      {showForm && (
        <Modal title={t('users.addUser')} onClose={() => setShowForm(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={submit}>{t('common.save')}</button></>}>
          <FormField label="Full name" required><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></FormField>
          <FormField label="Username" required><input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></FormField>
          <FormField label={t('common.email')} required><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
          <FormField label="Temporary password" required><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></FormField>
          <FormField label={t('users.role')} required>
            <select className="input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
              <option value="">Select a role</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </FormField>
        </Modal>
      )}
    </div>
  )
}
