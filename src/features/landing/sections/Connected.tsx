/**
 * Mục 02 — "Mọi thứ đều liên quan". Mục ghim (cao 320vh, khung con sticky). Sơ đồ tối giản (anh yêu cầu 17/11/2026:
 * đơn giản, hiện đại, đường cong có logic):
 * - FoxGo ở tâm, 6 app chia đều quanh tâm, mỗi app là một nhãn gọn (chấm màu + tên mảng).
 * - **Nan cong nét liền** từ lõi ra từng app, cùng xoáy một chiều = "mở app từ trang chủ" — cái đang có (giai đoạn 1).
 *   Cuộn tới đâu nan vẽ tới app đó, phần chữ bên cạnh kể về app đó; chấm sáng chạy dọc nan về lõi.
 * - **Đường cong nét đứt** giữa hai app = "các app sẽ hiểu nhau" — LỘ TRÌNH giai đoạn 3, vẽ đúng các cặp trong
 *   `APP_STORY[*].with` (content.ts), không bịa thêm. Đang nói về app nào → hiện đường nối của app đó; đoạn kết →
 *   mọi đường nối cùng hiện, nét đứt chảy giữa hai app.
 * - Rê chuột vào app → app + các app nó nối tới sáng lên, phần còn lại mờ đi.
 * Tài liệu: docs/features/gioi-thieu.md.
 */
import { useId, useRef, useState, type CSSProperties } from 'react'
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
import { APP_STORY, CONNECTED_INTRO, FINALE, SECTION } from '../content'
import { EASE } from '../hooks'
import { SectionHead } from '../kit'

const APPS_SORTED = sortApps(APPS)
const N = APPS_SORTED.length
/** Phần tiến độ dành cho việc lần lượt bật từng app; phần còn lại là đoạn kết (các app báo cho nhau). */
const SPAN = 0.8

