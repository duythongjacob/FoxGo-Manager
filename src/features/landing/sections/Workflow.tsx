/**
 * Mục 05 — "Bớt rối. Thêm rõ.": 4 bước dạng tab (bấm hoặc phím ←/→). Khi trong màn, tự chuyển bước mỗi 5 giây,
 * vạch dưới tab chạy theo thời gian; rê chuột / tập trung bàn phím vào khối thì dừng. "Giảm chuyển động" → không tự chuyển.
 * Hình mỗi bước: mocks/WorkflowPanel.tsx. Tài liệu: docs/features/gioi-thieu.md.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react'
import { SECTION, STEPS } from '../content'
import { EASE } from '../hooks'
import { Reveal, SectionHead } from '../kit'
import WorkflowPanel from '../mocks/WorkflowPanel'

/** Thời gian mỗi bước khi tự chuyển (ms). */
const STEP_MS = 5000

export default function Workflow() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const inView = useInView(box, { margin: '-20% 0px' })
  const reduce = useReducedMotion()
  const auto = inView && !paused && !reduce

  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS)
    return () => clearTimeout(t)
  }, [auto, active])

  /** Phím mũi tên chuyển tab (mẫu tablist của WAI-ARIA). */
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (active + d + STEPS.length) % STEPS.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  const step = STEPS[active]
  return (
    <section id={SECTION.workflow} className="ld-section ld-workflow" aria-labelledby="h-workflow">
      <div className="ld-wrap">
        <SectionHead
          id="h-workflow"
          eyebrow="Quy trình"
          lines={['Bớt rối.', <span className="ld-accent">Thêm rõ.</span>]}
          lead="Bốn bước đơn giản, lặp lại mỗi ngày — việc nào cũng có chỗ, ngày nào cũng biết bắt đầu từ đâu."
        />
        <Reveal>
          <div
            ref={box}
            className="ld-wf"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="ld-wf-tabs" role="tablist" aria-label="Các bước" onKeyDown={onKey}>
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`wf-tab-${s.key}`}
                  aria-selected={i === active}
                  aria-controls="wf-panel"
                  tabIndex={i === active ? 0 : -1}
                  className={`ld-wf-tab${i === active ? ' is-on' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <span className="ld-wf-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ld-wf-title">{s.title}</span>
                  <span className="ld-wf-desc">{s.desc}</span>
                  <span className="ld-wf-timer" aria-hidden>
                    {i === active && (
                      <m.i
                        key={`${active}-${auto}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: auto ? 1 : 0 }}
                        transition={{ duration: auto ? STEP_MS / 1000 : 0.2, ease: 'linear' }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="ld-wf-panel" role="tabpanel" id="wf-panel" aria-labelledby={`wf-tab-${step.key}`}>
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={step.key}
                  initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <WorkflowPanel step={step.key} />
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
