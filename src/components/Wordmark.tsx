import type { CSSProperties } from 'react'

/**
 * Logo chữ — NƠI DUY NHẤT vẽ tên thương hiệu (đổi thương hiệu → sửa ở đây + CSS .wm trong global.css).
 * - Mặc định "Fox." — chữ đậm khít, dấu chấm tròn màu cam (--fox) — dùng ở trang chủ.
 * - `go`: "Fox.Go" — "Go" nhỏ ngay sau dấu chấm (anh chọn 16/11/2026) — dùng ở trang Giới thiệu.
 * Ưu tiên logo chữ thay cho logo hình cáo (public/icon.svg) để sau này đổi thương hiệu ít chỗ phải sửa.
 * `size` = cỡ chữ "Fox" (px). Màu chữ theo `color` của phần tử cha.
 */
export default function Wordmark({
  size = 24,
  go = false,
  className,
}: {
  size?: number
  go?: boolean
  className?: string
}) {
  return (
    <span
      className={`wm${className ? ` ${className}` : ''}`}
      style={{ '--wm-size': `${size}px` } as CSSProperties}
      role="img"
      aria-label={go ? 'FoxGo' : 'Fox.'}
    >
      <span className="wm-text" aria-hidden>
        Fox
      </span>
      <span className="wm-dot" aria-hidden />
      {go && (
        <span className="wm-go" aria-hidden>
          Go
        </span>
      )}
    </span>
  )
}
