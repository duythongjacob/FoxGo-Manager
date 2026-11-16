/**
 * Hình line chuyển động bên phải khối "Vì sao có Fox" (mục Kêu gọi cuối): 5 đường rối đan nhau bên trái, cuộn tới đâu
 * tự vẽ tới đó rồi duỗi thẳng thành 5 hàng ngay ngắn bên phải — minh họa câu "Fox giúp bạn sắp xếp mọi thứ vào đúng vị
 * trí". Cuối mỗi đường là chấm màu + tên một mảng app (data/apps.ts). Vẽ xong có xung sáng chạy dọc đường (CSS
 * .ld-sort-pulse, tắt khi giảm chuyển động). Phần rối có thêm icon công cụ (lịch, ví, tim…) to nhỏ, nghiêng lệch, rải
 * lộn xộn — cuộn tới khi đường duỗi thẳng thì icon trôi sang phải và mờ dần (mọi thứ đã "vào hàng").
 * Hệ tọa độ SVG 560×360. Tài liệu: docs/features/gioi-thieu.md.
 */
import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { APPS } from '@/data/apps'
import { sortApps } from '@/lib/apps'

/** Hàng đích (y) của 5 đường — cách đều nhau; đường cuối nối thẳng ra x = 430. */
const ROWS_Y = [50, 115, 180, 245, 310]
/** Phần rối: các đường bắt đầu ở độ cao lộn xộn, uốn chéo qua nhau rồi mới vào hàng. */
const PATHS = [
  'M10 290 C 90 80, 160 330, 240 170 C 290 70, 330 50, 380 50 L 430 50',
  'M10 120 C 120 260, 150 20, 230 140 C 280 210, 320 115, 380 115 L 430 115',
  'M10 200 C 70 330, 190 40, 250 230 C 290 330, 330 180, 380 180 L 430 180',
  'M10 60 C 100 180, 140 300, 220 250 C 300 200, 320 245, 380 245 L 430 245',
  'M10 330 C 120 300, 120 120, 200 90 C 290 60, 320 310, 380 310 L 430 310',
]
const AREAS = sortApps(APPS).slice(0, PATHS.length)

/** Nét icon trong khung 24×24 (vẽ nét, không tô) — vẽ tay đơn giản để không kéo thêm thư viện icon vào SVG. */
const GLYPHS = {
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4',
  wallet: 'M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM15 13h3',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  book: 'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13',
  check: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM8 12l3 3 5-6',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
  star: 'M12 3l2.8 6 6.2.6-4.7 4.2 1.4 6.2L12 16.8 6.3 20l1.4-6.2L3 9.6 9.2 9z',
  note: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8.5 8h7M8.5 12h7M8.5 16h4',
  dumbbell: 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12',
} as const

/**
 * Icon rải trong phần rối: [icon, x, y, cỡ (×24px), góc nghiêng °]. "Ngẫu nhiên" chọn tay một lần rồi cố định (anh
 * chọn 16/11/2026) — lần nào tải cũng giống nhau, không đè lên cột nhãn bên phải (x < 340).
 */
const SCATTER: [keyof typeof GLYPHS, number, number, number, number][] = [
  ['calendar', 24, 20, 1.1, -12],
  ['heart', 96, 58, 0.7, 8],
  ['wallet', 168, 14, 0.9, 14],
  ['star', 250, 40, 0.75, -6],
  ['note', 300, 96, 0.6, 10],
  ['clock', 40, 140, 0.8, 6],
  ['book', 132, 120, 1.2, -10],
  ['check', 214, 104, 0.65, 18],
  ['dumbbell', 14, 226, 0.95, -4],
  ['star', 92, 206, 0.55, -16],
  ['wallet', 180, 190, 1.0, 8],
  ['heart', 270, 250, 0.8, -12],
  ['note', 60, 300, 0.7, 12],
  ['calendar', 140, 280, 1.05, -8],
  ['clock', 230, 318, 0.6, 4],
  ['check', 300, 176, 0.7, -14],
]

/** Một icon rải: đứng lộn xộn lúc đầu, rồi trôi sang phải + mờ dần khi các đường vào hàng (lệch nhịp theo vị trí). */
function ScatterIcon({ k, progress }: { k: number; progress: MotionValue<number> }) {
  const [glyph, x, y, size, rot] = SCATTER[k]
  const start = 0.3 + (x / 340) * 0.15 // icon bên trái đi trước, bên phải đi sau
  const opacity = useTransform(progress, [start, start + 0.3], [0.7, 0])
  const dx = useTransform(progress, [start, start + 0.3], [0, 60])
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot} ${12 * size} ${12 * size}) scale(${size})`}>
      <m.g style={{ opacity, x: dx, color: AREAS[k % AREAS.length].accent }}>
        <path d={GLYPHS[glyph]} className="ld-sort-icon" />
      </m.g>
    </g>
  )
}

/** Một đường: nét nền tự vẽ theo cuộn (lệch nhịp nhau một chút) + xung sáng + chấm đích & nhãn hiện khi vẽ xong. */
function Strand({ d, i, progress }: { d: string; i: number; progress: MotionValue<number> }) {
  const start = i * 0.05
  const draw = useTransform(progress, [start, start + 0.7], [0, 1])
  const done = useTransform(progress, [start + 0.6, start + 0.75], [0, 1])
  const app = AREAS[i]
  const y = ROWS_Y[i]
  return (
    <g style={{ color: app.accent }}>
      <m.path d={d} className="ld-sort-line" style={{ pathLength: draw }} />
      <m.path
        d={d}
        pathLength={100}
        className="ld-sort-pulse"
        style={{ opacity: done, animationDelay: `${-i * 0.9}s` }}
      />
      <m.g style={{ opacity: done }}>
        <circle cx={430} cy={y} r={9} className="ld-sort-halo" />
        <circle cx={430} cy={y} r={4.5} fill="currentColor" />
        <text x={448} y={y + 5} className="ld-sort-label">
          {app.area}
        </text>
      </m.g>
    </g>
  )
}

export default function SortLines() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  // vẽ từ lúc khối vừa lộ ở đáy màn tới khi nằm giữa màn; giảm chuyển động → hiện sẵn
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'center 55%'] })
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v))
  return (
    <div className="ld-sort" ref={ref} aria-hidden>
      <svg viewBox="0 0 560 360">
        {/* lưới chấm mờ phía sau phần đã sắp — "đúng vị trí" */}
        <defs>
          <pattern id="ld-sort-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="ld-sort-dot" />
          </pattern>
          <linearGradient id="ld-sort-fade" x1="0" x2="1">
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.75" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="ld-sort-mask">
            <rect width="560" height="360" fill="url(#ld-sort-fade)" />
          </mask>
        </defs>
        <rect width="560" height="360" fill="url(#ld-sort-dots)" mask="url(#ld-sort-mask)" />
        <line x1={430} y1={20} x2={430} y2={340} className="ld-sort-axis" />
        {SCATTER.map((_, k) => (
          <ScatterIcon key={k} k={k} progress={progress} />
        ))}
        {PATHS.map((d, i) => (
          <Strand key={i} d={d} i={i} progress={progress} />
        ))}
      </svg>
    </div>
  )
}
