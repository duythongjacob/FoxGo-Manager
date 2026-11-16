/**
 * Giao diện minh họa cho 6 tính năng trên trang Giới thiệu — mỗi cái một ý tưởng hình riêng, SỐ LIỆU MẪU.
 * Vòng lặp chỉ chạy khi trong màn (useLoop); "giảm chuyển động" → hiện trạng thái cuối, đứng yên.
 * Kiểu: mocks.css. Tài liệu: docs/features/gioi-thieu.md.
 */
import type { ComponentType } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { FeatureMockId } from '../content'
import { Counter } from '../kit'
import { EASE, useLoop, vnd } from '../hooks'

const once = { once: true, margin: '0px 0px -10% 0px' } as const

/* ---------- 01 Công việc: gõ một câu → thành việc có hạn + ưu tiên ---------- */
const SENTENCE = 'Gửi báo cáo thứ 6 9h !cao'

function TaskMock() {
  const { ref, tick, live } = useLoop(85)
  const cycle = SENTENCE.length + 40 // gõ xong, dừng ~3 giây cho người xem đọc kết quả
  const t = live ? tick % cycle : cycle - 1
  const typed = SENTENCE.slice(0, Math.min(t, SENTENCE.length))
  const parsed = t > SENTENCE.length + 5
  return (
    <div className="mk-panel mk-task" ref={ref}>
      <div className={`mk-input${parsed ? '' : ' is-typing'}`}>
        <span className="mk-plus">+</span>
        <span>
          {typed}
          <i className="mk-caret" />
        </span>
      </div>
      <div className="mk-list">
        <AnimatePresence>
          {parsed && (
            <m.div
              className="mk-row is-new"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="mk-check" />
              <span className="mk-row-title">Gửi báo cáo</span>
              <em className="mk-tag">Thứ 6 · 09:00</em>
              <em className="mk-tag is-hot">Ưu tiên cao</em>
            </m.div>
          )}
        </AnimatePresence>
        <div className="mk-row is-done">
          <span className="mk-check" />
          <span className="mk-row-title">Duyệt thiết kế trang chủ</span>
          <em className="mk-tag">Hôm nay</em>
        </div>
        <div className="mk-row">
          <span className="mk-check" />
          <span className="mk-row-title">Chuẩn bị họp dự án</span>
          <em className="mk-tag">14:00</em>
        </div>
      </div>
      <div className="mk-foot">
        <span>Dự án Website</span>
        <span className="mk-progress">
          <m.i
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 0.64 }}
            viewport={once}
            transition={{ duration: 1.2, ease: EASE }}
          />
        </span>
        <b>64%</b>
      </div>
    </div>
  )
}

/* ---------- 02 Tài chính: biểu đồ 6 tháng + ngân sách + giao dịch mới ---------- */
const MONTHS = [
  { m: 'T6', v: 62 },
  { m: 'T7', v: 78 },
  { m: 'T8', v: 55 },
  { m: 'T9', v: 70 },
  { m: 'T10', v: 48 },
  { m: 'T11', v: 58 },
]
const BUDGETS = [
  { name: 'Ăn uống', used: 0.62 },
  { name: 'Đi lại', used: 0.4 },
  { name: 'Giải trí', used: 0.86 },
]
const TXNS = [
  { label: 'Cà phê', cat: 'Ăn uống', amount: -35_000 },
  { label: 'Lương tháng 11', cat: 'Thu nhập', amount: 18_500_000 },
  { label: 'Tiền điện', cat: 'Hóa đơn', amount: -420_000 },
]

