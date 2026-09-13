import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void }
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('tka_theme') as Theme) || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tka_theme', theme)
  }, [theme])

  function setTheme(t: Theme) { setThemeState(t) }
  function toggleTheme() { setThemeState((prev) => (prev === 'light' ? 'dark' : 'light')) }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
