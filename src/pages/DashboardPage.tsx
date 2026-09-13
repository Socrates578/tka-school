import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, GraduationCap, UserRound, CalendarCheck, LineChart as LineChartIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../api/client'
import type { DashboardStats } from '../api/types'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    api.get<DashboardStats>('/dashboard/stats').then((res) => setStats(res.data)).catch(() => {})
  }, [])

  return (
    <div>
      <PageHeader title={`${t('dashboard.welcome')}, ${user?.fullName?.split(' ')[0] || ''}`} subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label={t('dashboard.totalEmployees')} value={stats?.totalEmployees ?? '—'} icon={<Users size={17} />} />
        <StatCard label={t('dashboard.totalStudents')} value={stats?.totalStudents ?? '—'} icon={<GraduationCap size={17} />} />
        <StatCard label={t('dashboard.totalParents')} value={stats?.totalParents ?? '—'} icon={<UserRound size={17} />} />
        <StatCard label={t('dashboard.attendanceRate')} value={stats ? `${stats.todayAttendance.attendanceRatePercent}%` : '—'} icon={<CalendarCheck size={17} />} tone="success" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <LineChartIcon size={17} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 15 }}>{t('dashboard.weeklyTrend')}</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats?.attendanceTrend?.map((d) => ({ ...d, label: d.date.slice(5) })) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 13 }} />
              <Line type="monotone" dataKey="presentCount" stroke="#261A49" strokeWidth={2.4} dot={false} name="Present" />
              <Line type="monotone" dataKey="absentCount" stroke="#C79A45" strokeWidth={2.4} dot={false} name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>{t('dashboard.quickActions')}</h3>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/employees')}>{t('dashboard.addEmployee')}</button>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/students')}>{t('dashboard.addStudent')}</button>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/attendance')}>{t('dashboard.viewAttendance')}</button>

          <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.presentToday')}</span>
              <strong>{stats?.todayAttendance.presentToday ?? '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.lateToday')}</span>
              <strong>{stats?.todayAttendance.lateToday ?? '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.absentToday')}</span>
              <strong>{stats?.todayAttendance.absentToday ?? '—'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
