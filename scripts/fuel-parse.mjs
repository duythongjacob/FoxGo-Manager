/**
 * Hàm thuần tách bảng giá xăng dầu (chép nguyên từ Fox.TàiChính FF-075 `app/scripts/fuel-parse.mjs`) — dùng cho
 * scripts/fuel-update.mjs. Tính năng: docs/features/thanh-thong-so.md.
 * Không phụ thuộc gì, không gọi mạng.
 */

/** Bỏ thẻ HTML + thực thể số (emoji), gom khoảng trắng → một dòng chữ. */
export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;|&#x[0-9a-f]+;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Bảng "Giá của Petrolimex" trên giaxanghomnay.com (SSR): cột Xăng/dầu · Tăng giảm · Tăng giảm kỳ trước · Giá vùng 1 · Giá vùng 2.
 * Quét từ "Giá vùng 1 Giá vùng 2" tới "Giá của Petrolimex cập nhật"; mỗi dòng = tên (lười) + 2 số tăng giảm + 2 giá
 * (giá luôn có dấu phẩy nghìn, không âm → không nhầm với "Mức 3", "RON 95" trong tên).
 * @returns {{ priceDate: string | null, items: { name: string, region1: number, region2: number | null, unit: string }[] }}
 */
export function parseGxhnText(text) {
  const HEAD = 'Giá vùng 1 Giá vùng 2'
  const start = text.indexOf(HEAD)
  if (start < 0) return { priceDate: null, items: [] }
  const endIdx = text.indexOf('Giá của Petrolimex cập nhật', start)
  const seg = text
    .slice(start + HEAD.length, endIdx < 0 ? start + 2000 : endIdx)
    .replace(/giaxanghomnay\.com/g, ' ')
  const ROW =
    /(.+?)\s(-?\d{1,3}(?:,\d{3})*)\s(-?\d{1,3}(?:,\d{3})*)\s(\d{1,3},\d{3})\s(\d{1,3},\d{3})(?=\s|$)/g
  const items = []
  for (const m of seg.matchAll(ROW)) {
    const name = m[1].trim()
    const r1 = parseInt(m[4].replace(/,/g, ''), 10)
    const r2 = parseInt(m[5].replace(/,/g, ''), 10)
    if (name && r1 >= 1000)
      items.push({ name, region1: r1, region2: r2 >= 1000 ? r2 : null, unit: 'VND/lít' })
  }
  // ngày điều chỉnh: "Lịch sử thay đổi giá xăng dầu … Ngày 12/11/2026"; dự phòng: "Giá của Petrolimex cập nhật 2026-11-14"
  let priceDate = null
  const m = text.match(/Lịch sử thay đổi giá xăng dầu[^0-9]{0,40}(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) priceDate = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  else {
    const u = text.match(/Giá của Petrolimex cập nhật (\d{4}-\d{2}-\d{2})/)
    if (u) priceDate = u[1]
  }
  return { priceDate, items }
}
