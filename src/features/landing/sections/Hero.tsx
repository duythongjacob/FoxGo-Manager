/**
 * Mục 01 — Hero trang Giới thiệu. Vào trang: dòng nhỏ → tiêu đề từng dòng → mô tả → nút → dashboard phóng nhẹ + hiện dần.
 * Cuộn: dashboard từ nghiêng 3D về phẳng, chữ lùi lên mờ dần, các mô-đun nổi trôi theo độ sâu khác nhau (parallax).
 * Tài liệu: docs/features/gioi-thieu.md.
 */
import { useRef, type ReactNode } from 'react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { href } from '@/lib/route'
import { SECTION } from '../content'
import { EASE } from '../hooks'
import { Lines, Magnetic } from '../kit'
import DashboardMock from '../mocks/Dashboard'

/** Mô-đun nổi quanh dashboard: trôi lên xuống chậm + parallax theo `depth` (px dịch khi cuộn hết hero). */
function Floater({
  className,
  depth,
  delay,
  progress,
  children,
}: {
  className: string
  depth: number
  delay: number
  progress: MotionValue<number>
  children: ReactNode
}) {
  const y = useTransform(progress, [0, 1], [0, -depth])
  return (
    <m.div className={`ld-float ${className}`} style={{ y }} aria-hidden>
      <m.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.8, delay },
          scale: { duration: 0.8, ease: EASE, delay },
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.8 },
        }}
      >
        {children}
      </m.div>
    </m.div>
  )
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const tilt = useTransform(scrollYProgress, [0, 0.45], [reduce ? 0 : 16, 0])
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.94, 1])
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60])
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  return (
    <section ref={ref} className="ld-hero" aria-labelledby="h-hero">
      <div className="ld-hero-glow" aria-hidden />
      <m.div className="ld-wrap ld-hero-text" style={reduce ? undefined : { y: textY, opacity: textOpacity }}>
        <m.span
          className="ld-pill"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <i className="ld-pill-dot" aria-hidden />
          Làm chủ cuộc sống, chủ động tương lai
        </m.span>
        <h1 id="h-hero">
          <Lines
            lines={['Cuộc sống của bạn.', <span className="ld-accent">Gọn trong một nơi.</span>]}
            delay={0.1}
          />
        </h1>
        <m.p
          className="ld-hero-lead"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
        >
          Sắp xếp việc cần làm, quản lý thu chi, xây thói quen tốt và tập trung vào điều thật sự quan trọng —
          mỗi mảng một app Fox, gom về một trang chủ.
        </m.p>
        <m.div
          className="ld-cta"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
        >
          <Magnetic>
            <a className="ld-btn primary" href={href('home')}>
              Bắt đầu hành trình <ArrowRightOutlined />
            </a>
          </Magnetic>
          <a className="ld-btn ghost" href={href('about', SECTION.connected)}>
            Khám phá FoxGo
          </a>
        </m.div>
      </m.div>

      <div className="ld-wrap ld-stage">
        <m.div
          className="ld-stage-inner"
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.6 }}
        >
          <m.div className="ld-stage-tilt" style={{ rotateX: tilt, scale }}>
            <DashboardMock />
          </m.div>
          <Floater className="f-goal" depth={140} delay={1.3} progress={scrollYProgress}>
            <span className="ld-float-label">Mục tiêu tiết kiệm</span>
            <strong>72%</strong>
            <span className="ld-float-bar">
              <i style={{ width: '72%' }} />
            </span>
          </Floater>
          <Floater className="f-habit" depth={220} delay={1.5} progress={scrollYProgress}>
            <img src="/fox/fox-suckhoe.svg" alt="" width={28} height={28} />
            <span>
              <strong>21 ngày</strong>
              <span className="ld-float-label">Chuỗi ngủ đủ giấc</span>
            </span>
          </Floater>
          <Floater className="f-task" depth={90} delay={1.7} progress={scrollYProgress}>
            <span className="ld-float-check" />
            <span>
              <strong>Gửi báo cáo</strong>
              <span className="ld-float-label">Thứ 6 · 09:00</span>
            </span>
          </Floater>
        </m.div>
        <p className="ld-note">Giao diện minh họa · số liệu mẫu</p>
      </div>
    </section>
  )
}
