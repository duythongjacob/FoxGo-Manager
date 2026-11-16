/**
 * Hình minh họa cho 4 bước "Ghi lại → Sắp xếp → Hành động → Nhìn lại" (mục Quy trình) — SỐ LIỆU MẪU.
 * Mỗi bước một trạng thái của cùng một việc "Gửi báo cáo", để người xem thấy việc đi qua hệ thống.
 * Kiểu: mocks.css (.mk-wf-*). Tài liệu: docs/features/gioi-thieu.md.
 */
import type { ComponentType } from 'react'
import { m } from 'motion/react'
import type { StepKey } from '../content'
import { EASE } from '../hooks'

const t = (delay = 0) => ({ duration: 0.6, ease: EASE, delay })

function Capture() {
  return (
    <div className="mk-wf mk-wf-capture">
      <div className="mk-input is-typing">
        <span className="mk-plus">+</span>
        <span>
          Gửi báo cáo thứ 6 9h !cao
          <i className="mk-caret" />
        </span>
        <kbd>Enter</kbd>
      </div>
      <small className="mk-muted">Hộp thư vào</small>
      {['Mua quà sinh nhật mẹ', 'Đọc chương 3 sách thiết kế', 'Gia hạn bảo hiểm xe'].map((x, i) => (
        <m.div
          key={x}
          className="mk-row"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={t(0.1 + i * 0.08)}
        >
          <span className="mk-check" />
          <span className="mk-row-title">{x}</span>
        </m.div>
      ))}
    </div>
  )
}

const BOARD = [
  { col: 'Hôm nay', items: ['Gửi báo cáo', 'Họp dự án'] },
  { col: 'Tuần này', items: ['Gia hạn bảo hiểm xe', 'Đọc chương 3'] },
  { col: 'Để sau', items: ['Mua quà sinh nhật mẹ'] },
]

function Organize() {
  return (
    <div className="mk-wf mk-wf-board">
      {BOARD.map((c, ci) => (
        <div key={c.col} className="mk-col">
          <small className="mk-muted">{c.col}</small>
          {c.items.map((x, i) => (
            <m.div
              key={x}
              className={`mk-ticket${ci === 0 && i === 0 ? ' is-hot' : ''}`}
              initial={{ opacity: 0, y: -24, rotate: ci === 0 && i === 0 ? -4 : 0 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={t(0.05 + ci * 0.1 + i * 0.08)}
            >
              {x}
            </m.div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Act() {
  return (
    <div className="mk-wf mk-wf-focus">
      <div className="mk-timer">
        <svg viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r="52" className="mk-ring-bg" />
          <m.circle
            cx="60"
            cy="60"
            r="52"
            className="mk-ring-fg"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: 0.62 }}
            transition={{ duration: 1.6, ease: EASE }}
          />
        </svg>
        <span>
          <strong>15:24</strong>
          <small className="mk-muted">Phiên tập trung</small>
        </span>
      </div>
      <div className="mk-focus-task">
        <small className="mk-muted">Đang làm</small>
        <b>Gửi báo cáo</b>
        <div className="mk-checklist">
          {['Tổng hợp số liệu', 'Viết nhận xét', 'Gửi cho quản lý'].map((x, i) => (
            <m.span
              key={x}
              className={i < 2 ? 'is-done' : undefined}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={t(0.2 + i * 0.1)}
            >
              <span className="mk-check" />
              {x}
            </m.span>
          ))}
        </div>
      </div>
    </div>
  )
}

const WEEK = [5, 3, 4, 6, 4, 1, 1]

function Review() {
  return (
    <div className="mk-wf mk-wf-review">
      <div className="mk-review-top">
        <div>
          <small className="mk-muted">Tuần 47</small>
          <strong>
            24<small>/28 việc xong</small>
          </strong>
        </div>
        <span className="mk-delta">+4 so với tuần trước</span>
      </div>
      <div className="mk-cols is-week">
        {WEEK.map((v, i) => (
          <span key={i}>
            <m.i
              style={{ height: `${(v / 6) * 100}%` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={t(0.1 + i * 0.06)}
            />
            <small>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}</small>
          </span>
        ))}
      </div>
      <m.div
        className="mk-fox-note"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.6)}
      >
        <img src="/fox/bieu-cam/fox-celebrate.svg" alt="" width={32} height={32} />
        Tuần này bạn giữ nhịp tốt — thứ Năm làm được nhiều nhất!
      </m.div>
    </div>
  )
}

const PANELS: Record<StepKey, ComponentType> = {
  capture: Capture,
  organize: Organize,
  act: Act,
  review: Review,
}

/** Hình của một bước. */
export default function WorkflowPanel({ step }: { step: StepKey }) {
  const Panel = PANELS[step]
  return <Panel />
}
