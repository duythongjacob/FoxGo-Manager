/** Khung trang dùng chung: nền + thanh trên (chỉ trang Giới thiệu). Xem docs/features/dieu-huong.md. */
import { useEffect, useState, type ReactNode } from 'react'
import { Button, Tooltip } from 'antd'
import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import Wordmark from '@/components/Wordmark'
import { href, type RouteId } from '@/lib/route'
import { MODE_LABEL, nextMode, type ThemeMode } from '@/lib/theme'

/** Biểu tượng nút đổi giao diện theo chế độ hiện tại. */
const MODE_ICON = { system: <DesktopOutlined />, light: <SunOutlined />, dark: <MoonOutlined /> }

interface Props {
  current: RouteId
  mode: ThemeMode
  onCycleMode: () => void
  children: ReactNode
}

/** Đã cuộn khỏi đỉnh trang chưa (thanh trên đổi sang dạng kính có viền + bóng). */
function useScrolled(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!enabled) return
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [enabled])
  return scrolled
}

/**
 * Khung chung. Trang chủ: toàn màn kiểu màn khóa, không thanh trên.
 * Giới thiệu: thanh trên kính sáng (logo, sáng/tối, nút về trang chủ — không menu mục, anh chọn 16/11/2026); chân trang do trang tự vẽ.
 */
export default function Layout({ current, mode, onCycleMode, children }: Props) {
  const home = current === 'home'
  const scrolled = useScrolled(!home)
  return (
    <div className={`fd-page${home ? ' is-immersive' : ' is-landing'}`}>
      <div className="fd-bg" aria-hidden>
        <span className="fd-blob b1" />
        <span className="fd-blob b2" />
        <span className="fd-blob b3" />
        <span className="fd-bg-grid" />
      </div>

      {!home && (
        <header className={`fd-top${scrolled ? ' is-scrolled' : ''}`}>
          <a className="fd-brand" href={href('about')} aria-label="FoxGo — về đầu trang giới thiệu">
            <Wordmark size={26} go />
          </a>
          <Tooltip
            title={`Giao diện: ${MODE_LABEL[mode]} — bấm để chuyển sang ${MODE_LABEL[nextMode(mode)]}`}
          >
            <Button
              shape="circle"
              icon={MODE_ICON[mode]}
              onClick={onCycleMode}
              aria-label={`Giao diện: ${MODE_LABEL[mode]}. Chuyển sang ${MODE_LABEL[nextMode(mode)]}`}
            />
          </Tooltip>
          <a className="fd-top-cta" href={href('home')}>
            Mở trang chủ
          </a>
        </header>
      )}

      {/* key = trang → đổi trang thì React dựng lại <main>, chạy lại hiệu ứng vào trang trong CSS */}
      <main className="fd-main" key={current}>
        {children}
      </main>
    </div>
  )
}
