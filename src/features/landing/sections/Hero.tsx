/**
 * Mục 01 — Hero trang Giới thiệu. Vào trang: dòng nhỏ → tiêu đề từng dòng → mô tả → nút → dashboard phóng nhẹ + hiện dần.
 * Cuộn: dashboard từ nghiêng 3D về phẳng, chữ lùi lên mờ dần, các mô-đun nổi trôi theo độ sâu khác nhau (parallax).
 * Tài liệu: docs/features/gioi-thieu.md.
 */
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { APPS } from '@/data/apps'
import { sortApps } from '@/lib/apps'
import { href } from '@/lib/route'
import { SECTION } from '../content'
import { EASE, useMedia } from '../hooks'
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

/** App theo thứ tự trạng thái (đang chạy → đang xây → kế hoạch) — cùng thứ tự với sơ đồ mục Hệ sinh thái. */
const RAIL_APPS = sortApps(APPS)
/** Khung vẽ của sơ đồ nhánh (đơn vị SVG): rộng 960, mỗi app một cột 160, gốc nhánh ở giữa mép trên. */
const RAIL_W = 960
const RAIL_H = 96
const railX = (i: number) => (RAIL_W / RAIL_APPS.length) * (i + 0.5)

/**
 * Sơ đồ nhánh dưới nút: một gốc → đường cong tỏa xuống từng lĩnh vực app (chỉ chữ + chấm màu, không hình cáo —
 * quyết định 16/11/2026). Nét liền + xung sáng chạy = app đã có (đang chạy/đang xây); nét đứt = kế hoạch —
 * cùng quy ước "nét đứt = sắp tới" với mục Hệ sinh thái, để không trình bày app chưa có như đã có.
 */
function HeroRail() {
  return (
    <m.div
      className="ld-rail"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
    >
      <svg className="ld-rail-lines" viewBox={`0 -6 ${RAIL_W} ${RAIL_H + 6}`} aria-hidden>
        {RAIL_APPS.map((a, i) => {
          const x = railX(i)
          // cong chữ S: rời gốc thẳng xuống rồi mới tỏa ngang, chạm cột app theo phương thẳng đứng
          const d = `M${RAIL_W / 2} 0 C${RAIL_W / 2} ${RAIL_H * 0.62} ${x} ${RAIL_H * 0.38} ${x} ${RAIL_H}`
          const planned = a.status === 'planned'
          return (
            <g key={a.code} style={{ '--app-accent': a.accent } as CSSProperties}>
              {planned ? (
                <m.path
                  d={d}
                  className="ld-rail-path is-planned"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 + i * 0.08 }}
                />
              ) : (
                <>
                  <m.path
                    d={d}
                    className="ld-rail-path"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.9 + i * 0.08 }}
                  />
                  <path
                    d={d}
                    pathLength={1}
                    className="ld-rail-pulse"
                    style={{ animationDelay: `${2 + i * 0.6}s` }}
                  />
                </>
              )}
            </g>
          )
        })}
        <circle className="ld-rail-hub" cx={RAIL_W / 2} cy={0} r={4.5} />
      </svg>
      <ul className="ld-rail-nodes" aria-label="Các lĩnh vực trong hệ sinh thái FoxGo">
        {RAIL_APPS.map((a) => (
          <li
            key={a.code}
            className={`ld-rail-node is-${a.status}`}
            style={{ '--app-accent': a.accent } as CSSProperties}
          >
            <span className="ld-rail-area">
              <i aria-hidden />
              {a.area}
            </span>
          </li>
        ))}
      </ul>
    </m.div>
  )
}

/** Bảng màu dấu chấm tiêu đề: cam Fox + màu nhấn từng app; luôn đủ 7 màu (--c0…--c6) cho keyframes ld-hdot-cycle. */
const DOT_COLORS = ['#f97316', ...RAIL_APPS.map((a) => a.accent)]
const DOT_VARS = Object.fromEntries(
  Array.from({ length: 7 }, (_, i) => [`--c${i}`, DOT_COLORS[i % DOT_COLORS.length]]),
) as CSSProperties

/**
 * Dấu chấm cuối dòng tiêu đề — chuyển màu chậm qua cam Fox và màu các app, có quầng mờ cùng màu ("connect the dots").
 * `lag` (giây) lệch nhịp để hai chấm không cùng màu một lúc. Giảm chuyển động → đứng yên màu cam (CSS).
 */
function HeroDot({ lag = 0 }: { lag?: number }) {
  return (
    <span className="ld-hdot" style={{ ...DOT_VARS, animationDelay: `${-lag}s` }} aria-hidden>
      .
    </span>
  )
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  // điện thoại: 3 mô-đun nổi vốn bị CSS ẩn nhưng vòng lặp trôi (JS) vẫn chạy mỗi khung hình → không dựng hẳn;
  // bỏ nghiêng 3D (perspective + rotateX trên khối lớn nặng với GPU điện thoại, màn hẹp cũng khó thấy)
  const roomy = useMedia('(min-width: 761px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const tilt = useTransform(scrollYProgress, [0, 0.45], [reduce || !roomy ? 0 : 16, 0])
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.94, 1])
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60])
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  return (
    <section ref={ref} className="ld-hero" aria-labelledby="h-hero">
      <div className="ld-hero-glow" aria-hidden />
      {/* vòng đồng tâm mảnh sau tiêu đề — "hình" bằng nét, không dùng ảnh. Không đặt chấm trôi: chấm đi qua chữ trông như dấu tiếng Việt bị lạc */}
      <svg className="ld-hero-orbits" viewBox="-500 -500 1000 1000" aria-hidden>
        <circle r={250} />
        <circle r={360} />
        <circle r={480} className="is-dashed" />
      </svg>
      <m.div className="ld-wrap ld-hero-text" style={reduce ? undefined : { y: textY, opacity: textOpacity }}>
        {/* khung kẻ kiểu bản vẽ: 2 đường dọc mép nội dung + 2 đường ngang ôm tiêu đề, dấu + ở chỗ giao */}
        <div className="ld-hero-rails" aria-hidden />
        <m.span
          className="ld-pill"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <i className="ld-pill-dot" aria-hidden />
          Làm chủ cuộc sống, chủ động tương lai
        </m.span>
        <div className="ld-hero-title">
          <i className="ld-tick tl" aria-hidden />
          <i className="ld-tick tr" aria-hidden />
          <i className="ld-tick bl" aria-hidden />
          <i className="ld-tick br" aria-hidden />
          <h1 id="h-hero">
            <Lines
              lines={[
                <>
                  Một nền tảng
                  <HeroDot />
                </>,
                <span className="ld-accent">
                  {/* nháy cong đủ cặp, nháy đóng sau dấu chấm màu (anh chọn 17/11/2026) */}
                  “Connect the dots
                  <HeroDot lag={7} />”
                </span>,
              ]}
              delay={0.1}
            />
          </h1>
        </div>
        <m.p
          className="ld-hero-lead"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
        >
          FoxGo là hệ sinh thái ứng dụng cá nhân cho công việc, tài chính, sức khỏe và học tập. Mỗi ứng dụng
          chuyên sâu cho một lĩnh vực, cùng hướng tới một cuộc sống cân bằng và chủ động.
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
        <HeroRail />
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
          {roomy && (
            <>
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
            </>
          )}
        </m.div>
        <p className="ld-note">Giao diện minh họa · số liệu mẫu</p>
      </div>
    </section>
  )
}
