/**
 * Line trang trí trang chủ — mỗi app một đường màu nhấn mọc từ dấu chấm cam của logo "Fox.", uốn đan chéo nhau rồi
 * đáp thẳng xuống ô app của nó (chấm + quầng ở đích, xung sáng chạy dọc đường) — cùng ngôn ngữ hình SortLines ở trang
 * Giới thiệu nhưng chỉ dùng SVG + CSS (trang chủ không nạp `motion`). Tài liệu: docs/features/trang-chu.md.
 *
 * Vị trí đo từ DOM thật (chấm logo, tên ô app có `data-line`) nên khớp mọi cỡ màn và mọi thứ tự ô người dùng chọn.
 * Chỉ nối tới ô ở **hàng đầu** của lưới: hàng sau (điện thoại 3 cột, ô link riêng) mà nối thì đường cắt ngang hàng trên.
 */
import { useEffect, useState, type RefObject } from 'react'

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

/**
 * Lớp SVG nằm dưới logo + ô app (CSS .lc-lines). `deps` đổi (VD thứ tự/số ô sau khi lưu Cài đặt) → đo lại.
 * Đo lại khi: đổi cỡ, font tải xong, hoạt ảnh trồi lên của logo/ô kết thúc (lúc đang trồi, vị trí lệch 12px).
 */
export default function TileLines({
  mainRef,
  deps,
}: {
  mainRef: RefObject<HTMLElement | null>
  deps: unknown
}) {
  const [shape, setShape] = useState<ReturnType<typeof measure> | null>(null)

  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const update = () => setShape(measure(main))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(main)
    main.addEventListener('animationend', update)
    document.fonts?.ready.then(update).catch(() => {})
    return () => {
      ro.disconnect()
      main.removeEventListener('animationend', update)
    }
  }, [mainRef, deps])

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
          {!s.planned && <path d={s.d} pathLength={100} className="lc-line-pulse" />}
          <circle cx={s.x} cy={s.y} r={7} className="lc-line-halo" />
          <circle cx={s.x} cy={s.y} r={3.2} className="lc-line-end" />
        </g>
      ))}
    </svg>
  )
}
