/**
 * Giá thị trường — hàm thuần (chép từ Fox.TàiChính `lib/market.ts`, `lib/currency.ts`, FF-033/036).
 * CoinGecko simple/price: Bitcoin và PAX Gold (token bảo chứng 1 troy ounce vàng ≈ giá vàng thế giới).
 * ExchangeRate-API: tỷ giá theo USD. Tính năng: docs/features/thanh-thong-so.md.
 */

/** Giá một tài sản. */
export interface Quote {
  usd: number
  vnd: number
  /** % thay đổi 24 giờ (theo USD) */
  change24h: number | null
}
export interface Market {
  btc: Quote
  /** PAX Gold — 1 token = 1 troy ounce vàng */
  gold: Quote
  /** Lần cập nhật giá mới nhất của nguồn (ms) */
  updated: number
}

/** Chuẩn hóa phản hồi CoinGecko simple/price; null nếu thiếu Bitcoin hoặc PAX Gold. */
export function parseCoinGecko(json: unknown): Market | null {
  const j = json as Record<string, Record<string, number> | undefined>
  const q = (x?: Record<string, number>): Quote | null =>
    x && typeof x.usd === 'number' && typeof x.vnd === 'number'
      ? { usd: x.usd, vnd: x.vnd, change24h: typeof x.usd_24h_change === 'number' ? x.usd_24h_change : null }
      : null
  const btc = q(j?.bitcoin)
  const gold = q(j?.['pax-gold'])
  if (!btc || !gold) return null
  const ts = Math.max(j?.bitcoin?.last_updated_at ?? 0, j?.['pax-gold']?.last_updated_at ?? 0)
  return { btc, gold, updated: ts * 1000 }
}

/** USD/VND từ phản hồi open.er-api.com/v6/latest/USD; null nếu không hợp lệ. */
export function parseUsdVnd(json: unknown): { rate: number; updated: number } | null {
  const j = json as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number }
  const rate = j?.rates?.VND
  if (!j || j.result !== 'success' || typeof rate !== 'number' || rate <= 0) return null
  return { rate, updated: (j.time_last_update_unix ?? 0) * 1000 }
}

/** 1 lượng = 37.5 g = 1.20565 troy ounce */
export const OZ_PER_LUONG = 1.20565

/** Giá vàng thế giới quy đổi ra đ/lượng (chưa gồm chênh lệch vàng miếng trong nước). */
export const goldPerLuong = (usdPerOz: number, usdVnd: number) => usdPerOz * usdVnd * OZ_PER_LUONG

/** "1.90 tỷ" / "122.9 tr" / "25,400" — gọn cho ô nhỏ. */
export function compactVnd(v: number): string {
  const a = Math.abs(v)
  if (a >= 1e9) return `${(v / 1e9).toFixed(2)} tỷ`
  if (a >= 1e6) return `${(v / 1e6).toFixed(1)} tr`
  return Math.round(v).toLocaleString('en-US')
}

/** "+1.23%" / "-0.40%" / null */
export const pct = (v: number | null) => (v === null ? null : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`)

/** "$97,250" */
export const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`

const isQuote = (q: unknown): q is Quote => {
  const x = q as Partial<Quote> | null
  return !!x && typeof x.usd === 'number' && typeof x.vnd === 'number'
}

/** Giá trị đọc từ đệm có đúng dạng `Market` không (FD-014: đệm hỏng không được làm vỡ thanh thông số). */
export function isMarket(v: unknown): v is Market {
  const m = v as Partial<Market> | null
  return !!m && isQuote(m.btc) && isQuote(m.gold) && typeof m.updated === 'number'
}

/** Giá trị đọc từ đệm có đúng dạng tỷ giá `{ rate, updated }` không. */
export function isUsdVnd(v: unknown): v is { rate: number; updated: number } {
  const r = v as { rate?: unknown; updated?: unknown } | null
  return !!r && typeof r.rate === 'number' && r.rate > 0 && typeof r.updated === 'number'
}
