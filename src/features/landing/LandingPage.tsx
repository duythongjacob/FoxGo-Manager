import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowRightOutlined,
  CheckOutlined,
  ExperimentOutlined,
  HeartOutlined,
  HomeOutlined,
  LockOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { APPS } from '@/data/apps'
import { sortApps, STATUS_LABEL, type FoxApp } from '@/lib/apps'
import { href } from '@/lib/route'
import './landing.css'

const PRINCIPLES: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <LockOutlined />,
    title: 'Riêng tư trước tiên',
    desc: 'Dữ liệu nằm trên máy hoặc tài khoản của chính bạn. Không analytics, không quảng cáo.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Một gia đình',
    desc: 'Cùng màu sắc, font chữ, chú cáo và giọng văn — mở app nào cũng thấy quen.',
  },
  {
    icon: <ExperimentOutlined />,
    title: 'Nhỏ mà xong',
    desc: 'Mỗi app ra bản đầu trong 1–2 tuần, rồi lặp theo nhu cầu thật. Không xây tính năng “để dành”.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Số liệu có nguồn',
    desc: 'Con số nào cũng truy được về dữ liệu gốc; ước tính luôn ghi rõ là ước tính.',
  },
  {
    icon: <HeartOutlined />,
    title: 'Đồng hành, không giảng đạo lý',
    desc: 'Nhắc đúng lúc, khen khi bạn giữ kỷ luật, gợi ý bước tiếp theo.',
  },
  {
    icon: <MobileOutlined />,
    title: 'Điện thoại & máy tính như nhau',
    desc: 'Màn hình nhỏ không tràn, sáng/tối đều dễ nhìn, cài được như app.',
  },
]

const EXPRESSIONS = [
  ['happy', 'Vui'],
  ['wink', 'Nháy mắt'],
  ['love', 'Thương'],
  ['celebrate', 'Ăn mừng'],
  ['thinking', 'Suy nghĩ'],
  ['surprised', 'Ngạc nhiên'],
  ['worried', 'Lo lắng'],
  ['sleepy', 'Buồn ngủ'],
] as const

const PHASES = [
  {
    title: 'Trang chủ lối tắt',
    desc: 'Đồng hồ, thời tiết, giá thị trường và lối vào mọi app. Không đọc dữ liệu của app nào.',
    now: true,
  },
  {
    title: 'Một lần đăng nhập',
    desc: 'Đăng nhập chung cho mọi app; trang chủ hiện vài con số tóm tắt (không chi tiết).',
  },
  {
    title: 'Các app nói chuyện với nhau',
    desc: 'Mục tiêu học tập có chi phí → Tài chính; lịch tập → Sức khỏe & Công việc.',
  },
]

const goTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const accent = (a: FoxApp) => ({ '--app-accent': a.accent }) as CSSProperties

/** Chú cáo vẫy tay ở giữa, 6 linh vật app xoay chậm trên quỹ đạo. */
function Orbit({ apps }: { apps: FoxApp[] }) {
  return (
    <div className="ld-orbit" aria-hidden>
      <span className="ld-ring r1" />
      <span className="ld-ring r2" />
      <span className="ld-core">
        <img src="/fox/fox-vay-tay.svg" alt="" width={150} height={188} />
      </span>
      <div className="ld-spin">
        {apps.map((a, i) => (
          <span
            key={a.code}
            className={`ld-planet${a.status === 'planned' ? ' is-planned' : ''}`}
            style={{ ...accent(a), '--i': i, '--n': apps.length } as CSSProperties}
          >
            <img src={a.mascot} alt="" width={40} height={40} />
          </span>
        ))}
      </div>
      <span className="ld-float f1">
        <LockOutlined /> Riêng tư trước tiên
      </span>
      <span className="ld-float f2">
        <HeartOutlined /> {apps.length} mảng cuộc sống
      </span>
    </div>
  )
}

