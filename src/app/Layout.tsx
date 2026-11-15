import type { ReactNode } from 'react'
import { Button, Tooltip } from 'antd'
import { ArrowLeftOutlined, DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import Wordmark from '@/components/Wordmark'
import { href, type RouteId } from '@/lib/route'
import { MODE_LABEL, nextMode, type ThemeMode } from '@/lib/theme'

const MODE_ICON = { system: <DesktopOutlined />, light: <SunOutlined />, dark: <MoonOutlined /> }

interface Props {
  current: RouteId
  mode: ThemeMode
  onCycleMode: () => void
  children: ReactNode
}

/**
 * Khung chung: nền lưới + vầng sáng (theo màn đăng nhập Fox.TàiChính).
 * Trang chủ: toàn màn tối kiểu màn khóa, không thanh trên. Giới thiệu: thanh trên kính tối + chân trang.
 */
export default function Layout({ current, mode, onCycleMode, children }: Props) {
  const home = current === 'home'
  return (
    <div className={`fd-page${home ? ' is-immersive' : ' is-landing'}`}>
      <div className="fd-bg" aria-hidden>
        <span className="fd-blob b1" />
        <span className="fd-blob b2" />
        <span className="fd-blob b3" />
        <span className="fd-bg-grid" />
      </div>

      {!home && (
        <header className="fd-top">
          <a className="fd-brand" href={href('about')} aria-label="FoxGo — giới thiệu">
            <Wordmark size={26} />
          </a>
          <a className="fd-top-link" href={href('home')}>
            <ArrowLeftOutlined /> Trang chủ
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
        </header>
      )}

      <main className="fd-main" key={current}>
        {children}
      </main>

      {!home && (
        <footer className="fd-foot">
          FoxGo<sup>®</sup>
          <i aria-hidden />
          Thong Duy
        </footer>
      )}
    </div>
  )
}
