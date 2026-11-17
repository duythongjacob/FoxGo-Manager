/**
 * Line trang trí trang chủ — mỗi app một đường màu nhấn mọc từ dấu chấm cam của logo "Fox.", uốn đan chéo nhau rồi
 * đáp thẳng xuống ô app của nó (chấm + quầng ở đích, xung sáng chạy dọc đường) — cùng ngôn ngữ hình SortLines ở trang
 * Giới thiệu nhưng chỉ dùng SVG + CSS (trang chủ không nạp `motion`). Tài liệu: docs/features/trang-chu.md.
 *
 * Vị trí đo từ DOM thật (chấm logo, tên ô app có `data-line`) nên khớp mọi cỡ màn và mọi thứ tự ô người dùng chọn.
 * Chỉ nối tới ô ở **hàng đầu** của lưới: hàng sau (điện thoại 3 cột, ô link riêng) mà nối thì đường cắt ngang hàng trên.
 */
import { useEffect, useRef, useState, type RefObject } from 'react'

/** Một đường đã tính: path SVG + điểm đích + màu. */
interface Strand {
  d: string
  x: number
  y: number
  accent: string
  planned: boolean
}

/** Lệch ngang/dọc riêng từng đường (px) — chọn tay một lần để các đường đan nhau tự nhiên mà lần nào tải cũng giống nhau. */
const JITTER_X = [-34, 26, -14, 38, -28, 18, -8, 30]
const JITTER_Y = [6, -8, 10, -4, 8, -10, 4, -6]
/** Khoảng hở (px) giữa chấm đích và chữ tên app. */
const END_GAP = 12

/** Đo lại vị trí chấm logo + tên ô app (tọa độ tương đối với `main`) và dựng đường cong cho từng ô hàng đầu. */
function measure(main: HTMLElement): { w: number; h: number; strands: Strand[] } {
  const box = main.getBoundingClientRect()
  const dot = main.querySelector('.lc-logo .wm-dot')?.getBoundingClientRect()
  const tiles = [...main.querySelectorAll<HTMLElement>('.lc-tile[data-line]')]
  if (!dot || tiles.length === 0) return { w: box.width, h: box.height, strands: [] }
  const rows = tiles.map((t) => t.getBoundingClientRect().top)
  const firstRow = Math.min(...rows)
  const sx = dot.left + dot.width / 2 - box.left
  const sy = dot.bottom - box.top + 6
  const strands = tiles
    .filter((_, i) => rows[i] - firstRow < 4)
    .map((t, i): Strand => {
      const name = (t.querySelector('.lc-tile-name') ?? t).getBoundingClientRect()
      const tx = name.left + name.width / 2 - box.left
      const ty = name.top - box.top - END_GAP
      const h = ty - sy
      // Điểm giữa lệch về phía NGƯỢC với ô đích → đường vòng sang bên kia rồi mới quay về, các đường cắt chéo nhau.
      // Kẹp trong màn hình (cách mép 12px) để trên điện thoại đường không tràn ra ngoài.
      const lo = 12 - box.left
      const hi = window.innerWidth - 12 - box.left
      const mx = Math.min(hi, Math.max(lo, sx - (tx - sx) * 0.5 + JITTER_X[i % JITTER_X.length]))
      const my = sy + h * 0.45 + JITTER_Y[i % JITTER_Y.length]
      // Tay nắm DỌC ở cả 3 điểm (đầu, giữa, đích) → sóng mềm như hình mẫu, không gập kiểu kẹp tóc khi xòe ngang rộng.
      const d =
        `M${sx} ${sy} C${sx} ${sy + h * 0.3}, ${mx} ${my - h * 0.28}, ${mx} ${my}` +
        ` S${tx} ${ty - h * 0.4}, ${tx} ${ty}`
      return { d, x: tx, y: ty, accent: t.dataset.line ?? 'currentColor', planned: t.dataset.planned === '1' }
    })
  return { w: box.width, h: box.height, strands }
}

/** Xung sáng đầu tiên: sau khi các đường vẽ xong (CSS lc-line-draw: trễ 0.55s + 1.4s + lệch nhịp). */
const FIRST_PULSE_MS = 2200
/** Sau đó cứ mỗi chừng này lại cho MỘT đường lóe (lần lượt) — giữa các lần không có hoạt ảnh nào → CPU ~0. */
const PULSE_EVERY_MS = 9000
/** Không có thao tác chuột/phím/chạm trong chừng này → ngừng lóe định kỳ tới khi có thao tác lại. */
const IDLE_STOP_MS = 60_000

