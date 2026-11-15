/** Trang chủ (#/) — xem docs/features/trang-chu.md. CSS: launcher.css (tiền tố .lc- trang, .dk- thanh thông số). */
import { useMemo, useState, type CSSProperties } from 'react'
import { APPS } from '@/data/apps'
import { sortApps, STATUS_LABEL, type FoxApp } from '@/lib/apps'
import Wordmark from '@/components/Wordmark'
import InfoDock from './InfoDock'
import './launcher.css'

/** Ô app dạng kính (như ảnh đại diện màn khóa). App "kế hoạch" không có link, hiển thị mờ. */
function AppTile({ app }: { app: FoxApp }) {
  const live = app.status !== 'planned' && !!app.url
  const style = { '--app-accent': app.accent } as CSSProperties
  // "Fox.TàiChính" → "Tài Chính"
  const name = app.name.replace('Fox.', '').replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
  const inner = (
    <>
      <span className="lc-tile-glass" aria-hidden>
        <img src={app.mascot} alt="" width={44} height={44} />
      </span>
      <span className="lc-tile-name">{name}</span>
      {app.tagline && <span className="lc-tile-desc">{app.tagline}</span>}
      {app.highlights && app.highlights.length > 0 && (
        <span className="lc-pop" aria-hidden>
          <span className="lc-pop-head">
            {app.name}
            <em>{live ? STATUS_LABEL[app.status] : 'Sắp ra mắt'}</em>
          </span>
          {app.highlights.slice(0, 3).map((h) => (
            <span key={h} className="lc-pop-item">
              {h}
            </span>
          ))}
        </span>
      )}
    </>
  )
  return live ? (
    <a className="lc-tile" href={app.url} style={style} aria-label={`Mở ${app.name}`}>
      {inner}
    </a>
  ) : (
    <span
      className="lc-tile is-planned"
      style={style}
      title={`${app.name} — ${STATUS_LABEL[app.status]}`}
      aria-label={`${app.name} — ${STATUS_LABEL[app.status]}`}
    >
      {inner}
    </span>
  )
}

/**
 * Trang chủ — tối giản theo màn khóa Fox.TàiChính: thanh dọc bên trái là thông số (giờ, lời chào, thời tiết, giá),
 * giữa màn hình là chú cáo và các ô app.
 */
export default function LauncherPage() {
  const apps = useMemo(() => sortApps(APPS), [])
  // Luôn thu nhỏ khi mở trang (anh chọn 15/11/2026) — không nhớ lựa chọn mở giữa các lần vào
  const [collapsed, setCollapsed] = useState(true)
  const toggle = () => setCollapsed(!collapsed)

  return (
    <div className="lc">
      <InfoDock collapsed={collapsed} onToggle={toggle} />

      <div className="lc-main">
        <h1 className="lc-logo">
          <Wordmark size={88} />
        </h1>

        <nav className="lc-tiles" aria-label="Ứng dụng Fox">
          {apps.map((a) => (
            <AppTile key={a.code} app={a} />
          ))}
        </nav>
      </div>

      <footer className="lc-foot">
        FoxGo<sup>®</sup>
        <i aria-hidden />
        Thong Duy
      </footer>
    </div>
  )
}
