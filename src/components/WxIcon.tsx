import type { ReactNode } from 'react'
import type { WeatherIcon } from '@/lib/weather'

/**
 * Biểu tượng thời tiết vẽ bằng SVG, không dùng emoji (chép từ Fox.TàiChính `WeatherWidget.tsx`).
 * `kind` lấy từ describeWeather(); `night` đổi mặt trời thành mặt trăng.
 * Màu cố định (không theo theme) vì là hình minh họa, luôn nằm trên nền tối của trang chủ.
 */
export default function WxIcon({
  kind,
  size = 28,
  night = false,
}: {
  kind: WeatherIcon
  size?: number
  night?: boolean
}) {
  const sun = night ? (
    <path d="M20 13.5A7.5 7.5 0 1 1 12.5 6a6 6 0 0 0 7.5 7.5Z" fill="#a5b4fc" />
  ) : (
    <g>
      <circle cx="12" cy="12" r="4.6" fill="#fbbf24" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1="12"
          y1="2.6"
          x2="12"
          y2="4.6"
          stroke="#fbbf24"
          strokeWidth="1.8"
          strokeLinecap="round"
          transform={`rotate(${a} 12 12)`}
        />
      ))}
    </g>
  )
  const cloud = (fill: string) => (
    <path d="M7.5 19h9.2a3.8 3.8 0 0 0 .4-7.6 5.2 5.2 0 0 0-10-1A4.3 4.3 0 0 0 7.5 19Z" fill={fill} />
  )
  const drops = (n: number) =>
    Array.from({ length: n }, (_, i) => (
      <line
        key={i}
        x1={8 + i * 3.5}
        y1="20.5"
        x2={7 + i * 3.5}
        y2="23"
        stroke="#60a5fa"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    ))
  const body: Record<WeatherIcon, ReactNode> = {
    sun,
    partly: (
      <g>
        <g transform="translate(-3 -3) scale(0.85)">{sun}</g>
        <g transform="translate(2 1) scale(0.85)">{cloud('#cbd5e1')}</g>
      </g>
    ),
    cloud: cloud('#94a3b8'),
    fog: (
      <g stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="6" y1="13" x2="18" y2="13" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </g>
    ),
    drizzle: (
      <g transform="translate(0 -3)">
        {cloud('#94a3b8')}
        {drops(2)}
      </g>
    ),
    rain: (
      <g transform="translate(0 -3)">
        {cloud('#64748b')}
        {drops(3)}
      </g>
    ),
    storm: (
      <g transform="translate(0 -3)">
        {cloud('#475569')}
        <path d="M12.5 18.5 10 22.5h2.6l-1.6 3.5 4-5h-2.6l1.6-2.5Z" fill="#facc15" />
      </g>
    ),
    snow: (
      <g transform="translate(0 -3)">
        {cloud('#cbd5e1')}
        {[8, 12, 16].map((x) => (
          <circle key={x} cx={x} cy="22" r="1.1" fill="#93c5fd" />
        ))}
      </g>
    ),
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 26" aria-hidden>
      {body[kind]}
    </svg>
  )
}
