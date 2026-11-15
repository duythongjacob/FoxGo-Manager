#!/usr/bin/env node
/**
 * Giá xăng dầu bán lẻ Petrolimex (vùng 1 / vùng 2) → src/data/fuel.json, đóng gói cùng trang
 * (cách làm giống Fox.TàiChính FF-075 `app/scripts/fuel-update.mjs`, bỏ nhánh vietfuel-api).
 *
 *   npm run fuel:update
 *
 * Nguồn: giaxanghomnay.com — trang công khai (SSR), bảng "Giá của Petrolimex". Chỉ GET trang này, không gửi gì khác.
 * Trình duyệt KHÔNG gọi trang nào — chỉ đọc snapshot trong bundle. Lỗi → giữ bản cũ.
 * Giá chỉ đổi theo kỳ điều hành (thường thứ Năm hằng tuần) → chạy trước mỗi lần deploy là đủ.
 * Tính năng: docs/features/thanh-thong-so.md.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { htmlToText, parseGxhnText } from './fuel-parse.mjs'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(APP, 'src', 'data', 'fuel.json')
/** Chuỗi trình duyệt phổ thông như Fox.TàiChính (trang SSR dành cho trình duyệt) — không chứa thông tin cá nhân. */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const ctl = new AbortController()
const timer = setTimeout(() => ctl.abort(), 30_000)
let html
try {
  const res = await fetch('https://giaxanghomnay.com', {
    signal: ctl.signal,
    headers: { 'User-Agent': UA, 'Accept-Language': 'vi-VN,vi;q=0.9' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  html = await res.text()
} finally {
  clearTimeout(timer)
}

const { priceDate, items } = parseGxhnText(htmlToText(html))
if (!items.length) {
  console.error('✗ không tìm thấy bảng Petrolimex trên giaxanghomnay.com — giữ src/data/fuel.json cũ')
  process.exit(1)
}
const date = priceDate ?? new Date().toISOString().slice(0, 10)
if (!priceDate) console.warn('⚠ không đọc được ngày điều chỉnh — dùng ngày hôm nay')
const out = {
  source: 'Petrolimex (giaxanghomnay.com)',
  priceDate: date,
  fetchedAt: new Date().toISOString(),
  items,
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(`✔ ${out.source} · giá từ ${date} · ${items.length} mặt hàng → src/data/fuel.json`)
for (const it of items)
  console.log(
    `  ${it.name.padEnd(28)} ${String(it.region1).padStart(7)}  ${String(it.region2 ?? '-').padStart(7)}`,
  )
