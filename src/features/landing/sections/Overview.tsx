/**
 * Mục 04 — "Nhìn thấy bức tranh lớn". Màn rộng: mục ghim (cao 280vh), cuộn tới đâu các mảnh dashboard bay từ chỗ rải
 * rác về đúng ô tới đó, đường biểu đồ tự vẽ. Màn hẹp / "giảm chuyển động": các mảnh hiện dần bình thường.
 * Ghi rõ: trang chủ tóm tắt số liệu từ các app là giai đoạn 2 của lộ trình (FD-008) — SỐ LIỆU MẪU.
 * Tài liệu: docs/features/gioi-thieu.md.
 */
import { useRef, type ReactNode } from 'react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { SECTION } from '../content'
import { EASE, useMedia, vnd, WIDE } from '../hooks'
import { Counter, Reveal, SectionHead } from '../kit'

/** Vị trí xuất phát (px, độ) của từng mảnh khi chưa lắp — rải quanh khung. */
const SCATTER = [
  { x: -160, y: 120, r: -6 },
  { x: 180, y: -90, r: 5 },
  { x: -120, y: 160, r: 4 },
  { x: 40, y: 200, r: -3 },
  { x: 200, y: 140, r: 6 },
  { x: 0, y: 240, r: 0 },
]

/** Một mảnh dashboard: lắp theo tiến độ cuộn (ghim) hoặc hiện dần (không ghim). */
function Piece({
  i,
  area,
  progress,
  pinned,
  children,
}: {
  i: number
  area: string
  progress: MotionValue<number>
  pinned: boolean
  children: ReactNode
}) {
  const s = i * 0.08
  const e = s + 0.38
  const o = SCATTER[i]
  const x = useTransform(progress, [s, e], [o.x, 0])
  const y = useTransform(progress, [s, e], [o.y, 0])
  const rotate = useTransform(progress, [s, e], [o.r, 0])
  const opacity = useTransform(progress, [s, s + 0.12], [0, 1])
  if (!pinned) {
    return (
      <Reveal className={`ld-piece a-${area}`} delay={(i % 3) * 0.08}>
        {children}
      </Reveal>
    )
  }
  return (
    <m.div className={`ld-piece a-${area}`} style={{ x, y, rotate, opacity }}>
      {children}
    </m.div>
  )
}

/** Đường biểu đồ tài chính 6 tháng (đường tiết kiệm lũy kế — mẫu). */
const CHART = 'M0 92 C 40 84, 60 70, 100 72 S 160 52, 200 50 S 270 30, 300 34 S 360 14, 400 10'

function FinanceChart({ draw }: { draw?: MotionValue<number> }) {
  return (
    <>
      <header>
        <b>Tiết kiệm lũy kế</b>
        <span className="mk-muted">6 tháng</span>
      </header>
      <strong className="mk-fin-big">
        <Counter to={21_600_000} format={vnd} />
        <small>đ</small>
      </strong>
      <svg className="ld-chart" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden>
        <path d={`${CHART} L400 100 L0 100 Z`} className="ld-chart-area" />
        {draw ? (
          <m.path d={CHART} className="ld-chart-line" style={{ pathLength: draw }} />
        ) : (
          <m.path
            d={CHART}
            className="ld-chart-line"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE }}
          />
        )}
      </svg>
      <span className="ld-chart-x">
        {['T6', 'T7', 'T8', 'T9', 'T10', 'T11'].map((x) => (
          <small key={x}>{x}</small>
        ))}
      </span>
    </>
  )
}

const GOALS = [
  { name: 'Quỹ dự phòng 6 tháng', v: 0.68 },
  { name: 'Tiếng Anh cấp 4', v: 0.45 },
  { name: 'Chạy 100 km/tháng', v: 0.82 },
]

