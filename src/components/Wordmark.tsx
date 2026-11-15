import type { CSSProperties } from 'react'

/**
 * Logo chữ "Fox." — chữ đậm khít, dấu chấm tròn màu cam thương hiệu (--fox).
 * `size` = cỡ chữ (px). Màu chữ theo `color` của phần tử cha.
 */
export default function Wordmark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <span
      className={`wm${className ? ` ${className}` : ''}`}
      style={{ '--wm-size': `${size}px` } as CSSProperties}
      role="img"
      aria-label="Fox."
    >
      <span className="wm-text" aria-hidden>
        Fox
      </span>
      <span className="wm-dot" aria-hidden />
    </span>
  )
}