/* ---------- Hình học (hệ tọa độ SVG 0–400, tâm 200,200; góc độ, 0 = sang phải, chiều kim đồng hồ) ---------- */
const C = 200
/** Bán kính vòng đặt app (đơn vị SVG). Lõi FoxGo ≈ 48 → còn chỗ cho đường nối vòng qua lõi. */
const R = 148
/** App chia đều, app đầu ở đỉnh. */
const angleOf = (i: number) => -90 + (i * 360) / N
const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}
const pt = (p: { x: number; y: number }) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`
/** Vị trí nhãn app theo % khung (đặt bằng CSS left/top). */
const nodePct = (i: number) => {
  const p = polar(angleOf(i), R)
  return { left: `${(p.x / 400) * 100}%`, top: `${(p.y / 400) * 100}%` }
}

/**
 * Nan app i: Bézier bậc 2 từ mép lõi tới app. Điểm đầu và điểm điều khiển lệch góc thuận chiều kim đồng hồ (+26°,
 * +18°) → mọi nan cong cùng một chiều như cánh chong chóng — có nhịp, không cắt nhau. `back` = chiều ngược (app → lõi)
 * cho chấm sáng chạy "về tâm".
 */
function spokePath(i: number, back = false) {
  const a = angleOf(i)
  const p0 = polar(a + 26, 54)
  const c = polar(a + 18, 104)
  const p2 = polar(a, R)
  return back ? `M ${pt(p2)} Q ${pt(c)} ${pt(p0)}` : `M ${pt(p0)} Q ${pt(c)} ${pt(p2)}`
}

/**
 * Đường nối app i → app j: Bézier bậc 2, điểm điều khiển nằm trên phân giác cung ngắn giữa hai app → đường chạy vòng
 * trong dải giữa lõi (≈ 56) và vòng app (148), không đâm xuyên lõi, không đè nhãn app ở giữa. Đỉnh võng theo độ xa
 * (apex = 120 − 2d/15: kề nhau 112, cách một 104, đối diện 96) → đường càng dài càng chạy vòng trong, các đường xếp
 * lớp như quỹ đạo thay vì cắt chéo. Cặp đối diện (d = 180) võng về phía ngược chiều kim đồng hồ của app i (app đứng
 * trước trong danh sách) cho cố định.
 */
function linkPath(i: number, j: number) {
  const ai = angleOf(i)
  let d = (((angleOf(j) - ai) % 360) + 360) % 360
  let from = ai
  if (d > 180) {
    d = 360 - d
    from = angleOf(j)
  }
  const mid = d === 180 ? ai - 90 : from + d / 2
  const apex = 120 - (2 * d) / 15
  // đỉnh Bézier bậc 2 = trung điểm (dây cung, điểm điều khiển) → rc = 2·apex − R·cos(d/2)
  const rc = 2 * apex - R * Math.cos(((d / 2) * Math.PI) / 180)
  const p0 = polar(ai, R)
  const p2 = polar(angleOf(j), R)
  return { d: `M ${pt(p0)} Q ${pt(polar(mid, rc))} ${pt(p2)}`, p0, p2 }
}

/** Các cặp app nối nhau (chỉ số theo APPS_SORTED, i < j), lấy từ APP_STORY.with, bỏ trùng và mã không có. */
const LINKS: [number, number][] = (() => {
  const idx = new Map(APPS_SORTED.map((a, k) => [a.code, k]))
  const seen = new Set<string>()
  const out: [number, number][] = []
  for (const a of APPS_SORTED) {
    for (const code of APP_STORY[a.code]?.with ?? []) {
      const k = idx.get(code)
      const i = idx.get(a.code)!
      if (k === undefined || k === i) continue
      const pair: [number, number] = i < k ? [i, k] : [k, i]
      const key = pair.join('-')
      if (!seen.has(key)) {
        seen.add(key)
        out.push(pair)
      }
    }
  }
  return out
})()
const neighbors = (i: number) => LINKS.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []))

/** Quãng cuộn của app i: nan vẽ (`draw` 0→1) rồi nhãn hiện (`on`, 60% cuối quãng). */
function useReveal(progress: MotionValue<number>, i: number) {
  const start = (i / N) * SPAN
  const end = start + SPAN / N
  const draw = useTransform(progress, [start, end], [0, 1])
  const on = useTransform(progress, [start + (end - start) * 0.6, end], [0, 1])
  return { draw, on }
}

/** Nan cong từ lõi ra app + chấm sáng chạy về lõi (CSS .ld-net-pulse, pathLength=100 để dash tính theo %). */
function Spoke({ app, i, progress, hot }: { app: FoxApp; i: number; progress: MotionValue<number>; hot: boolean }) {
  const { draw, on } = useReveal(progress, i)
  // pathLength 0 vẫn để lại chấm đầu tròn ở mép lõi → ẩn hẳn khi nan chưa bắt đầu vẽ
  const shown = useTransform(draw, [0, 0.02], [0, 1])
  return (
    <g className={`ld-net-spoke${hot ? ' is-hot' : ''}`} style={{ '--app-accent': app.accent } as CSSProperties}>
      <m.path d={spokePath(i)} className="ld-net-line" style={{ pathLength: draw, opacity: shown }} />
      <m.path
        d={spokePath(i, true)}
        pathLength={100}
        className="ld-net-pulse"
        style={{ opacity: on, animationDelay: `${-i * 0.43}s` }}
      />
    </g>
  )
}

/** Nhãn app: chấm màu (đặc = đang dùng, rỗng = đang làm / sắp có) + tên mảng. */
function Node({
  app,
  i,
  progress,
  state,
  onHover,
}: {
  app: FoxApp
  i: number
  progress: MotionValue<number>
  state: '' | 'is-hot' | 'is-near' | 'is-far'
  onHover: (i: number | null) => void
}) {
  const { on } = useReveal(progress, i)
  const opacity = useTransform(on, [0, 1], [0.32, 1])
  const scale = useTransform(on, [0, 1], [0.9, 1])
  return (
    <m.span
      className={`ld-net-node ${state}${app.status === 'live' ? ' is-live' : ''}`}
      style={{ ...nodePct(i), scale, '--app-accent': app.accent } as MotionStyle}
      onPointerEnter={() => onHover(i)}
      onPointerLeave={() => onHover(null)}
    >
      {/* chỉ làm mờ phần chữ — nền nhãn luôn đặc để đường nối chạy bên dưới không xuyên qua chữ */}
      <m.span className="ld-net-node-in" style={{ opacity }}>
        <i className="ld-net-mark" aria-hidden />
        {app.area}
      </m.span>
    </m.span>
  )
}

export default function Connected() {
  const ref = useRef<HTMLElement>(null)
  const uid = useId().replace(/:/g, '')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  const [linked, setLinked] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // đổi chữ khi nhãn kế tiếp bắt đầu sáng (60% quãng của nó — khớp `on` trong useReveal), không sớm hơn
    setActive(stepOf((v - (0.6 * SPAN) / N) / SPAN, N))
    setLinked(v > SPAN + 0.05)
  })
  // rê chuột vào app nào thì phần chữ nói về app đó (kể cả khi đã tới đoạn kết)
  const focus = hover ?? (linked ? null : active)
  const app = APPS_SORTED[focus ?? active]
  const near = focus === null ? [] : neighbors(focus)
  const nodeState = (i: number) =>
    focus === i ? 'is-hot' : near.includes(i) ? 'is-near' : hover !== null ? 'is-far' : ''

  return (
    <section ref={ref} id={SECTION.connected} className="ld-connected" aria-labelledby="h-connected">
      <div className="ld-sticky">
        <div className="ld-wrap ld-connected-inner">
          <div className="ld-connected-text">
            <SectionHead
              id="h-connected"
              eyebrow="Hệ sinh thái"
              lines={[CONNECTED_INTRO.title]}
              lead={CONNECTED_INTRO.lead}
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
                      <b>{FINALE.title}</b>
                      <p className="ld-story">{FINALE.story}</p>
                      <ol className="ld-phases">
                        {FINALE.phases.map((p, i) => (
                          <li key={p} className={i === 0 ? 'is-now' : undefined}>
                            <span>Bước {i + 1}</span>
                            {p}
                            {i === 0 && <em className="ld-soon">Đang có</em>}
                          </li>
                        ))}
                      </ol>
                    </>
                  ) : (
                    <>
                      {/* tiêu đề chương: mốc thời gian trong câu chuyện + app của chương */}
                      <b style={{ '--app-accent': app.accent } as CSSProperties}>
                        <i className="ld-net-mark" aria-hidden />
                        <span className="ld-net-when">{APP_STORY[app.code]?.when}</span>
                        {app.name}
                      </b>
                      <p className="ld-story">{APP_STORY[app.code]?.moment}</p>
                      {near.length > 0 && (
                        <div className="ld-net-link">
                          <span className="ld-net-with">
                            {near.map((k) => (
                              <span
                                key={k}
                                className="ld-net-chip"
                                style={{ '--app-accent': APPS_SORTED[k].accent } as CSSProperties}
                              >
                                {APPS_SORTED[k].area}
                              </span>
                            ))}
                          </span>
                          <p>{APP_STORY[app.code]?.link}</p>
                        </div>
                      )}
                    </>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="ld-net-col">
            <div
              className={`ld-net${linked ? ' is-linked' : ''}${hover !== null ? ' is-hovering' : ''}`}
              style={{ '--core-accent': focus === null ? 'var(--primary)' : app.accent } as CSSProperties}
            >
              <svg className="ld-net-svg" viewBox="0 0 400 400" aria-hidden>
                <defs>
                  {LINKS.map(([i, j]) => {
                    const { p0, p2 } = linkPath(i, j)
                    return (
                      <linearGradient
                        key={`${i}-${j}`}
                        id={`${uid}-l${i}-${j}`}
                        gradientUnits="userSpaceOnUse"
                        x1={p0.x}
                        y1={p0.y}
                        x2={p2.x}
                        y2={p2.y}
                      >
                        <stop offset="0" stopColor={APPS_SORTED[i].accent} />
                        <stop offset="1" stopColor={APPS_SORTED[j].accent} />
                      </linearGradient>
                    )
                  })}
                </defs>
                {/* đường nối giữa các app (lộ trình) — nằm dưới nan */}
                {LINKS.map(([i, j], k) => {
                  const touches = focus !== null && (i === focus || j === focus)
                  // app đang được kể → hiện đường nối tới mọi app liên quan (kể cả app chưa sáng) — khớp chip bên chữ
                  const on = linked || touches
                  const cls = `ld-net-link-path${on ? ' is-on' : ''}${touches ? ' is-hot' : ''}${
                    linked && hover !== null && !touches ? ' is-dim' : ''
                  }`
                  return (
                    <path
                      key={`${i}-${j}`}
                      d={linkPath(i, j).d}
                      className={cls}
                      stroke={`url(#${uid}-l${i}-${j})`}
                      style={{ transitionDelay: linked && hover === null ? `${k * 0.08}s` : '0s' }}
                    />
                  )
                })}
                {APPS_SORTED.map((a, i) => (
                  <Spoke key={a.code} app={a} i={i} progress={scrollYProgress} hot={focus === i} />
                ))}
              </svg>
              {APPS_SORTED.map((a, i) => (
                <Node
                  key={a.code}
                  app={a}
                  i={i}
                  progress={scrollYProgress}
                  state={nodeState(i)}
                  onHover={setHover}
                />
              ))}
              <span className="ld-net-core">
                <Wordmark size={30} go />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
