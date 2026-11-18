/**
 * Kiểu dữ liệu & hàm thuần cho danh sách app Fox. Không import React/antd (test bằng Vitest môi trường node).
 * Dữ liệu thật ở data/apps.ts. Tính năng: docs/features/danh-sach-app.md.
 */

/** Trạng thái app: đang chạy (mở được) · đang xây · kế hoạch (ô mờ, không link). */
export type AppStatus = 'live' | 'building' | 'planned'

export interface AppLink {
  label: string
  url: string
}

export interface FoxApp {
  /** Mã 2 chữ (docs/MA_APP.md) */
  code: string
  name: string
  /** Mảng cuộc sống, hiển thị nhỏ trên thẻ */
  area: string
  /** Mô tả rất ngắn (2–3 từ) dưới tên trên trang chủ */
  tagline?: string
  desc: string
  /** Linh vật của app trong public/fox/ (sinh từ Fox.Files) */
  mascot: string
  /** Linh vật toàn thân (trang Ứng dụng) */
  fullBody?: string
  /** Tính năng chính (trang Ứng dụng) — mô tả chung, không số liệu */
  highlights?: string[]
  /** Màu nhấn riêng — chỉ dùng cho icon/viền thẻ */
  accent: string
  status: AppStatus
  version?: string
  /** Link chính (mở khi bấm thẻ) */
  url?: string
  /** Link phụ (VD bản chạy trên máy) */
  extra?: AppLink[]
  /** Từ khóa tìm kiếm thêm */
  tags?: string[]
}

/** Đang chạy và đang xây cùng nhóm (đều mở được) — thứ tự trong nhóm theo data/apps.ts (anh chọn 18/11/2026). */
const STATUS_ORDER: Record<AppStatus, number> = { live: 0, building: 0, planned: 1 }

/** Bỏ dấu tiếng Việt + chữ thường để tìm "ha noi" ra "Hà Nội" (ô chọn thành phố). */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
}

/** Sắp xếp: app mở được (đang chạy / đang xây) → kế hoạch, giữ thứ tự gốc trong cùng nhóm. */
export function sortApps(apps: readonly FoxApp[]): FoxApp[] {
  return apps
    .map((a, i) => ({ a, i }))
    .sort((x, y) => STATUS_ORDER[x.a.status] - STATUS_ORDER[y.a.status] || x.i - y.i)
    .map((x) => x.a)
}
