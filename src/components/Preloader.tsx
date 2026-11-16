/**
 * Màn chờ toàn trang của trang Giới thiệu: logo "Fox.Go" + vạch tiến độ (anh bỏ hình cáo 16/11/2026), che trang tới khi tải xong rồi
 * mờ dần. Dùng ở 2 chỗ: `Suspense` trong Root (lúc đang tải file JS của trang) và LandingPage (lúc đang tải font/ảnh)
 * — cùng một giao diện nên người xem thấy liền một mạch. CSS `.pl-*` ở styles/global.css (phải có sẵn trước khi file
 * JS trang Giới thiệu tải về). Không dùng thư viện `motion` — chỉ CSS. Tài liệu: docs/features/gioi-thieu.md.
 */
import { useEffect, useState } from 'react'
import Wordmark from './Wordmark'

/** Thời gian mờ dần khi xong (ms) — khớp `transition` của `.pl-root.is-done` trong global.css. */
export const PRELOADER_FADE_MS = 500

/**
 * Phần vạch tiến độ dành cho lúc tải file JS trang Giới thiệu (Suspense trong Root); phần còn lại là font + ảnh
 * (usePreload trong features/landing/hooks.ts). Đặt ở đây chứ không ở hooks.ts vì hooks.ts kéo theo `motion`.
 */
export const PRELOAD_START = 0.15

/**
 * @param progress tiến độ 0…1 (vạch chạy mượt nhờ CSS transition).
 * @param done true → mờ dần rồi gỡ khỏi DOM.
 */
export default function Preloader({ progress, done = false }: { progress: number; done?: boolean }) {
  const [gone, setGone] = useState(false)

  // Khóa cuộn khi màn chờ đang che — tránh người dùng cuộn trang (còn trống) phía sau.
  useEffect(() => {
    if (gone) return
    const html = document.documentElement
    html.classList.add('pl-lock')
    return () => html.classList.remove('pl-lock')
  }, [gone])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setGone(true), PRELOADER_FADE_MS)
    return () => clearTimeout(t)
  }, [done])

  if (gone) return null
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100)
  return (
    <div className={`pl-root${done ? ' is-done' : ''}`} role="status" aria-live="polite" aria-busy={!done}>
      <div className="pl-box">
        <Wordmark size={30} go />
        <div className="pl-bar" aria-hidden>
          <i style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <span className="pl-text">{done ? 'Sẵn sàng' : `Đang chuẩn bị… ${pct}%`}</span>
      </div>
    </div>
  )
}
