import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Wifi, WifiOff, Copy, Ban } from 'lucide-react'
import { api } from '../api/client'
import type { TurnstileDevice, RfidCard } from '../api/types'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function DevicesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const [devices, setDevices] = useState<TurnstileDevice[]>([])
  const [cards, setCards] = useState<RfidCard[]>([])
  const [showDeviceForm, setShowDeviceForm] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [newKey, setNewKey] = useState<{ deviceCode: string; key: string } | null>(null)
  const [deviceForm, setDeviceForm] = useState({ deviceCode: '', name: '', location: '', directionMode: 'both' })
  const [cardForm, setCardForm] = useState({ cardUid: '', ownerType: 'student', ownerId: '' })

  async function load() {
    const [d, c] = await Promise.all([api.get<TurnstileDevice[]>('/devices'), api.get<RfidCard[]>('/devices/cards')])
    setDevices(d.data); setCards(c.data)
  }
  useEffect(() => { load() }, [])

  async function submitDevice() {
    const { data } = await api.post('/devices', deviceForm)
    setNewKey({ deviceCode: data.deviceCode, key: data.plaintextApiKey })
    setShowDeviceForm(false)
    setDeviceForm({ deviceCode: '', name: '', location: '', directionMode: 'both' })
    load()
  }
  async function submitCard() { await api.post('/devices/cards', cardForm); setShowCardForm(false); setCardForm({ cardUid: '', ownerType: 'student', ownerId: '' }); load() }
  async function revokeCard(id: string) { await api.post(`/devices/cards/${id}/revoke`); load() }

  return (
    <div>
      <PageHeader title={t('devices.title')} subtitle={t('devices.subtitle')} actions={
        hasPermission('devices.manage') && <button className="btn btn-primary" onClick={() => setShowDeviceForm(true)}><Plus size={15} /> {t('devices.addDevice')}</button>
      } />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>
        {devices.map((d) => (
          <div key={d.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>{d.location} · {d.deviceCode}</div>
              </div>
              {d.isOnline ? <Wifi size={17} color="var(--status-success)" /> : <WifiOff size={17} color="var(--status-danger)" />}
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-secondary)' }}>
              {d.isOnline ? t('devices.online') : t('devices.offline')} · {d.directionMode}
            </div>
          </div>
        ))}
        {devices.length === 0 && <p style={{ color: 'var(--text-tertiary)' }}>{t('common.noResults')}</p>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16 }}>{t('devices.cards')}</h3>
        {hasPermission('devices.manage') && <button className="btn btn-ghost btn-sm" onClick={() => setShowCardForm(true)}><Plus size={14} /> {t('devices.issueCard')}</button>}
      </div>
      <div className="card scroll-x">
        <table className="data-table">
          <thead><tr><th>{t('devices.cardUid')}</th><th>{t('devices.owner')}</th><th>{t('common.status')}</th><th>{t('common.actions')}</th></tr></thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id}>
                <td data-label={t('devices.cardUid')}><code>{c.cardUid}</code></td>
                <td data-label={t('devices.owner')}>{c.ownerName} <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>({c.ownerType})</span></td>
                <td data-label={t('common.status')}><span className={`badge badge-${c.status === 'active' ? 'success' : 'neutral'}`}>{c.status}</span></td>
                <td data-label={t('common.actions')}>
                  {c.status === 'active' && hasPermission('devices.manage') && (
                    <button className="btn btn-ghost btn-sm" onClick={() => revokeCard(c.id)}><Ban size={13} /> {t('devices.revoke')}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeviceForm && (
        <Modal title={t('devices.addDevice')} onClose={() => setShowDeviceForm(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowDeviceForm(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={submitDevice}>{t('common.save')}</button></>}>
          <FormField label={t('devices.deviceCode')} required><input className="input" value={deviceForm.deviceCode} onChange={(e) => setDeviceForm({ ...deviceForm, deviceCode: e.target.value })} placeholder="GATE-MAIN-02" /></FormField>
          <FormField label="Name" required><input className="input" value={deviceForm.name} onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })} /></FormField>
          <FormField label={t('devices.location')}><input className="input" value={deviceForm.location} onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })} /></FormField>
          <FormField label={t('devices.direction')}>
            <select className="input" value={deviceForm.directionMode} onChange={(e) => setDeviceForm({ ...deviceForm, directionMode: e.target.value })}>
              <option value="both">Both</option><option value="entry">Entry only</option><option value="exit">Exit only</option>
            </select>
          </FormField>
        </Modal>
      )}

      {showCardForm && (
        <Modal title={t('devices.issueCard')} onClose={() => setShowCardForm(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowCardForm(false)}>{t('common.cancel')}</button>
            <button className="btn btn-primary" onClick={submitCard}>{t('common.save')}</button></>}>
          <FormField label={t('devices.cardUid')} required><input className="input" value={cardForm.cardUid} onChange={(e) => setCardForm({ ...cardForm, cardUid: e.target.value })} placeholder="04A2B3C4D5" /></FormField>
          <FormField label="Owner type">
            <select className="input" value={cardForm.ownerType} onChange={(e) => setCardForm({ ...cardForm, ownerType: e.target.value })}>
              <option value="student">Student</option><option value="employee">Employee</option>
            </select>
          </FormField>
          <FormField label="Owner ID (UUID)" required><input className="input" value={cardForm.ownerId} onChange={(e) => setCardForm({ ...cardForm, ownerId: e.target.value })} /></FormField>
        </Modal>
      )}

      {newKey && (
        <Modal title="Device registered" onClose={() => setNewKey(null)}
          footer={<button className="btn btn-primary" onClick={() => setNewKey(null)}>{t('common.close')}</button>}>
          <p style={{ fontSize: 14, marginBottom: 10 }}>Copy this API key into the device firmware config now — it will not be shown again.</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-muted)', padding: 12, borderRadius: 8 }}>
            <code style={{ fontSize: 12, wordBreak: 'break-all', flex: 1 }}>{newKey.key}</code>
            <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(newKey.key)}><Copy size={14} /></button>
          </div>
        </Modal>
      )}
    </div>
  )
}
