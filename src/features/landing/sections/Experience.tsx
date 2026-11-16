/**
 * Mục 06 — "Thiết kế quanh cuộc sống của bạn": ba dòng chữ lớn trôi ngang ngược chiều nhau theo cuộn trang, phía sau
 * là các đường line uốn lượn tự vẽ ra + xung sáng chạy dọc đường (thay cho khung thiết bị — anh chọn 16/11/2026),
 * dưới cùng 5 cam kết trải nghiệm. Tài liệu: docs/features/gioi-thieu.md.
 */
import { Fragment, useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { APPS } from '@/data/apps'
import { sortApps } from '@/lib/apps'
import { PROMISES, SECTION } from '../content'
import { Reveal, SectionHead } from '../kit'

/** Ba dòng chữ: mảng cuộc sống (tên app), màn hình dùng được, nguyên tắc sản phẩm. */
const ROWS: { words: string[]; outline?: boolean }[] = [
  { words: sortApps(APPS).map((a) => a.area) },
  { words: ['Máy tính', 'Máy tính bảng', 'Điện thoại', 'Sáng', 'Tối'], outline: true },
  { words: ['Đơn giản', 'Riêng tư', 'Có nguồn', 'Đồng hành'] },
]

/**
 * Đường line nền (hệ tọa độ 1200×420, kéo giãn theo khung — `vector-effect` giữ nét mảnh đều).
 * Uốn qua lại giữa các dòng chữ, lệch pha nhau để không chạy song song.
 */
const WAVES = [
  'M-20 120 C 180 20, 380 220, 600 110 S 1000 10, 1220 140',
  'M-20 230 C 220 330, 420 120, 640 220 S 1020 330, 1220 200',
  'M-20 330 C 160 250, 420 420, 700 320 S 1040 240, 1220 360',
  'M-20 60 C 300 160, 520 -20, 800 80 S 1100 200, 1220 40',
]

/** Một dòng chữ trôi ngang: lặp nội dung 2 lần để luôn kín bề ngang khi dịch chuyển. */
function Row({ words, outline, x }: { words: string[]; outline?: boolean; x: MotionValue<string> }) {
  const items = [...words, ...words]
  return (
    <m.div className={`ld-flow-row${outline ? ' is-outline' : ''}`} style={{ x }}>
      {items.map((w, i) => (
        <Fragment key={i}>
          <span>{w}</span>
          <i className="ld-flow-dot" />
        </Fragment>
      ))}
    </m.div>
  )
}

/** Đường line tự vẽ theo cuộn + xung sáng chạy dọc (CSS .ld-flow-pulse) khi đã vẽ. */
function Wave({ d, i, draw }: { d: string; i: number; draw: MotionValue<number> }) {
  return (
    <>
      <m.path d={d} className="ld-flow-line" vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
      <path
        d={d}
        pathLength={100}
        className="ld-flow-pulse"
        vectorEffect="non-scaling-stroke"
        style={{ animationDelay: `${-i * 1.7}s` }}
      />
    </>
  )
}

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // giảm chuyển động → chữ đứng yên, đường line hiện sẵn
  const k = reduce ? 0 : 1
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', `${-22 * k}%`])
  const x2 = useTransform(scrollYProgress, [0, 1], [`${-22 * k}%`, '0%'])
  const x3 = useTransform(scrollYProgress, [0, 1], [`${-4 * k}%`, `${-26 * k}%`])
  const draw = useTransform(scrollYProgress, [0.08, 0.5], [reduce ? 1 : 0, 1])
  const xs = [x1, x2, x3]

  return (
    <section id={SECTION.experience} className="ld-section ld-experience" aria-labelledby="h-experience">
      <div className="ld-wrap">
        <SectionHead
          id="h-experience"
          eyebrow="Về FoxGo"
          lines={['Thiết kế quanh', 'cuộc sống của bạn.']}
          lead="Một gia đình app cùng màu sắc, cùng font chữ — mở app nào cũng thấy quen, trên màn hình nào cũng dễ dùng."
          center
        />
      </div>

      <div className="ld-flow" ref={ref} aria-hidden>
        <svg className="ld-flow-svg" viewBox="0 0 1200 420" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ld-flow-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0" />
              <stop offset="0.35" stopColor="var(--primary)" />
              <stop offset="0.7" stopColor="var(--fox)" />
              <stop offset="1" stopColor="var(--fox)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {WAVES.map((d, i) => (
            <Wave key={i} d={d} i={i} draw={draw} />
          ))}
        </svg>
        {ROWS.map((r, i) => (
          <Row key={i} words={r.words} outline={r.outline} x={xs[i]} />
        ))}
      </div>

      <div className="ld-wrap">
        <ol className="ld-promises">
          {PROMISES.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.06} y={20}>
                <span className="ld-promise-no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
