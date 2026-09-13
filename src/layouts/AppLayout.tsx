import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, GraduationCap, UserRound, ClipboardList, Radio, ShieldCheck,
  ScrollText, Settings, LogOut, Menu, X, Sun, Moon, ChevronLeft, ChevronRight
} from 'lucide-react'
import styles from './AppLayout.module.css'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, key: 'nav.dashboard', perm: 'dashboard.view', end: true },
  { to: '/employees', icon: Users, key: 'nav.employees', perm: 'employees.read' },
  { to: '/students', icon: GraduationCap, key: 'nav.students', perm: 'students.read' },
  { to: '/parents', icon: UserRound, key: 'nav.parents', perm: 'parents.read' },
  { to: '/attendance', icon: ClipboardList, key: 'nav.attendance', perm: 'attendance.read' },
  { to: '/devices', icon: Radio, key: 'nav.devices', perm: 'devices.manage' },
  { to: '/users', icon: ShieldCheck, key: 'nav.users', perm: 'users.manage' },
  { to: '/audit', icon: ScrollText, key: 'nav.audit', perm: 'audit.read' },
  { to: '/settings', icon: Settings, key: 'nav.settings', perm: 'settings.manage' }
]

const LANGS: { code: string; label: string }[] = [
  { code: 'en', label: 'EN' }, { code: 'ru', label: 'RU' }, { code: 'uz', label: 'UZ' }
]

export default function AppLayout() {
  const { t, i18n } = useTranslation()
  const { user, logout, hasPermission } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => hasPermission(item.perm))
  const initials = (user?.fullName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className={styles.shell}>
      <div className={`${styles.overlay} ${mobileOpen ? styles.show : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.brandRow}>
          <img src="/logo-mark-white.png" alt="TKA" className={styles.brandMark} />
          {!collapsed && (
            <div className={styles.brandText}>
              The Knowledge Academy
              <span>International School</span>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon className={styles.navIcon} strokeWidth={1.8} />
              {!collapsed && <span>{t(item.key)}</span>}
            </NavLink>
          ))}
          <div
            className={styles.navItem}
            onClick={logout}
            style={{ marginTop: 'auto' }}
          >
            <LogOut className={styles.navIcon} strokeWidth={1.8} />
            {!collapsed && <span>{t('nav.logout')}</span>}
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.collapseBtn} onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.langSwitch}>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  className={`${styles.langBtn} ${i18n.language === l.code ? styles.active : ''}`}
                  onClick={() => i18n.changeLanguage(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className={styles.userMenu} onClick={() => navigate('/settings')}>
              <div className={styles.avatar}>{initials}</div>
              <div>
                <div className={styles.userName}>{user?.fullName}</div>
                <div className={styles.userRole}>{user?.roleName}</div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
