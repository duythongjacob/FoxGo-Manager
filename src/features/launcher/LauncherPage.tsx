/**
 * Trang chủ (#/) — xem docs/features/trang-chu.md, cài đặt ô: docs/features/cai-dat.md.
 * CSS: launcher.css (tiền tố .lc- trang, .dk- thanh thông số, .st- popup cài đặt).
 */
import { useMemo, useState, type CSSProperties } from 'react'
import { APPS } from '@/data/apps'
import { readPrefs, savePrefs } from '@/data/prefs'
import { sortApps, STATUS_LABEL, type FoxApp } from '@/lib/apps'
import type { Prefs, UserLink } from '@/lib/prefs'
import type { ThemeMode } from '@/lib/theme'
import Wordmark from '@/components/Wordmark'
import InfoDock from './InfoDock'
import SettingsModal from './SettingsModal'
import { tileKey, tileName, tilesOf } from './tiles'
import './launcher.css'

/** Thuộc tính mở tab mới; noopener/noreferrer để trang được mở không điều khiển ngược lại tab này. */
const newTabProps = (on: boolean) => (on ? { target: '_blank', rel: 'noopener noreferrer' } : {})

/** Ô app chỉ có chữ (tên + mô tả), ngăn cách bằng đường kẻ mảnh trong CSS. App "kế hoạch" không có link, hiển thị mờ. */
function AppTile({ app, newTab }: { app: FoxApp; newTab: boolean }) {
  const live = app.status !== 'planned' && !!app.url
  const style = { '--app-accent': app.accent } as CSSProperties
  const name = tileName({ kind: 'app', app })
  const inner = (
    <>
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
    <a
      className="lc-tile"
      href={app.url}
      style={style}
      aria-label={`Mở ${app.name}`}
      {...newTabProps(newTab)}
    >
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

/** Ô link người dùng tự thêm: tên + mô tả (không có thì tên miền), cùng kiểu chữ với ô app (không tải favicon — không gọi dịch vụ ngoài). */
function LinkTile({ link, newTab }: { link: UserLink; newTab: boolean }) {
  const host = link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return (
    <a
      className="lc-tile is-link"
      href={link.url}
      title={host}
      aria-label={`Mở ${link.name}`}
      {...newTabProps(newTab)}
    >
      <span className="lc-tile-name">{link.name}</span>
      <span className="lc-tile-desc">{link.desc ?? host.split('/')[0]}</span>
    </a>
  )
}

/**
 * Trang chủ — tối giản theo màn khóa Fox.TàiChính: thanh dọc bên trái là thông số (giờ, lời chào, thời tiết, giá),
 * giữa màn hình là chú cáo và các ô app + link riêng (thứ tự, mở tab mới, giao diện: popup Cài đặt).
 * Nền theo chế độ: tối = xanh đậm kiểu màn khóa, sáng = trắng sạch (biến --lc-* trong styles/global.css).
 */
export default function LauncherPage({
  mode,
  dark,
  onMode,
}: {
  /** Chế độ giao diện đang chọn (để popup Cài đặt hiển thị và đổi) */
  mode: ThemeMode
  /** Chế độ thực tế đang tối? (ô chọn thành phố đổi theme AntD theo đây) */
  dark: boolean
  onMode: (m: ThemeMode) => void
}) {
  const apps = useMemo(() => sortApps(APPS), [])
  const [prefs, setPrefs] = useState<Prefs>(readPrefs)
  const tiles = useMemo(() => tilesOf(apps, prefs), [apps, prefs])
  // Luôn thu nhỏ khi mở trang (anh chọn 15/11/2026) — không nhớ lựa chọn mở giữa các lần vào
  const [collapsed, setCollapsed] = useState(true)
  const toggle = () => setCollapsed(!collapsed)
  const [settings, setSettings] = useState(false)

  const save = (p: Prefs, m: ThemeMode) => {
    setPrefs(p)
    savePrefs(p)
    if (m !== mode) onMode(m)
    setSettings(false)
  }

  return (
    <div className="lc">
      <InfoDock dark={dark} collapsed={collapsed} onToggle={toggle} onSettings={() => setSettings(true)} />

      <div className="lc-main">
        <h1 className="lc-logo">
          <Wordmark size={88} />
        </h1>

        <nav className="lc-tiles" aria-label="Ứng dụng Fox và link của bạn">
          {tiles.map((t) =>
            t.kind === 'app' ? (
              <AppTile key={tileKey(t)} app={t.app} newTab={prefs.newTab} />
            ) : (
              <LinkTile key={tileKey(t)} link={t.link} newTab={prefs.newTab} />
            ),
          )}
        </nav>
      </div>

      <footer className="lc-foot">
        FoxGo<sup>®</sup>
        <i aria-hidden />
        Thong Duy
      </footer>

      <SettingsModal
        open={settings}
        prefs={prefs}
        mode={mode}
        apps={apps}
        onSave={save}
        onClose={() => setSettings(false)}
      />
    </div>
  )
}
