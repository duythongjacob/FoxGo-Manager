/** Định tuyến bằng hash (#/gioi-thieu) — chạy được trên mọi hosting tĩnh, không cần cấu hình server. */

export type RouteId = 'home' | 'about'

export interface RouteDef {
  id: RouteId
  path: string
  label: string
}

export const ROUTES: readonly RouteDef[] = [
  { id: 'home', path: '/', label: 'Trang chủ' },
  { id: 'about', path: '/gioi-thieu', label: 'Giới thiệu' },
]

export interface Route {
  id: RouteId
  /** Phần sau đường dẫn trang, VD "#/gioi-thieu/ff" → "ff" (dùng để cuộn tới mục) */
  anchor?: string
}

/** "#/gioi-thieu/ff" → { id: 'about', anchor: 'ff' }. Đường dẫn lạ → trang chủ. */
export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#/, '').split('/').filter(Boolean)
  if (parts.length === 0) return { id: 'home' }
  const def = ROUTES.find((r) => r.path === `/${parts[0].toLowerCase()}`)
  if (!def) return { id: 'home' }
  return parts[1] ? { id: def.id, anchor: parts[1].toLowerCase() } : { id: def.id }
}

export function href(id: RouteId, anchor?: string): string {
  const def = ROUTES.find((r) => r.id === id)!
  return `#${def.path}${anchor ? `/${anchor}` : ''}`
}
