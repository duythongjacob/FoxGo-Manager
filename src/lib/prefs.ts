/**
 * Thiết lập trang chủ của người dùng (FD-005) — hàm thuần: kiểm tra dữ liệu đọc từ localStorage, sắp thứ tự ô,
 * chuẩn hóa link. Không import React/antd. Lưu/đọc ở data/prefs.ts. Tính năng: docs/features/cai-dat.md.
 */

/** Link do người dùng tự thêm — hiện thành một ô trên trang chủ. */
export interface UserLink {
  id: string
  name: string
  url: string
}

export interface Prefs {
  /** Thứ tự ô: khóa `app:<mã>` hoặc `link:<id>`; ô chưa có trong danh sách xếp cuối theo thứ tự mặc định */
  order: string[]
  /** true = bấm ô mở tab mới */
  newTab: boolean
  links: UserLink[]
}

export const DEFAULT_PREFS: Prefs = { order: [], newTab: false, links: [] }

/** Giới hạn để dữ liệu hỏng/lạ không làm vỡ trang (localStorage có thể bị sửa tay). */
export const MAX_LINKS = 24
export const MAX_NAME = 24

/** Khóa thứ tự của một app / một link. */
export const appKey = (code: string) => `app:${code}`
export const linkKey = (id: string) => `link:${id}`

/**
 * Chuẩn hóa link người dùng gõ: thiếu giao thức → thêm `https://`; chỉ nhận http/https
 * (chặn `javascript:`, `data:`… vì link được gắn thẳng vào thẻ <a>). Không hợp lệ → null.
 */
export function normalizeUrl(input: string): string | null {
  const s = input.trim()
  if (!s || /\s/.test(s)) return null
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(s) ? s : `https://${s}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null
    return u.href
  } catch {
    return null
  }
}

/** Tên ô mặc định từ link: "https://www.youtube.com/…" → "youtube". */
export function nameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host.split('.')[0] || host
  } catch {
    return url
  }
}

/** Đọc thiết lập đã lưu (đã JSON.parse); bỏ phần hỏng, thiếu thì lấy mặc định. */
export function parsePrefs(raw: unknown): Prefs {
  const r = (raw ?? {}) as Partial<Record<keyof Prefs, unknown>>
  const links: UserLink[] = []
  if (Array.isArray(r.links)) {
    for (const x of r.links as Partial<UserLink>[]) {
      if (links.length >= MAX_LINKS) break
      if (typeof x?.id !== 'string' || typeof x.name !== 'string' || typeof x.url !== 'string') continue
      const url = normalizeUrl(x.url)
      const name = x.name.trim().slice(0, MAX_NAME)
      if (url && name && !links.some((l) => l.id === x.id)) links.push({ id: x.id, name, url })
    }
  }
  const order = Array.isArray(r.order)
    ? [...new Set(r.order.filter((k): k is string => typeof k === 'string'))]
    : []
  return { order, newTab: r.newTab === true, links }
}

/**
 * Sắp `items` theo `order`: khóa có trong order đi trước đúng thứ tự đó; khóa chưa có (app mới thêm) giữ thứ tự gốc
 * ở cuối; khóa trong order mà không còn item (link đã xóa) bị bỏ qua.
 */
export function applyOrder<T>(items: readonly T[], keyOf: (t: T) => string, order: readonly string[]): T[] {
  const rank = new Map(order.map((k, i) => [k, i]))
  return items
    .map((t, i) => ({ t, i, r: rank.get(keyOf(t)) }))
    .sort((a, b) => {
      if (a.r !== undefined && b.r !== undefined) return a.r - b.r
      if (a.r !== undefined) return -1
      if (b.r !== undefined) return 1
      return a.i - b.i
    })
    .map((x) => x.t)
}

/** Đổi chỗ phần tử `i` với phần tử kế bên (`dir` = -1 lên, +1 xuống); ra ngoài mảng → trả bản sao không đổi. */
export function move<T>(arr: readonly T[], i: number, dir: -1 | 1): T[] {
  const out = [...arr]
  const j = i + dir
  if (i < 0 || i >= out.length || j < 0 || j >= out.length) return out
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}
