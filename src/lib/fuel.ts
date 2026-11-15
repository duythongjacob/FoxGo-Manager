/**
 * Giá xăng dầu bán lẻ Petrolimex — hàm thuần (chép từ Fox.TàiChính FF-075 `lib/fuel.ts`, chỉ phần cần cho thanh thông số).
 * Số liệu: snapshot `src/data/fuel.json` do `npm run fuel:update` tạo. Đơn vị đ/lít; vùng 2 (xa cảng) có thể thiếu.
 * Tính năng: docs/features/thanh-thong-so.md.
 */
export interface FuelItem {
  name: string
  region1: number
  region2: number | null
  unit: string
}
export interface FuelPrices {
  source: string
  /** ngày kỳ điều hành gần nhất (YYYY-MM-DD) */
  priceDate: string
  /** lúc lấy số liệu (ISO) */
  fetchedAt: string
  items: FuelItem[]
}

/** Kiểm tra snapshot (fuel.json) đọc từ bundle — phòng file hỏng. */
export function isFuelPrices(v: unknown): v is FuelPrices {
  const f = v as FuelPrices | null
  return (
    !!f &&
    typeof f.priceDate === 'string' &&
    Array.isArray(f.items) &&
    f.items.length > 0 &&
    f.items.every((i) => typeof i?.region1 === 'number')
  )
}

/** Xăng RON95 phổ thông (RON 95-III / "Mức 3"); không có thì lấy RON 95 bất kỳ, tránh loại cao cấp (RON 95-V / Mức 5). */
export function pickRon95(items: FuelItem[]): FuelItem | null {
  const ron = items.filter((i) => /ron\s*95/i.test(i.name))
  if (!ron.length) return null
  return (
    ron.find((i) => /95\s*-?\s*III\b|mức\s*3/i.test(i.name)) ??
    ron.find((i) => !/95\s*-?\s*V\b|mức\s*5/i.test(i.name)) ??
    ron[0]
  )
}

/** "2026-11-12" → "12/11/2026" */
export const fuelDateLabel = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}
