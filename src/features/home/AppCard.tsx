import type { CSSProperties } from 'react'
import { STATUS_LABEL, type FoxApp } from '@/lib/apps'

/** Thẻ app trong lưới launcher: linh vật cáo theo app (Fox.Files). App "kế hoạch" không có link, hiển thị mờ. */
export default function AppCard({ app }: { app: FoxApp }) {
  const live = app.status !== 'planned' && !!app.url
  const style = { '--app-accent': app.accent } as CSSProperties

  return (
    <article className={`fd-card${live ? '' : ' is-planned'}`} style={style}>
      <div className="fd-card-top">
        <span className="fd-card-icon" aria-hidden>
          <img src={app.mascot} alt="" width={48} height={48} />
        </span>
        <span className={`fd-status s-${app.status}`}>
          {STATUS_LABEL[app.status]}
          {app.version ? ` · v${app.version}` : ''}
        </span>
      </div>
      <div className="fd-card-body">
        <span className="fd-card-area">{app.area}</span>
        {live ? (
          <a className="fd-card-title fd-stretch" href={app.url} aria-label={`Mở ${app.name}`}>
            {app.name}
          </a>
        ) : (
          <span className="fd-card-title">{app.name}</span>
        )}
        <p className="fd-card-desc">{app.desc}</p>
      </div>
      {live && app.extra && app.extra.length > 0 && (
        <div className="fd-card-links">
          {app.extra.map((l) => (
            <a key={l.url} href={l.url} aria-label={`${app.name} — ${l.label}`}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </article>
  )
}
