/**
 * Dashboard minh họa ở hero trang Giới thiệu — giao diện mẫu, SỐ LIỆU MẪU (không phải dữ liệu của ai).
 * Có nhịp "đang chạy": việc lần lượt được đánh dấu xong, khoản chi mới hiện ra, số dư cập nhật — chỉ khi trong màn.
 * Kiểu: mocks.css (tiền tố .mk-). Tài liệu: docs/features/gioi-thieu.md.
 */
import { AnimatePresence, m } from 'motion/react'
import Wordmark from '@/components/Wordmark'
import { APPS } from '@/data/apps'
import { MockWindow } from '../kit'
import { EASE, useLoop, vnd } from '../hooks'

const TASKS = ['Gửi báo cáo tuần', 'Chốt ngân sách tháng 12', 'Chạy bộ 30 phút']
const SPENDS = [
  { label: 'Cà phê', cat: 'Ăn uống', amount: 35_000 },
  { label: 'Ăn trưa', cat: 'Ăn uống', amount: 55_000 },
  { label: 'Đổ xăng', cat: 'Đi lại', amount: 80_000 },
]
const BARS = [42, 68, 35, 80, 52, 61, 28]
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const EVENTS = [
  { time: '09:00', title: 'Họp dự án', tag: 'Công việc' },
  { time: '12:30', title: 'Ăn trưa cùng nhóm', tag: 'Cá nhân' },
  { time: '18:00', title: 'Lớp tiếng Anh', tag: 'Học tập' },
]
const HABITS = [
  { name: 'Ngủ trước 23h', days: [1, 1, 0, 1, 1, 1, 0] },
  { name: 'Uống đủ nước', days: [1, 1, 1, 1, 0, 1, 1] },
]
/** Số dư mẫu đầu tháng (đ) */
const BALANCE = 4_820_000

/** Dashboard tổng quan cuộc sống — mẫu. */
export default function DashboardMock() {
  const { ref, tick, live } = useLoop(2600)
  // tĩnh ("giảm chuyển động"): hiện trạng thái đẹp nhất — 2/3 việc xong
  const done = live ? tick % 4 : 2
  const spent = live ? SPENDS.slice(0, tick % (SPENDS.length + 1)).reduce((s, x) => s + x.amount, 0) : 0
  const last = live && tick % (SPENDS.length + 1) > 0 ? SPENDS[(tick % (SPENDS.length + 1)) - 1] : null

  return (
    <MockWindow title="FoxGo — Tổng quan" className="mk-dash">
      <div className="mk-dash-body" ref={ref}>
        <aside className="mk-side">
          <span className="mk-brand">
            <Wordmark size={17} go />
          </span>
          <span className="mk-nav is-on">Tổng quan</span>
          {APPS.map((a) => (
            <span key={a.code} className="mk-nav">
              <img src={a.mascot} alt="" width={18} height={18} />
              {a.area}
            </span>
          ))}
        </aside>

        <div className="mk-main">
          <header className="mk-head">
            <div>
              <small>Thứ Hai, 16 tháng 11</small>
              <strong>Chào buổi sáng, bạn</strong>
            </div>
            <span className="mk-pill">3 việc · 3 lịch hôm nay</span>
          </header>

          <div className="mk-grid">
            <section className="mk-card mk-tasks">
              <header>
                <b>Hôm nay · Big 3</b>
                <span className="mk-muted">{done}/3</span>
              </header>
              <span className="mk-progress">
                <m.i animate={{ scaleX: done / 3 }} transition={{ duration: 0.6, ease: EASE }} />
              </span>
              <ul>
                {TASKS.map((t, i) => (
                  <li key={t} className={i < done ? 'is-done' : undefined}>
                    <span className="mk-check" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mk-card mk-money">
              <header>
                <b>Ngân sách tháng</b>
                <span className="mk-muted">Còn lại</span>
              </header>
              <div className="mk-big">
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.span
                    key={spent}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {vnd(BALANCE - spent)}
                  </m.span>
                </AnimatePresence>
                <small>đ</small>
              </div>
              <div className="mk-bars">
                {BARS.map((h, i) => (
                  <span key={DAYS[i]}>
                    <m.i
                      style={{ height: `${h}%` }}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.9 + i * 0.05 }}
                    />
                    <small>{DAYS[i]}</small>
                  </span>
                ))}
              </div>
            </section>

            <section className="mk-card mk-goal">
              <header>
                <b>Mục tiêu</b>
              </header>
              <div className="mk-ring">
                <svg viewBox="0 0 64 64" aria-hidden>
                  <circle cx="32" cy="32" r="26" className="mk-ring-bg" />
                  <m.circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="mk-ring-fg"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 0.68 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: EASE, delay: 1 }}
                  />
                </svg>
                <strong>68%</strong>
              </div>
              <span className="mk-muted">Quỹ dự phòng</span>
            </section>

            <section className="mk-card mk-cal">
              <header>
                <b>Sắp tới</b>
              </header>
              <ul>
                {EVENTS.map((e) => (
                  <li key={e.time}>
                    <time>{e.time}</time>
                    <span>{e.title}</span>
                    <em>{e.tag}</em>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mk-card mk-habits">
              <header>
                <b>Thói quen</b>
                <span className="mk-muted">7 ngày</span>
              </header>
              {HABITS.map((h) => (
                <div key={h.name} className="mk-habit-row">
                  <span>{h.name}</span>
                  <span className="mk-dots">
                    {h.days.map((d, i) => (
                      <i key={i} className={d ? 'is-on' : undefined} />
                    ))}
                  </span>
                </div>
              ))}
            </section>
          </div>
        </div>

        <AnimatePresence>
          {last && (
            <m.div
              key={tick}
              className="mk-toast"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <img src="/fox/fox-taichinh.svg" alt="" width={22} height={22} />
              <span>
                <b>{last.label}</b> · {last.cat}
              </span>
              <strong>−{vnd(last.amount)}đ</strong>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </MockWindow>
  )
}