/**
 * Lớp SVG nằm dưới logo + ô app (CSS .lc-lines). `deps` đổi (VD thứ tự/số ô sau khi lưu Cài đặt) → đo lại.
 * Đo lại khi: đổi cỡ, font tải xong, hoạt ảnh trồi lên của logo/ô kết thúc (lúc đang trồi, vị trí lệch 12px).
 *
 * Xung sáng KHÔNG chạy liên tục (đo 17/11/2026: chạy vòng lặp vô hạn tốn ~150 ms CPU/giây trên desktop, ~500 trên
 * điện thoại giả lập — trang chủ mở cả ngày → hao pin). Chỉ lóe: tất cả một lần lúc vào trang, rồi mỗi 9 giây một
 * đường, rê chuột vào ô app thì đường của ô đó lóe. Tab ẩn, 60 giây không thao tác, hoặc giảm chuyển động → không lóe
 * (đo lại: lóe theo nhịp ~40 ms/giây desktop; để yên quá 60 giây → như không có line).
 */
export default function TileLines({
  mainRef,
  deps,
}: {
  mainRef: RefObject<HTMLElement | null>
  deps: unknown
}) {
  const [shape, setShape] = useState<ReturnType<typeof measure> | null>(null)
  /** Chỉ số các đường đang lóe; đường lóe xong (animationend) tự rút khỏi danh sách. */
  const [pulsing, setPulsing] = useState<number[]>([])
  const lastShape = useRef('')

  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const update = () => {
      const next = measure(main)
      const key = JSON.stringify(next)
      if (key === lastShape.current) return // không đổi → khỏi vẽ lại
      lastShape.current = key
      setShape(next)
    }
    // animationend nổi bọt lên cả từ nét line/xung sáng bên trong SVG → bỏ qua, chỉ đo khi logo/ô trồi xong
    const onAnimEnd = (e: AnimationEvent) => {
      if (!(e.target as Element).closest('.lc-lines')) update()
    }
    // rê chuột (không tính chạm) vào ô app đang chạy → đường của ô đó lóe; ô hàng đầu đứng đầu DOM nên chỉ số trùng
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const tile = (e.target as Element).closest<HTMLElement>('.lc-tile[data-line]')
      if (!tile || tile.dataset.planned === '1') return
      const i = [...main.querySelectorAll('.lc-tile[data-line]')].indexOf(tile)
      setPulsing((p) => (p.includes(i) ? p : [...p, i]))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(main)
    main.addEventListener('animationend', onAnimEnd)
    main.addEventListener('pointerover', onOver)
    document.fonts?.ready.then(update).catch(() => {})
    return () => {
      ro.disconnect()
      main.removeEventListener('animationend', onAnimEnd)
      main.removeEventListener('pointerover', onOver)
    }
  }, [mainRef, deps])

  // Danh sách đường được lóe (app đang chạy) dạng chuỗi → effect chỉ chạy lại khi tập này thật sự đổi
  const liveKey = shape?.strands.flatMap((s, i) => (s.planned ? [] : [i])).join(',') ?? ''
  useEffect(() => {
    if (!liveKey || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ids = liveKey.split(',').map(Number)
    let next = 0
    let lastActive = Date.now()
    const active = () => {
      lastActive = Date.now()
    }
    // chế độ "Chậm" (Cài đặt → Hiệu ứng line) kéo dài thời gian vẽ theo --lc-line-k → lóe đầu tiên chờ tương ứng
    const main = mainRef.current
    const k = (main && parseFloat(getComputedStyle(main).getPropertyValue('--lc-line-k'))) || 1
    const first = setTimeout(() => setPulsing(ids), FIRST_PULSE_MS * k)
    const timer = setInterval(() => {
      // tab ẩn, hoặc để nguyên lâu không ai đụng (homepage mở cả ngày) → thôi lóe, CPU về ~0
      if (document.hidden || Date.now() - lastActive > IDLE_STOP_MS) return
      setPulsing((p) => (p.length > 0 ? p : [ids[next++ % ids.length]]))
    }, PULSE_EVERY_MS)
    const EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'visibilitychange'] as const
    EVENTS.forEach((t) => window.addEventListener(t, active, { passive: true }))
    return () => {
      clearTimeout(first)
      clearInterval(timer)
      EVENTS.forEach((t) => window.removeEventListener(t, active))
    }
  }, [liveKey, mainRef])

  if (!shape || shape.strands.length === 0) return null
  return (
    <svg
      className="lc-lines"
      width={shape.w}
      height={shape.h}
      viewBox={`0 0 ${shape.w} ${shape.h}`}
      aria-hidden
    >
      {shape.strands.map((s, i) => (
        <g
          key={i}
          className={`lc-strand${s.planned ? ' is-planned' : ''}`}
          style={{ color: s.accent, ['--i' as string]: i }}
        >
          <path d={s.d} pathLength={100} className="lc-line" />
          {!s.planned && pulsing.includes(i) && (
            <path
              d={s.d}
              pathLength={100}
              className="lc-line-pulse"
              onAnimationEnd={() => setPulsing((p) => p.filter((x) => x !== i))}
            />
          )}
          <circle cx={s.x} cy={s.y} r={7} className="lc-line-halo" />
          <circle cx={s.x} cy={s.y} r={3.2} className="lc-line-end" />
        </g>
      ))}
    </svg>
  )
}
