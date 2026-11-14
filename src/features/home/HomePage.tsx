import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Input, Tooltip, type InputRef } from 'antd'
import { DesktopOutlined, MoonOutlined, SearchOutlined, SunOutlined } from '@ant-design/icons'
import { APPS } from '@/data/apps'
import { countByStatus, filterApps, openable, sortApps } from '@/lib/apps'
import { formatDate, formatTime, greeting, nudge } from '@/lib/greeting'
import { MODE_LABEL, nextMode, type ThemeMode } from '@/lib/theme'
import AppCard from './AppCard'

const MODE_ICON = { system: <DesktopOutlined />, light: <SunOutlined />, dark: <MoonOutlined /> }

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

interface Props {
  mode: ThemeMode
  onCycleMode: () => void
}

export default function HomePage({ mode, onCycleMode }: Props) {
  const now = useNow(15_000)
  const [q, setQ] = useState('')
  const searchRef = useRef<InputRef>(null)

  const all = useMemo(() => sortApps(APPS), [])
  const found = useMemo(() => filterApps(all, q), [all, q])
  const ready = found.filter((a) => a.status !== 'planned')
  const planned = found.filter((a) => a.status === 'planned')
  const counts = countByStatus(APPS)

  // Phím "/" để tìm nhanh (khi không đang gõ ở ô khác)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onEnter = () => {
    const can = openable(found)
    if (q.trim() && can.length === 1 && can[0].url) window.location.href = can[0].url
  }

  const hour = now.getHours()

  return (
    <div className="fd-page">
      <header className="fd-top">
        <div className="fd-brand">
          <img src="/icon.svg" alt="" width={32} height={32} />
          <span className="fd-brand-name">Foxdots</span>
        </div>
        <Tooltip title={`Giao diện: ${MODE_LABEL[mode]} — bấm để chuyển sang ${MODE_LABEL[nextMode(mode)]}`}>
          <Button
            shape="circle"
            icon={MODE_ICON[mode]}
            onClick={onCycleMode}
            aria-label={`Giao diện: ${MODE_LABEL[mode]}. Chuyển sang ${MODE_LABEL[nextMode(mode)]}`}
          />
        </Tooltip>
      </header>

      <main className="fd-main">
        <section className="fd-hero" aria-label="Lời chào">
          <div className="fd-hero-fox" aria-hidden>
            <img src="/fox/fox-foxdots.svg" alt="" width={72} height={79} />
          </div>
          <div className="fd-hero-body">
            <span className="fd-eyebrow">{formatDate(now)}</span>
            <div className="fd-hero-line">
              <span className="fd-clock">{formatTime(now)}</span>
              <h1 className="fd-greet">{greeting(hour)}!</h1>
            </div>
            <p className="fd-lead">{nudge(hour)}</p>
            <div className="fd-chips">
              <span className="fd-chip s-live">{counts.live} đang chạy</span>
              {counts.building > 0 && <span className="fd-chip s-building">{counts.building} đang xây</span>}
              <span className="fd-chip s-planned">{counts.planned} kế hoạch</span>
            </div>
          </div>
        </section>

        <Input
          ref={searchRef}
          size="large"
          allowClear
          className="fd-search"
          prefix={<SearchOutlined />}
          placeholder="Tìm app… (nhấn / để tìm, Enter để mở)"
          aria-label="Tìm app"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={onEnter}
        />

        {found.length === 0 ? (
          <div className="fd-empty" role="status">
            <SearchOutlined className="fd-empty-icon" aria-hidden />
            <p>Không có app nào khớp “{q}”.</p>
            <Button type="primary" onClick={() => setQ('')}>
              Xóa tìm kiếm
            </Button>
          </div>
        ) : (
          <>
            {ready.length > 0 && (
              <section aria-labelledby="h-ready">
                <h2 id="h-ready" className="fd-h2">
                  Ứng dụng của bạn
                </h2>
                <div className="fd-grid">
                  {ready.map((a) => (
                    <AppCard key={a.code} app={a} />
                  ))}
                </div>
              </section>
            )}
            {planned.length > 0 && (
              <section aria-labelledby="h-planned">
                <h2 id="h-planned" className="fd-h2">
                  Sắp ra mắt
                </h2>
                <div className="fd-grid">
                  {planned.map((a) => (
                    <AppCard key={a.code} app={a} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="fd-foot">
        Foxdots v{__APP_VERSION__} · Dữ liệu của bạn ở lại trong từng app — trang này chỉ chứa lối tắt.
      </footer>
    </div>
  )
}
