/**
 * Mục 08 — Chân trang trang Giới thiệu. Nền lưới chấm mờ dần (như bảng làm việc), gồm:
 *  - dải mời: logo + khẩu hiệu + nút "Mở trang chủ";
 *  - 4 cột: giới thiệu ngắn + liên hệ (SĐT, email — anh yêu cầu 16/11/2026), Sản phẩm (trang chủ + app đã có bản web), Khám phá (các mục), Trạng thái (dấu "Đang hoạt động";
 *    phiên bản lấy lúc build);
 *  - chữ "Fox." rất lớn mờ dần ở đáy (trang trí) + dòng bản quyền, giữa là dải "Vận hành trên" (3 huy hiệu hạ tầng có thật
 *    của bản deploy: Google Cloud, CDN, HTTPS/TLS — không phải nhà tài trợ).
 * Chỉ link có thật (chưa có trang Chính sách / Điều khoản / Liên hệ — anh chọn bỏ). Tài liệu: docs/features/gioi-thieu.md.
 */
import type { CSSProperties } from 'react'
import { ArrowRightOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import Wordmark from '@/components/Wordmark'
import { APPS } from '@/data/apps'
import { href } from '@/lib/route'
import { CONTACT, INFRA_BADGES, LANDING_NAV, SECTION, type InfraBadgeKey } from '../content'

/**
 * Icon đơn sắc của từng huy hiệu hạ tầng (vẽ inline — không tải từ CDN theo quy tắc FD).
 * Nét `currentColor`: xám khi nghỉ, hiện màu riêng khi rê chuột (CSS `--src-color`).
 */
function BadgeIcon({ kind }: { kind: InfraBadgeKey }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  } as const
  if (kind === 'cloud')
    // đám mây
    return (
      <svg {...common}>
        <path d="M7 19h10a4.5 4.5 0 0 0 .6-8.96A6 6 0 0 0 6.2 11.1 4 4 0 0 0 7 19Z" />
      </svg>
    )
  if (kind === 'cdn')
    // quả địa cầu: vòng tròn + kinh/vĩ tuyến
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    )
  // ổ khóa
  return (
    <svg {...common}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
    </svg>
  )
}

export default function Footer() {
  const appLinks = APPS.filter((a) => a.url && a.status !== 'planned')
  return (
    <footer className="ld-footer">
      <div className="ld-footer-bg" aria-hidden />

      <div className="ld-wrap">
        <div className="ld-footer-cta">
          <div>
            <Wordmark size={34} go />
            <p>Gom mọi điều quan trọng về một nơi.</p>
          </div>
          <a className="ld-footer-btn" href={href('home')}>
            Mở trang chủ FoxGo <ArrowRightOutlined />
          </a>
        </div>

        <div className="ld-footer-grid">
          <div className="ld-footer-about">
            <b>FoxGo</b>
            <p>
              Fox kết nối những công cụ thiết yếu cho cuộc sống hiện đại, từ công việc, tài chính đến sức khỏe và tri
              thức. Mỗi ứng dụng có một sứ mệnh riêng, cùng tạo nên một hệ sinh thái đồng bộ.
            </p>
            <address className="ld-footer-contact">
              <a href={`tel:${CONTACT.phone}`}>
                <PhoneOutlined aria-hidden /> {CONTACT.phoneLabel}
              </a>
              <a href={`mailto:${CONTACT.email}`}>
                <MailOutlined aria-hidden /> {CONTACT.email}
              </a>
            </address>
          </div>
          <nav aria-label="Sản phẩm">
            <b>Sản phẩm</b>
            <a href={href('home')}>Trang chủ FoxGo</a>
            {appLinks.map((a) => (
              <a key={a.code} href={a.url} target="_blank" rel="noreferrer">
                {a.name}
              </a>
            ))}
          </nav>
          <nav aria-label="Khám phá">
            <b>Khám phá</b>
            {LANDING_NAV.map((n) => (
              <a key={n.id} href={href('about', n.id)}>
                {n.label}
              </a>
            ))}
            <a href={href('about', SECTION.workflow)}>Quy trình</a>
          </nav>
          <div className="ld-footer-status">
            <b>Trạng thái</b>
            <span className="ld-footer-live">
              <i aria-hidden /> Đang hoạt động
            </span>
          </div>
        </div>

        <div className="ld-footer-mark" aria-hidden>
          Fox<i />
        </div>

        <div className="ld-footer-base">
          <span>© 2026 FoxGo · Thong Duy</span>
          <div className="ld-footer-sources">
       
            <ul>
              {INFRA_BADGES.map((b) => (
                <li key={b.key} title={b.what} style={{ '--src-color': b.color } as CSSProperties}>
                  <BadgeIcon kind={b.key} />
                  {b.name}
                </li>
              ))}
            </ul>
          </div>
          <span>Phiên bản {__APP_VERSION__}</span>
        </div>
      </div>
    </footer>
  )
}
