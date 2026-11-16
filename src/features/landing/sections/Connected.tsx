/**
 * Mục 02 — "Mọi thứ trong cuộc sống đều liên quan". Mục ghim (cao 320vh, khung con sticky). Sơ đồ kiểu trục bánh xe
 * (anh duyệt 16/11/2026): FoxGo ở tâm (vòng màu 6 app xoay chậm), mỗi app một nan nối vào tâm — cuộn tới đâu nan vẽ
 * tới app đó, app nổi lên, phần chữ bên cạnh đổi sang app đó; nối xong có chấm sáng màu app chạy dọc nan **về tâm**
 * ("gom về một nơi"). Không có vòng quỹ đạo — các app đặt lệch nhau kiểu chòm sao (anh yêu cầu 16/11/2026). Đoạn kết
 * (giai đoạn 3: các app nói chuyện với nhau): mọi nan cùng sáng màu app, chấm chạy nhanh hơn, lõi rực hơn.
 * Rê chuột vào app → nan + nút sáng hơn, phần chữ hiện app đó. Tài liệu: docs/features/gioi-thieu.md.
 */
import { useRef, useState, type ComponentType, type CSSProperties } from 'react'
import {
  AimOutlined,
  BankOutlined,
  BulbOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckSquareOutlined,
  CoffeeOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  ExperimentOutlined,
  FieldTimeOutlined,
  FireOutlined,
  FlagOutlined,
  GiftOutlined,
  HeartOutlined,
  LineChartOutlined,
  MoonOutlined,
  PieChartOutlined,
  PlaySquareOutlined,
  ReadOutlined,
  RocketOutlined,
  ToolOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from 'motion/react'
import Wordmark from '@/components/Wordmark'
import { APPS } from '@/data/apps'
import { sortApps, type FoxApp } from '@/lib/apps'
import { stepOf } from '@/lib/motion'
import { APP_STORY, FINALE, SECTION } from '../content'
import { EASE } from '../hooks'
import { SectionHead } from '../kit'

const APPS_SORTED = sortApps(APPS)
const N = APPS_SORTED.length
/** Phần tiến độ dành cho việc lần lượt bật từng app; phần còn lại là đoạn kết (các app nói chuyện với nhau). */
const SPAN = 0.8

/**
 * Vị trí từng app (theo thứ tự sortApps), hệ tọa độ SVG 0–400, tâm 200,200: [góc (độ, 0 = sang phải, chiều kim đồng
 * hồ), khoảng cách tới tâm]. Đặt lệch tay (góc không đều, xa gần xen kẽ) cho bố cục tự nhiên kiểu chòm sao; vẫn giữ
 * thứ tự vòng quanh lõi để nan không cắt nhau. Gần ≥ 125 để nút không chạm lõi, xa ≤ 160 để vệ tinh còn trong khung.
 * Ít hơn 6 app → dùng các vị trí đầu; nhiều hơn → chia đều (dự phòng).
 */
const LAYOUT: [number, number][] = [
  [-96, 140],
  [-30, 158],
  [28, 128],
  [88, 154],
  [146, 130],
  [206, 160],
]
const place = (i: number): [number, number] => LAYOUT[i] ?? [(i / N) * 360 - 90, 150]

/** Tọa độ trên tia của app thứ i ở khoảng cách r tới tâm (mặc định = vị trí nút). */
const pos = (i: number, r = place(i)[1]) => {
  const a = (place(i)[0] * Math.PI) / 180
  return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) }
}

/**
 * Icon vệ tinh theo mã app (docs/MA_APP.md) — các mặt khác nhau của app; chỉ dùng tối đa SATS.length icon đầu.
 * App mới chưa có thì không có vệ tinh.
 */
