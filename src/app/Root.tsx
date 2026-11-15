import { useEffect, useState } from 'react'
import { App as AntApp, ConfigProvider, theme } from 'antd'
import viVN from 'antd/locale/vi_VN'
import LandingPage from '@/features/landing/LandingPage'
import LauncherPage from '@/features/launcher/LauncherPage'
import { nextMode, resolveDark, type ThemeMode } from '@/lib/theme'
import Layout from './Layout'
import { readMode, saveMode, systemPrefersDark } from './themeStore'
import { useRoute } from './useRoute'

const FONT = "'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', sans-serif"

export default function Root() {
  const [mode, setMode] = useState<ThemeMode>(readMode)
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark)
  const dark = resolveDark(mode, prefersDark)
  const route = useRoute()

  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = (e: MediaQueryListEvent) => setPrefersDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const cycleMode = () => {
    const m = nextMode(mode)
    setMode(m)
    saveMode(m)
  }

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: dark ? '#2dd4bf' : '#0f766e',
          borderRadius: 10,
          borderRadiusLG: 14,
          fontFamily: FONT,
        },
      }}
    >
      <AntApp>
        <Layout current={route.id} mode={mode} onCycleMode={cycleMode}>
          {route.id === 'home' ? <LauncherPage /> : <LandingPage />}
        </Layout>
      </AntApp>
    </ConfigProvider>
  )
}
