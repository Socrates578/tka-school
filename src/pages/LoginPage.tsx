import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Lock, User, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(username, password, needsTwoFactor ? code : undefined)
    setSubmitting(false)
    if (result.error) { setError(result.error); return }
    if (result.requiresTwoFactor) { setNeedsTwoFactor(true); return }
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{
        flex: '0 0 44%', background: 'var(--brand-primary)', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 56px', color: '#fff', position: 'relative', overflow: 'hidden'
      }} className="login-hero">
        <div style={{ position: 'absolute', right: -120, bottom: -120, width: 420, height: 420, borderRadius: '50%', background: 'rgba(199,154,69,0.10)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          <img src="/logo-mark-white.png" style={{ width: 42, height: 42 }} alt="" />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, lineHeight: 1.25 }}>
            The Knowledge Academy
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.06em', color: '#C79A45', textTransform: 'uppercase', marginTop: 2 }}>
              International School
            </div>
          </div>
        </div>
        <div style={{ zIndex: 1 }}>
          <h1 style={{ fontSize: 34, lineHeight: 1.25, color: '#fff', maxWidth: 420 }}>
            One system for staff, students, families and attendance.
          </h1>
          <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 380, fontSize: 14.5, lineHeight: 1.6 }}>
            Manage records, track attendance through RFID turnstiles, and keep every department in sync — from admissions to the front gate.
          </p>
        </div>
        <div style={{ zIndex: 1, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>© {new Date().getFullYear()} The Knowledge Academy International School</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-canvas)' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
              {['en', 'ru', 'uz'].map((l) => (
                <button key={l} onClick={() => i18n.changeLanguage(l)}
                  className="btn btn-ghost btn-sm"
                  style={{ borderColor: i18n.language === l ? 'var(--brand-primary)' : 'var(--border-default)', color: i18n.language === l ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>{t('login.title')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>{t('login.subtitle')}</p>

          <form onSubmit={handleSubmit}>
            {!needsTwoFactor ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">{t('login.username')}</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input className="input" style={{ paddingLeft: 36 }} value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="field-label">{t('login.password')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input className="input" style={{ paddingLeft: 36 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">{t('login.twoFactorCode')}</label>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{t('login.twoFactor')}</p>
                <input className="input" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} autoFocus style={{ letterSpacing: 4, textAlign: 'center', fontSize: 18 }} />
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--status-danger)', background: 'var(--status-danger-bg)', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px 0' }} disabled={submitting}>
              {submitting ? t('common.loading') : (needsTwoFactor ? t('login.verify') : t('login.submit'))}
            </button>
          </form>

          <p style={{ marginTop: 22, fontSize: 12.5, color: 'var(--text-tertiary)', textAlign: 'center' }}>{t('login.forgot')}</p>
        </div>
      </div>
    </div>
  )
}
