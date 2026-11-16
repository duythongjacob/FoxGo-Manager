/**
 * Thành phần chuyển động dùng chung của trang Giới thiệu (thư viện `motion`, anh duyệt 16/11/2026).
 * Tài liệu: docs/features/gioi-thieu.md → "Chuyển động". Mọi hiệu ứng chỉ dùng transform/opacity; người dùng chọn
 * "giảm chuyển động" → MotionConfig (LandingPage) bỏ phần dịch chuyển, các vòng lặp (useLoop) dừng hẳn.
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { animate, m, useInView, useReducedMotion, useSpring } from 'motion/react'
import { appByCode, EASE, VIEW } from './hooks'

/** Hiện dần + trượt lên một lần khi vào màn. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </m.div>
  )
}

/**
 * Tiêu đề hiện từng dòng: mỗi dòng trượt lên từ sau "mép che" (.ld-line có overflow: clip).
 * Khung dòng (đứng yên) mới là thứ theo dõi "vào màn" — dòng chữ lúc đầu nằm khuất dưới mép che nên
 * IntersectionObserver gắn vào chính nó sẽ không bao giờ báo đã thấy. Dòng chữ nhận lệnh qua variants.
 */
export function Lines({ lines, delay = 0 }: { lines: ReactNode[]; delay?: number }) {
  return (
    <>
      {lines.map((l, i) => (
        <m.span className="ld-line" key={i} initial="hidden" whileInView="shown" viewport={VIEW}>
          <m.span
            variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.1 }}
          >
            {l}
          </m.span>
        </m.span>
      ))}
    </>
  )
}

/** Đầu mục: dòng nhỏ + h2 hiện từng dòng + đoạn mô tả (một chuỗi, hoặc mảng = nhiều đoạn). */
export function SectionHead({
  id,
  eyebrow,
  lines,
  lead,
  center,
}: {
  id: string
  eyebrow: string
  lines: ReactNode[]
  lead?: string | string[]
  center?: boolean
}) {
  return (
    <div className={`ld-head${center ? ' is-center' : ''}`}>
      <Reveal y={12}>
        <span className="ld-eyebrow">{eyebrow}</span>
      </Reveal>
      <h2 id={id}>
        <Lines lines={lines} delay={0.05} />
      </h2>
      {lead && (
        <Reveal delay={0.2}>
          {(Array.isArray(lead) ? lead : [lead]).map((para) => (
            <p key={para} className="ld-lead">
              {para}
            </p>
          ))}
        </Reveal>
      )}
    </div>
  )
}

/**
 * Bọc nút: nút "hút" nhẹ theo con trỏ chuột (lò xo). Chỉ với chuột — cảm ứng và "giảm chuyển động" thì đứng yên.
 */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion()
  const spring = { stiffness: 260, damping: 18, mass: 0.4 }
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)
  return (
    <m.span
      className="ld-magnetic"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </m.span>
  )
}

/** Số đếm lên khi vào màn (ghi thẳng vào DOM — không render lại React mỗi khung hình). */
export function Counter({
  to,
  format = (n) => String(Math.round(n)),
  duration = 1.6,
}: {
  to: number
  format?: (n: number) => string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!inView || !el) return
    if (reduce) {
      el.textContent = format(to)
      return
    }
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (v) => (el.textContent = format(v)) })
    return () => c.stop()
    // format là hàm thuần truyền thẳng — không cần theo dõi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to, duration])
  return <span ref={ref}>{format(0)}</span>
}

/** Thẻ nhỏ: chấm màu app + tên app (chỉ chữ — anh chọn 16/11/2026, không linh vật, không nhãn trạng thái). */
export function AppChip({ code }: { code: string }) {
  const app = appByCode(code)
  if (!app) return null
  return (
    <span className="ld-chip" style={{ '--app-accent': app.accent } as CSSProperties}>
      <i className="ld-chip-dot" aria-hidden />
      {app.name}
    </span>
  )
}

/** Khung cửa sổ ứng dụng cho giao diện minh họa. */
export function MockWindow({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mk-window${className ? ` ${className}` : ''}`}>
      <div className="mk-bar">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}
