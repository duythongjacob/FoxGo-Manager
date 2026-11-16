/**
 * Trang Giới thiệu (#/gioi-thieu) — xem docs/features/gioi-thieu.md. Nạp lười (React.lazy trong Root) để thư viện
 * `motion` không làm nặng trang chủ. Mỗi mục một file trong sections/, giao diện minh họa trong mocks/,
 * nội dung chữ trong content.ts, CSS: landing.css (.ld-) + mocks.css (.mk-).
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { domAnimation, LazyMotion, m, MotionConfig, useScroll, useSpring } from 'motion/react'
import Preloader from '@/components/Preloader'
import { parseRoute } from '@/lib/route'
import { usePreload } from './hooks'
import Connected from './sections/Connected'
import Experience from './sections/Experience'
import Features from './sections/Features'
import FinalCta from './sections/FinalCta'
import Footer from './sections/Footer'
import Hero from './sections/Hero'
import Overview from './sections/Overview'
import Workflow from './sections/Workflow'
import './landing.css'
import './mocks.css'

/**
 * Vạch tiến độ cuộn mảnh trên cùng. Portal vào <body>: <main> có hiệu ứng vào trang bằng transform, khung cha có
 * transform làm `position: fixed` bám theo khung cha thay vì màn hình.
 */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })
  return createPortal(<m.div className="ld-progress" style={{ scaleX }} aria-hidden />, document.body)
}

/** Trang Giới thiệu FoxGo. */
export default function LandingPage() {
  // Màn chờ: tải xong font + ảnh mới dựng các mục — để hiệu ứng vào trang của Hero (chạy khi dựng) và các hiệu ứng
  // "hiện khi vào màn" không chạy mất phía sau màn chờ, và chữ không nhảy font giữa chừng.
  const { progress, ready } = usePreload()

  // Vào thẳng `#/gioi-thieu/<mục>`: trang nạp lười nên useRoute có thể đã chạy trước khi mục tồn tại → tự nhảy tới
  // mục khi vừa dựng xong. Bố cục còn giãn trong ~1 giây đầu (font, ảnh, khối ghim đo lại) nên nhảy lại vài lần;
  // nhảy thẳng (instant) chứ không cuộn mượt, để không bị bố cục đổi giữa chừng làm dừng sớm.
  useEffect(() => {
    const { anchor } = parseRoute(window.location.hash)
    if (!ready || !anchor) return
    const jump = () =>
      document.getElementById(anchor)?.scrollIntoView({ block: 'start', behavior: 'instant' })
    const timers = [0, 300, 900].map((ms) => setTimeout(jump, ms))
    // người dùng tự cuộn trong lúc chờ → thôi, không kéo họ ngược lại
    const stop = () => timers.forEach(clearTimeout)
    const opts = { once: true, passive: true }
    window.addEventListener('wheel', stop, opts)
    window.addEventListener('touchstart', stop, opts)
    window.addEventListener('keydown', stop, { once: true })
    return () => {
      stop()
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [ready])

  return (
    // LazyMotion + m.*: chỉ nạp gói tính năng hoạt ảnh DOM (~nhẹ hơn `motion.*` đầy đủ);
    // reducedMotion="user": người dùng chọn "giảm chuyển động" → bỏ dịch chuyển, chỉ giữ mờ/hiện.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <Preloader progress={progress} done={ready} />
        {ready && (
          <div className="ld-root">
            <ScrollProgress />
            <Hero />
            <Connected />
            <Features />
            <Overview />
            <Workflow />
            <Experience />
            <FinalCta />
            <Footer />
          </div>
        )}
      </MotionConfig>
    </LazyMotion>
  )
}