function FinanceMock() {
  const { ref, tick, live } = useLoop(2800)
  const first = live ? tick % TXNS.length : 0
  const rows = [0, 1].map((k) => TXNS[(first + k) % TXNS.length])
  return (
    <div className="mk-panel mk-fin" ref={ref}>
      <div className="mk-fin-top">
        <div>
          <small className="mk-muted">Tiết kiệm tháng này</small>
          <strong className="mk-fin-big">
            <Counter to={3_240_000} format={(n) => vnd(n)} />
            <small>đ</small>
          </strong>
        </div>
        <span className="mk-delta">+12% so với T10</span>
      </div>
      <div className="mk-cols">
        {MONTHS.map((x, i) => (
          <span key={x.m} className={i === MONTHS.length - 1 ? 'is-now' : undefined}>
            <m.i
              style={{ height: `${x.v}%` }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={once}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.07 }}
            />
            <small>{x.m}</small>
          </span>
        ))}
      </div>
      <div className="mk-budgets">
        {BUDGETS.map((b, i) => (
          <div key={b.name} className={b.used > 0.8 ? 'is-warn' : undefined}>
            <span>{b.name}</span>
            <span className="mk-progress">
              <m.i
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: b.used }}
                viewport={once}
                transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.1 }}
              />
            </span>
            <b>{Math.round(b.used * 100)}%</b>
          </div>
        ))}
      </div>
      <div className="mk-txns">
        <AnimatePresence mode="popLayout" initial={false}>
          {rows.map((r) => (
            <m.div
              key={`${r.label}-${tick}`}
              className="mk-txn"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <span>
                <b>{r.label}</b>
                <small>{r.cat}</small>
              </span>
              <strong className={r.amount > 0 ? 'is-in' : undefined}>
                {r.amount > 0 ? '+' : '−'}
                {vnd(Math.abs(r.amount))}đ
              </strong>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- 03 Mục tiêu: cây kỹ năng + thử thách 30 ngày ---------- */
const SKILLS = [
  { name: 'Tiếng Anh giao tiếp', level: 3 },
  { name: 'Thuyết trình', level: 2 },
  { name: 'Viết code TypeScript', level: 4 },
]

function GoalMock() {
  return (
    <div className="mk-panel mk-goals">
      <div className="mk-skills">
        {SKILLS.map((s, si) => (
          <div key={s.name} className="mk-skill">
            <span>{s.name}</span>
            <span className="mk-levels" aria-hidden>
              {[0, 1, 2, 3, 4].map((l) => (
                <m.i
                  key={l}
                  className={l < s.level ? 'is-on' : undefined}
                  initial={{ scaleX: 0.2, opacity: 0.3 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={once}
                  transition={{ duration: 0.5, ease: EASE, delay: si * 0.15 + l * 0.08 }}
                />
              ))}
            </span>
            <b>Cấp {s.level}</b>
          </div>
        ))}
      </div>
      <div className="mk-challenge">
        <div>
          <small className="mk-muted">Thử thách 30 ngày</small>
          <strong>
            <Counter to={18} /> <small>/ 30 ngày</small>
          </strong>
        </div>
        <span className="mk-days" aria-hidden>
          {Array.from({ length: 30 }, (_, i) => (
            <m.i
              key={i}
              className={i < 18 ? 'is-on' : undefined}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={once}
              transition={{ duration: 0.35, ease: EASE, delay: 0.4 + i * 0.025 }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

/* ---------- 04 Thói quen: lịch nhiệt 12 tuần + chuỗi ngày ---------- */
/** Độ đậm ô (0–4) giả lập — công thức cố định để mỗi lần vẽ giống nhau. */
const heat = (i: number) => (i % 7 === 6 && i % 3 ? 0 : (i * 37 + 11) % 5)

function HabitMock() {
  return (
    <div className="mk-panel mk-habit">
      <div className="mk-stats">
        <div>
          <small className="mk-muted">Chuỗi hiện tại</small>
          <strong>
            <Counter to={21} /> <small>ngày</small>
          </strong>
        </div>
        <div>
          <small className="mk-muted">Ngủ TB</small>
          <strong>7h20</strong>
        </div>
        <div>
          <small className="mk-muted">Bước chân</small>
          <strong>
            <Counter to={8420} format={vnd} />
          </strong>
        </div>
      </div>
      <div className="mk-heat" aria-hidden>
        {Array.from({ length: 84 }, (_, i) => (
          <m.i
            key={i}
            data-l={heat(i)}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={once}
            transition={{ duration: 0.4, ease: EASE, delay: Math.floor(i / 7) * 0.05 + (i % 7) * 0.015 }}
          />
        ))}
      </div>
      <div className="mk-legend">
        <span>12 tuần qua</span>
        <span>
          Ít <i data-l="1" />
          <i data-l="2" />
          <i data-l="3" />
          <i data-l="4" /> Nhiều
        </span>
      </div>
    </div>
  )
}

/* ---------- 05 Ghi chú: thẻ ôn tập lật + ghi chú Markdown ---------- */
function NotesMock() {
  const { ref, tick, live } = useLoop(3200)
  const flipped = live ? tick % 2 === 1 : false
  return (
    <div className="mk-panel mk-notes" ref={ref}>
      <div className="mk-flip">
        <m.div
          className="mk-card3d"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="mk-face">
            <small>Thẻ ôn tập · Tiếng Anh</small>
            <strong>“Consistency”</strong>
            <span className="mk-muted">nghĩa là gì?</span>
          </div>
          <div className="mk-face is-back">
            <small>Đáp án</small>
            <strong>Sự đều đặn, nhất quán</strong>
            <span className="mk-muted">Ôn lại sau 3 ngày</span>
          </div>
        </m.div>
      </div>
      <div className="mk-md">
        <b>## Ôn tập ngắt quãng</b>
        <span>Nhớ lâu hơn khi ôn đúng lúc sắp quên.</span>
        <span className="mk-skel" />
        <span className="mk-skel is-short" />
      </div>
    </div>
  )
}

/* ---------- 06 Nhắc nhở: thông báo lần lượt trên màn khóa điện thoại ---------- */
const NOTIFS = [
  { app: '/fox/fox-congviec.svg', name: 'Fox.CôngViệc', text: 'Gửi báo cáo — 09:00 hôm nay' },
  { app: '/fox/fox-suckhoe.svg', name: 'Fox.SứcKhỏe', text: 'Lịch khám định kỳ — Thứ 7, 08:30' },
  { app: '/fox/fox-congviec.svg', name: 'Fox.CôngViệc', text: 'Họp dự án sau 15 phút' },
]

function ReminderMock() {
  const { ref, tick, live } = useLoop(1800)
  const shown = live ? tick % (NOTIFS.length + 2) : NOTIFS.length // +2: dừng một nhịp khi đủ, một nhịp trống
  return (
    <div className="mk-panel mk-remind" ref={ref}>
      <div className="mk-phone">
        <span className="mk-phone-time">08:59</span>
        <span className="mk-muted">Thứ Sáu, 20 tháng 11</span>
        <div className="mk-notifs">
          <AnimatePresence>
            {NOTIFS.slice(0, Math.min(shown, NOTIFS.length)).map((n, i) => (
              <m.div
                key={i}
                className="mk-notif"
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <img src={n.app} alt="" width={26} height={26} />
                <span>
                  <b>{n.name}</b>
                  {n.text}
                </span>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

const MOCKS: Record<FeatureMockId, ComponentType> = {
  task: TaskMock,
  finance: FinanceMock,
  goal: GoalMock,
  habit: HabitMock,
  notes: NotesMock,
  reminder: ReminderMock,
}

/** Giao diện minh họa theo id tính năng (content.ts → FEATURES[].mock). */
export default function FeatureMock({ id }: { id: FeatureMockId }) {
  const Mock = MOCKS[id]
  return <Mock />
}