export default function Overview() {
  const ref = useRef<HTMLElement>(null)
  const wide = useMedia(WIDE)
  const reduce = useReducedMotion()
  const pinned = wide && !reduce
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const draw = useTransform(scrollYProgress, [0.3, 0.8], [0, 1])

  return (
    <section
      ref={ref}
      id={SECTION.overview}
      className={`ld-overview${pinned ? ' is-pinned' : ''}`}
      aria-labelledby="h-overview"
    >
      <div className="ld-sticky">
        <div className="ld-wrap">
          <SectionHead
            id="h-overview"
            eyebrow="Tổng quan"
            lines={['Nhìn thấy bức tranh lớn.']}
            lead="Không chỉ từng việc riêng lẻ — thấy cả tiến trình cuộc sống của bạn trên một màn hình."
            center
          />
          <div className="ld-board">
            <Piece i={0} area="chart" progress={scrollYProgress} pinned={pinned}>
              <FinanceChart draw={pinned ? draw : undefined} />
            </Piece>
            <Piece i={1} area="goals" progress={scrollYProgress} pinned={pinned}>
              <header>
                <b>Tiến độ mục tiêu</b>
              </header>
              {GOALS.map((g) => (
                <div key={g.name} className="ld-goal">
                  <span>{g.name}</span>
                  <b>{Math.round(g.v * 100)}%</b>
                  <span className="mk-progress">
                    <i style={{ transform: `scaleX(${g.v})` }} />
                  </span>
                </div>
              ))}
            </Piece>
            <Piece i={2} area="today" progress={scrollYProgress} pinned={pinned}>
              <header>
                <b>Hôm nay</b>
                <span className="mk-muted">2/3</span>
              </header>
              <ul className="ld-mini-list">
                <li className="is-done">
                  <span className="mk-check" />
                  Gửi báo cáo tuần
                </li>
                <li className="is-done">
                  <span className="mk-check" />
                  Chốt ngân sách
                </li>
                <li>
                  <span className="mk-check" />
                  Chạy bộ 30 phút
                </li>
              </ul>
            </Piece>
            <Piece i={3} area="habits" progress={scrollYProgress} pinned={pinned}>
              <header>
                <b>Thói quen</b>
                <span className="mk-muted">Tuần này</span>
              </header>
              {[
                ['Ngủ đủ giấc', [1, 1, 0, 1, 1, 1, 1]],
                ['Đọc 20 trang', [1, 0, 1, 1, 0, 1, 0]],
                ['Uống đủ nước', [1, 1, 1, 1, 1, 0, 1]],
              ].map(([name, days]) => (
                <div key={name as string} className="mk-habit-row">
                  <span>{name as string}</span>
                  <span className="mk-dots">
                    {(days as number[]).map((d, i) => (
                      <i key={i} className={d ? 'is-on' : undefined} />
                    ))}
                  </span>
                </div>
              ))}
            </Piece>
            <Piece i={4} area="agenda" progress={scrollYProgress} pinned={pinned}>
              <header>
                <b>Lịch sắp tới</b>
              </header>
              <ul className="ld-agenda">
                <li>
                  <time>14:00</time>Họp dự án
                </li>
                <li>
                  <time>18:00</time>Lớp tiếng Anh
                </li>
                <li>
                  <time>T7</time>Khám định kỳ
                </li>
              </ul>
            </Piece>
            <Piece i={5} area="stats" progress={scrollYProgress} pinned={pinned}>
              <div className="ld-stat">
                <strong>
                  <Counter to={24} />
                </strong>
                <span>việc xong tuần này</span>
              </div>
              <div className="ld-stat">
                <strong>
                  <Counter to={21} />
                </strong>
                <span>ngày giữ thói quen</span>
              </div>
              <div className="ld-stat">
                <strong>
                  <Counter to={18} />%
                </strong>
                <span>thu nhập để dành</span>
              </div>
            </Piece>
          </div>
          <p className="ld-note">
            Minh họa, số liệu mẫu. Trang chủ tóm tắt số liệu từ các app là <b>giai đoạn 2</b> của lộ trình.
          </p>
        </div>
      </div>
    </section>
  )
}