function FeaturedApp({ app }: { app: FoxApp }) {
  return (
    <article id={app.code.toLowerCase()} className="ld-bento-main" style={accent(app)}>
      <div className="ld-bento-main-body">
        <div className="ld-tagrow">
          <span className="ld-area">{app.area}</span>
          <span className={`fd-status s-${app.status}`}>
            {STATUS_LABEL[app.status]}
            {app.version ? ` · v${app.version}` : ''}
          </span>
        </div>
        <h3>{app.name}</h3>
        <p className="ld-muted">{app.desc}</p>
        {app.highlights && (
          <ul className="ld-checks">
            {app.highlights.map((h) => (
              <li key={h}>
                <CheckOutlined aria-hidden /> {h}
              </li>
            ))}
          </ul>
        )}
        {app.url && (
          <a className="ld-btn solid" href={app.url}>
            Mở {app.name} <ArrowRightOutlined />
          </a>
        )}
      </div>
      <div className="ld-bento-main-art" aria-hidden>
        <img src={app.fullBody ?? app.mascot} alt="" width={180} height={225} />
      </div>
    </article>
  )
}

function SmallApp({ app }: { app: FoxApp }) {
  return (
    <article id={app.code.toLowerCase()} className="ld-bento-item" style={accent(app)}>
      <div className="ld-tagrow">
        <span className="ld-bento-icon" aria-hidden>
          <img src={app.mascot} alt="" width={40} height={40} />
        </span>
        <span className={`fd-status s-${app.status}`}>
          {app.status === 'planned' ? 'Sắp ra mắt' : STATUS_LABEL[app.status]}
        </span>
      </div>
      <h3>{app.name}</h3>
      <p className="ld-muted">{app.desc}</p>
      {app.highlights && (
        <ul className="ld-dots">
          {app.highlights.slice(0, 2).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

function Head({
  id,
  eyebrow,
  title,
  lead,
}: {
  id: string
  eyebrow: string
  title: ReactNode
  lead?: string
}) {
  return (
    <div className="ld-head">
      <span className="ld-eyebrow">{eyebrow}</span>
      <h2 id={id}>{title}</h2>
      {lead && <p className="ld-muted">{lead}</p>}
    </div>
  )
}

/** Trang Giới thiệu FoxGo (#/gioi-thieu). */
export default function LandingPage() {
  const apps = sortApps(APPS)
  const [featured, ...rest] = apps

  return (
    <>
      {/* ---------- Hero tràn viền ---------- */}
      <section className="ld-hero" aria-labelledby="h-hero">
        <div className="ld-hero-bg" aria-hidden>
          <span className="fd-blob b1" />
          <span className="fd-blob b2" />
          <span className="fd-blob b3" />
          <span className="ld-hero-grid" />
        </div>
        <div className="ld-wrap ld-hero-inner">
          <div className="ld-hero-text">
            <span className="ld-pill">Hệ sinh thái app cá nhân</span>
            <h1 id="h-hero">
              Mỗi mảng cuộc sống
              <br />
              <span className="fd-gradient-text">một chú cáo nhỏ</span>
            </h1>
            <p className="ld-hero-lead">
              Tài chính, công việc, sức khỏe, học tập, giải trí, kỹ năng — mỗi mảng một app Fox tập trung và
              riêng tư, gom lại ở một trang chủ duy nhất.
            </p>
            <div className="ld-cta">
              <a className="ld-btn primary" href={href('home')}>
                <HomeOutlined /> Mở trang chủ
              </a>
              <button type="button" className="ld-btn ghost" onClick={() => goTo('h-eco')}>
                Xem các app
              </button>
            </div>
            <ul className="ld-trust">
              <li>
                <CheckOutlined aria-hidden /> Không quảng cáo
              </li>
              <li>
                <CheckOutlined aria-hidden /> Dữ liệu là của bạn
              </li>
              <li>
                <CheckOutlined aria-hidden /> Sáng &amp; tối
              </li>
            </ul>
          </div>
          <Orbit apps={apps} />
        </div>
      </section>

      <div className="ld-wrap ld-body">
        {/* ---------- Hệ sinh thái (bento) ---------- */}
        <section className="ld-section" aria-labelledby="h-eco">
          <Head
            id="h-eco"
            eyebrow="Hệ sinh thái"
            title="Sáu app, một gia đình"
            lead="Mỗi app làm tốt một việc. Chú cáo đổi phụ kiện theo từng mảng để bạn nhận ra ngay."
          />
          <div className="ld-bento">
            {featured && <FeaturedApp app={featured} />}
            {rest.map((a) => (
              <SmallApp key={a.code} app={a} />
            ))}
          </div>
        </section>

        {/* ---------- Nguyên tắc ---------- */}
        <section className="ld-section ld-split" aria-labelledby="h-rules">
          <div className="ld-split-side">
            <Head
              id="h-rules"
              eyebrow="Nguyên tắc"
              title={
                <>
                  Những điều
                  <br />
                  không đổi
                </>
              }
              lead="Sáu cam kết áp dụng cho mọi app Fox, từ app đầu tiên tới app sau cùng."
            />
            <img className="ld-split-fox" src="/fox/fox-gioi-thieu.svg" alt="" width={160} height={200} />
          </div>
          <ol className="ld-rules">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title}>
                <span className="ld-rule-no" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>
                    <span className="ld-rule-icon" aria-hidden>
                      {p.icon}
                    </span>
                    {p.title}
                  </h3>
                  <p className="ld-muted">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Linh vật ---------- */}
        <section className="ld-section ld-fox" aria-labelledby="h-fox">
          <div className="ld-fox-text">
            <Head
              id="h-fox"
              eyebrow="Linh vật"
              title="Chào bạn, mình là Fox"
              lead="Lanh lợi, ấm áp, chăm chỉ và hơi tinh nghịch. Mình chào bạn mỗi sáng, nhắc khi cần, khen khi bạn giữ kỷ luật — không bao giờ phán xét."
            />
            <div className="ld-quotes">
              <q>Hôm nay bạn đã ghi đủ rồi, giỏi quá!</q>
              <q>Tuần này hơi căng, mình cùng xem lại nhé.</q>
              <q>Ngủ sớm đi, mai mình nhắc tiếp.</q>
            </div>
          </div>
          <ul className="ld-faces" aria-label="Các biểu cảm của Fox">
            {EXPRESSIONS.map(([k, label]) => (
              <li key={k}>
                <img src={`/fox/bieu-cam/fox-${k}.svg`} alt="" width={56} height={56} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Lộ trình ---------- */}
        <section className="ld-section" aria-labelledby="h-road">
          <Head id="h-road" eyebrow="Lộ trình" title="Lớn lên từng bước" />
          <ol className="ld-road">
            {PHASES.map((p, i) => (
              <li key={p.title} className={p.now ? 'is-now' : undefined}>
                <span className="ld-road-dot" aria-hidden>
                  {i + 1}
                </span>
                <span className="ld-road-step">
                  Giai đoạn {i + 1}
                  {p.now && <em>Hiện tại</em>}
                </span>
                <h3>{p.title}</h3>
                <p className="ld-muted">{p.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Kêu gọi cuối ---------- */}
        <section className="ld-final" aria-labelledby="h-final">
          <div className="ld-hero-bg" aria-hidden>
            <span className="fd-blob b1" />
            <span className="fd-blob b2" />
            <span className="ld-hero-grid" />
          </div>
          <div className="ld-final-text">
            <h2 id="h-final">Sẵn sàng cho một ngày gọn gàng?</h2>
            <p>
              Ghim trang chủ FoxGo làm trang mở đầu trình duyệt — giờ, thời tiết, giá vàng và mọi app trong
              một chạm.
            </p>
            <a className="ld-btn primary" href={href('home')}>
              <HomeOutlined /> Mở trang chủ
            </a>
          </div>
          <img className="ld-final-fox" src="/fox/fox-vay-tay.svg" alt="" width={130} height={163} />
        </section>
      </div>
    </>
  )
}
