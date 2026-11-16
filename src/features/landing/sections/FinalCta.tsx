/**
 * Mục 07 — Kêu gọi cuối. Hai phần:
 *  1. "Vì sao có Fox": đoạn mở + câu chốt chữ lớn bên trái, hình line "rối → thẳng hàng" bên phải (SortLines).
 *  2. Tiêu đề "Làm chủ cuộc sống của bạn." + khẩu hiệu "Fox — …" tự đổi mỗi 3,2 giây (chỉ khi trong màn, dừng khi
 *     giảm chuyển động), nút về trang chủ, sơ đồ chấm nối 4 lợi ích vào nút (BenefitTree).
 * Nội dung: MANIFESTO, TAGLINES, BENEFITS trong content.ts. Tài liệu: docs/features/gioi-thieu.md.
 */
import { AnimatePresence, m } from 'motion/react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { href } from '@/lib/route'
import { MANIFESTO, TAGLINES } from '../content'
import { EASE, useLoop } from '../hooks'
import { Lines, Magnetic, Reveal } from '../kit'
import BenefitTree from './BenefitTree'
import SortLines from './SortLines'

/** "Fox — <khẩu hiệu>": khẩu hiệu trượt lên thay nhau. Đọc màn hình chỉ đọc câu hiện tại một lần (không aria-live). */
function Tagline() {
  const { ref, tick } = useLoop<HTMLParagraphElement>(3200)
  const text = TAGLINES[tick % TAGLINES.length]
  return (
    <p className="ld-tagline" ref={ref}>
      <span className="ld-tagline-slot">
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={text}
            initial={{ opacity: 0, y: '60%', filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: '-60%', filter: 'blur(4px)' }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <b className="ld-tagline-brand">Fox</b>
            <i className="ld-tagline-dash" aria-hidden />
            {text}
          </m.span>
        </AnimatePresence>
      </span>
    </p>
  )
}

export default function FinalCta() {
  return (
    <section className="ld-section ld-final" aria-labelledby="h-final">
      <div className="ld-wrap">
        <div className="ld-manifesto">
          <div className="ld-manifesto-head">
            <Reveal y={12}>
              <span className="ld-eyebrow">Vì sao có Fox</span>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="ld-manifesto-intro">{MANIFESTO.intro}</p>
            </Reveal>
            <h3 className="ld-manifesto-key">
              <Lines lines={MANIFESTO.key} delay={0.1} />
            </h3>
          </div>
          <SortLines />
        </div>

        <div className="ld-final-inner">
          <h2 id="h-final">
            <Lines lines={['Chưa làm ', <span className="ld-accent"> hãy làm việc nhỏ nhất.</span>]} />
          </h2>
          <Reveal delay={0.2}>
            <Tagline />
          </Reveal>
          <Reveal delay={0.3}>
            <Magnetic strength={0.4}>
              <a className="ld-btn primary is-lg" href={href('home')}>
                Bắt đầu với FoxGo <ArrowRightOutlined />
              </a>
            </Magnetic>
          </Reveal>
          <BenefitTree />
        </div>
      </div>
    </section>
  )
}