const ICONS: Record<string, ComponentType[]> = {
  FF: [WalletOutlined, LineChartOutlined, PieChartOutlined, BankOutlined],
  FW: [CheckSquareOutlined, CalendarOutlined, FieldTimeOutlined, FlagOutlined],
  FH: [HeartOutlined, FireOutlined, MoonOutlined, CoffeeOutlined],
  FL: [ReadOutlined, BulbOutlined, EditOutlined, ExperimentOutlined],
  FE: [CustomerServiceOutlined, PlaySquareOutlined, CameraOutlined, GiftOutlined],
  FS: [TrophyOutlined, RocketOutlined, ToolOutlined, AimOutlined],
}

/**
 * Vị trí 3 vệ tinh: [góc lệch so với hướng ra ngoài lõi (độ), khoảng cách tâm vệ tinh tới tâm nút (% cạnh nút —
 * mép nút = 50%)]. Xếp đều trên một cung phía ngoài — không đè nan (nan vào nút từ phía lõi, 180°).
 */
const SATS: [number, number][] = [
  [-46, 76],
  [0, 82],
  [46, 76],
]

/** Nan từ tâm dừng ở mép lõi FoxGo (≈ 50 đơn vị SVG bán kính) và mép nút app (≈ 34). */
const LINE_FROM = 52
const NODE_R = 34

/**
 * Một app trên sơ đồ: nan nối vào tâm + nút chỉ có tên mảng (tối giản — anh bỏ icon + nhãn trạng thái trong nút
 * 16/11/2026) + 3 vệ tinh. App chưa chạy: viền nét đứt, nền nhạt — không làm mờ cả nút (anh bỏ làm mờ 16/11/2026). `hot` = đang được nói tới (cuộn tới / rê chuột).
 * Chấm sáng chạy dọc nan từ app về lõi, lặp mãi (CSS .ld-net-pulse, pathLength=100 để dash tính theo % đường).
 */
function Node({
  app,
  i,
  progress,
  hot,
  onHover,
}: {
  app: FoxApp
  i: number
  progress: MotionValue<number>
  hot: boolean
  onHover: (i: number | null) => void
}) {
  const start = (i / N) * SPAN
  const end = start + SPAN / N
  const draw = useTransform(progress, [start, end], [0, 1])
  const on = useTransform(progress, [start + (end - start) * 0.6, end], [0, 1])
  const scale = useTransform(on, [0, 1], [0.86, 1])
  const p = pos(i)
  const [out, dist] = place(i) // hướng tia từ lõi ra app (độ) + khoảng cách
  const inner = pos(i, LINE_FROM)
  const outer = pos(i, dist - NODE_R)
  const sats = (ICONS[app.code] ?? []).slice(0, SATS.length)
  const live = app.status === 'live'
  const accent = { '--app-accent': app.accent } as CSSProperties
  return (
    <>
      <svg className={`ld-net-svg${hot ? ' is-hot' : ''}`} viewBox="0 0 400 400" style={accent} aria-hidden>
        {/* nan vẽ dần từ lõi ra app khi cuộn */}
        <m.line
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          className="ld-net-line"
          style={{ pathLength: draw }}
        />
        {/* xung đi theo chiều đường vẽ → đường vẽ từ app vào lõi để chấm sáng chạy "về tâm" */}
        <m.line
          x1={outer.x}
          y1={outer.y}
          x2={inner.x}
          y2={inner.y}
          pathLength={100}
          className="ld-net-pulse"
          style={{ opacity: on, animationDelay: `${-i * 0.37}s` }}
        />
      </svg>
      <m.span
        className={`ld-net-node${hot ? ' is-hot' : ''}${live ? '' : ' is-soon'}`}
        style={
          {
            left: `${(p.x / 400) * 100}%`,
            top: `${(p.y / 400) * 100}%`,
            scale,
            ...accent,
          } as MotionStyle
        }
        onPointerEnter={() => onHover(i)}
        onPointerLeave={() => onHover(null)}
      >
        <span className="ld-net-dot">
          {app.area}
          {sats.map((Icon, k) => {
            const [ang, dist] = SATS[k]
            const r = ((out + ang) * Math.PI) / 180
            return (
              <span
                key={k}
                className="ld-net-icon"
                aria-hidden
                style={
                  {
                    left: `${50 + dist * Math.cos(r)}%`,
                    top: `${50 + dist * Math.sin(r)}%`,
                    animationDelay: `${-(i * 0.9 + k * 0.6)}s`,
                  } as CSSProperties
                }
              >
                <Icon />
              </span>
            )
          })}
        </span>
      </m.span>
    </>
  )
}

