/**
 * Mục 03 — Tính năng. 4 hàng lớn xen kẽ chữ / giao diện minh họa (đổi bên mỗi hàng), 2 tính năng cuối đứng cạnh nhau —
 * tránh 6 thẻ giống hệt. Giao diện minh họa trôi nhẹ ngược chiều cuộn (parallax ±40px).
 * Mỗi tính năng ghi app Fox thật làm nó + trạng thái thật; chỉ có nút mở khi app đã có link.
 * Tài liệu: docs/features/gioi-thieu.md.
 */
import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { FEATURES, SECTION, type Feature } from '../content'
import { appByCode } from '../hooks'
import { AppChip, Reveal, SectionHead } from '../kit'
import FeatureMock from '../mocks/FeatureMocks'

/** Link mở app đầu tiên của tính năng (nếu app đã có bản chạy / bản đang xây). */
function OpenLink({ codes }: { codes: string[] }) {
  const app = codes.map(appByCode).find((a) => a?.url && a.status !== 'planned')
  if (!app?.url) return null
  return (
    <a className="ld-link" href={app.url} target="_blank" rel="noreferrer">
      {app.status === 'live' ? 'Mở' : 'Dùng thử'} {app.name} <ArrowRightOutlined />
    </a>
  )
}

/** Chữ của một tính năng: số thứ tự, tiêu đề, mô tả, ý chính, app làm nó. */
function FeatureText({ f, index }: { f: Feature; index: number }) {
  return (
    <div className="ld-feat-text">
      <Reveal y={16}>
        <span className="ld-feat-no">{String(index + 1).padStart(2, '0')}</span>
      </Reveal>
      <Reveal delay={0.05}>
        <h3>{f.title}</h3>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="ld-lead">{f.desc}</p>
      </Reveal>
      <Reveal delay={0.18}>
        <ul className="ld-points">
          {f.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.24} className="ld-feat-apps">
        {f.apps.map((c) => (
          <AppChip key={c} code={c} />
        ))}
        <OpenLink codes={f.apps} />
      </Reveal>
    </div>
  )
}

/** Hàng lớn: chữ một bên, giao diện minh họa bên kia (trôi parallax). */
function FeatureRow({ f, index }: { f: Feature; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40])
  return (
    <article ref={ref} id={f.id} className={`ld-feat${index % 2 ? ' is-flip' : ''}`}>
      <FeatureText f={f} index={index} />
      <Reveal className="ld-feat-visual" y={48}>
        <m.div style={{ y }}>
          <FeatureMock id={f.mock} />
        </m.div>
      </Reveal>
    </article>
  )
}

/** Ô nửa bề rộng (2 tính năng cuối): giao diện ở trên, chữ ở dưới. */
function FeatureTile({ f, index }: { f: Feature; index: number }) {
  return (
    <article id={f.id} className="ld-feat-tile">
      <Reveal className="ld-feat-visual" y={40} delay={index % 2 ? 0.1 : 0}>
        <FeatureMock id={f.mock} />
      </Reveal>
      <FeatureText f={f} index={index} />
    </article>
  )
}

export default function Features() {
  const rows = FEATURES.slice(0, 4)
  const tiles = FEATURES.slice(4)
  return (
    <section id={SECTION.features} className="ld-section ld-features" aria-labelledby="h-features">
      <div className="ld-wrap">
        <SectionHead
          id="h-features"
          eyebrow="Tính năng"
          lines={['Mỗi mảng một app,', 'làm thật tốt một việc.']}
          lead="Sáu mảng cuộc sống, mỗi mảng một chú cáo chuyên trách. App nào đang chạy, app nào sắp có — ghi rõ ngay bên cạnh."
        />
        <div className="ld-feat-list">
          {rows.map((f, i) => (
            <FeatureRow key={f.id} f={f} index={i} />
          ))}
          <div className="ld-feat-tiles">
            {tiles.map((f, i) => (
              <FeatureTile key={f.id} f={f} index={rows.length + i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
