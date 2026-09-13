import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../api/client'
import { Sun, Moon, Globe, Lock } from 'lucide-react'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  async function changePassword() {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setMessage('Password updated successfully.')
      setCurrentPassword(''); setNewPassword('')
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'Could not update password.')
    }
  }

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={16} /> {t('settings.language')}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ c: 'en', l: 'English' }, { c: 'ru', l: 'Русский' }, { c: 'uz', l: "O'zbek" }].map((x) => (
              <button key={x.c} className="btn btn-ghost" style={{ borderColor: i18n.language === x.c ? 'var(--brand-primary)' : undefined }} onClick={() => i18n.changeLanguage(x.c)}>{x.l}</button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{theme === 'light' ? <Sun size={16} /> : <Moon size={16} />} {t('settings.theme')}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ borderColor: theme === 'light' ? 'var(--brand-primary)' : undefined }} onClick={() => setTheme('light')}>{t('settings.light')}</button>
            <button className="btn btn-ghost" style={{ borderColor: theme === 'dark' ? 'var(--brand-primary)' : undefined }} onClick={() => setTheme('dark')}>{t('settings.dark')}</button>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={16} /> Change password</h3>
          <input className="input" type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ marginBottom: 10 }} />
          <input className="input" type="password" placeholder="New password (min. 8 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ marginBottom: 10 }} />
          <button className="btn btn-primary btn-sm" onClick={changePassword}>{t('common.save')}</button>
          {message && <p style={{ fontSize: 12.5, marginTop: 8, color: 'var(--text-secondary)' }}>{message}</p>}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>Account</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{user?.fullName} · {user?.email}</p>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>Role: {user?.roleName}</p>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>Two-factor authentication: {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  )
}