/** Dải màu 6 app theo thứ tự trên sơ đồ (bắt đầu từ đỉnh) — cho vòng màu quanh lõi. */
const APP_SPECTRUM = `conic-gradient(${[...APPS_SORTED, APPS_SORTED[0]].map((a) => a.accent).join(', ')})`

export default function Connected() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  const [linked, setLinked] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // đổi chữ khi nút kế tiếp bắt đầu sáng (60% quãng của nó — khớp `on` trong Node), không sớm hơn
    setActive(stepOf((v - (0.6 * SPAN) / N) / SPAN, N))
    setLinked(v > SPAN + 0.05)
  })
  // rê chuột vào app nào thì phần chữ nói về app đó (kể cả khi đã tới đoạn kết)
  const focus = hover ?? (linked ? null : active)
  const app = APPS_SORTED[focus ?? active]

  return (
    <section ref={ref} id={SECTION.connected} className="ld-connected" aria-labelledby="h-connected">
      <div className="ld-sticky">
        <div className="ld-wrap ld-connected-inner">
          <div className="ld-connected-text">
            <SectionHead
              id="h-connected"
              eyebrow="Hệ sinh thái"
              lines={['Kết nối.']}
              lead={[
                'Cuộc sống của chúng ta không được tạo nên từ những ngăn riêng biệt. Công việc, tài chính, sức khỏe, học tập và những ước mơ luôn đan xen, ảnh hưởng và nuôi dưỡng lẫn nhau.',
                'FoxGo bắt đầu bằng một trang chủ chung, nơi mỗi nhu cầu có không gian riêng, mỗi ứng dụng làm tốt một việc. Rồi từng bước, chúng tôi kết nối chúng lại để mọi thứ có thể thấu hiểu và hỗ trợ lẫn nhau.',
                'Không phải để bạn dành thêm thời gian quản lý cuộc sống, mà để bạn có thêm thời gian sống một cuộc đời mình mong muốn.',
              ]}
            />
            <div className="ld-net-caption" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={focus === null ? 'linked' : app.code}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {focus === null ? (
                    <>
                      <b>Các app nói chuyện với nhau</b>
                      <p className="ld-story">“{FINALE.story}”</p>
                      <ol className="ld-phases">
                        {FINALE.phases.map((p, i) => (
                          <li key={p} className={i === 0 ? 'is-now' : undefined}>
                            <span>Giai đoạn {i + 1}</span>
                            {p}
                          </li>
                        ))}
                      </ol>
                    </>
                  ) : (
                    <>
                      <b>{app.name}</b>
                      <p className="ld-story">“{APP_STORY[app.code]?.moment}”</p>
                      <p className="ld-net-desc">{app.desc}</p>
                      <p className="ld-net-link">
                        <em className="ld-soon">Kết nối · lộ trình</em>
                        {APP_STORY[app.code]?.link}
                      </p>
                    </>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          <div
            className={`ld-net${linked ? ' is-linked' : ''}`}
            style={
              {
                '--spectrum': APP_SPECTRUM,
                '--core-accent': focus === null ? 'var(--primary)' : app.accent,
              } as CSSProperties
            }
          >
            {APPS_SORTED.map((a, i) => (
              <Node
                key={a.code}
                app={a}
                i={i}
                progress={scrollYProgress}
                hot={focus === i}
                onHover={setHover}
              />
            ))}
            <span className="ld-net-core">
              <Wordmark size={30} go />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
