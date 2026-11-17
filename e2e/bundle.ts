/**
 * FD-014: phân tích bản build `dist-perf/` cho bài đo tốc độ (load.perf.ts) — chạy trong Node, không phải trình duyệt.
 * Mỗi file JS/CSS: kích thước gốc + gzip (≈ số byte tải qua mạng trên Firebase Hosting), và với JS: chia byte đã nén
 * nhỏ (minify) theo thư viện nguồn bằng source map (build với --sourcemap) — để chỉ ra chunk nào nặng vì gói nào.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

/** Thư mục build riêng cho đo tốc độ (playwright.perf.config.ts). */
export const DIST = fileURLToPath(new URL('../dist-perf', import.meta.url))

export interface FileStat {
  /** Đường dẫn trên web, VD "/assets/index-abc.js" */
  url: string
  raw: number
  gzip: number
  /** JS: byte (đã minify) theo gói — "antd", "react-dom", "motion", "(app)" = mã của mình */
  packages?: Record<string, number>
}

/** Gói npm của một đường dẫn nguồn trong source map ("…/node_modules/@ant-design/icons/…" → "@ant-design/icons"). */
function packageOf(source: string): string {
  const i = source.lastIndexOf('node_modules/')
  if (i < 0) return '(app)'
  const parts = source.slice(i + 'node_modules/'.length).split('/')
  const name = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
  // gom các gói nội bộ của antd (rc-*, @rc-component/*) vào "antd" cho dễ đọc
  if (/^(rc-|@rc-component\/|@ant-design\/(cssinjs|colors|fast-color))/.test(name)) return 'antd'
  if (name === 'framer-motion' || name === 'motion-dom' || name === 'motion-utils') return 'motion'
  return name
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** Giải mã một đoạn VLQ base64 của source map → mảng số. */
function decodeVlq(seg: string): number[] {
  const out: number[] = []
  let value = 0
  let shift = 0
  for (const ch of seg) {
    const d = B64.indexOf(ch)
    value += (d & 31) << shift
    if (d & 32) shift += 5
    else {
      out.push(value & 1 ? -(value >> 1) : value >> 1)
      value = 0
      shift = 0
    }
  }
  return out
}

/**
 * Chia byte của file JS đã minify theo gói nguồn: mỗi đoạn mapping trong source map "sở hữu" các ký tự từ cột của nó
 * tới cột của đoạn kế tiếp trên cùng dòng. Đủ chính xác để so sánh gói nặng nhẹ (không cần thư viện ngoài).
 */
function attribute(code: string, map: { sources: string[]; mappings: string }): Record<string, number> {
  const lines = code.split('\n')
  const out: Record<string, number> = {}
  let src = 0
  map.mappings.split(';').forEach((line, li) => {
    const len = lines[li]?.length ?? 0
    let col = 0
    const segs = line ? line.split(',').map(decodeVlq) : []
    const cols: { col: number; src: number | null }[] = []
    for (const s of segs) {
      col += s[0]
      if (s.length >= 4) src += s[1]
      cols.push({ col, src: s.length >= 4 ? src : null })
    }
    cols.forEach((c, i) => {
      const end = i + 1 < cols.length ? cols[i + 1].col : len
      const name = c.src === null ? '(khác)' : packageOf(map.sources[c.src] ?? '')
      out[name] = (out[name] ?? 0) + Math.max(0, end - c.col)
    })
  })
  return out
}

/** Kích thước 1 file trong bản build theo đường dẫn web; null nếu không có (VD request bị chặn). */
export function fileStat(url: string): FileStat | null {
  const p = path.join(DIST, decodeURIComponent(new URL(url, 'http://x').pathname))
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) return null
  const buf = fs.readFileSync(p)
  const stat: FileStat = {
    url: new URL(url, 'http://x').pathname,
    raw: buf.length,
    gzip: zlib.gzipSync(buf).length,
  }
  if (p.endsWith('.js') && fs.existsSync(`${p}.map`)) {
    stat.packages = attribute(buf.toString('utf8'), JSON.parse(fs.readFileSync(`${p}.map`, 'utf8')))
  }
  return stat
}

/** Mọi file JS/CSS trong dist-perf/assets (kể cả chunk nạp lười chưa tải) — bảng tổng quan bundle. */
export function allAssets(): FileStat[] {
  const dir = path.join(DIST, 'assets')
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(js|css)$/.test(f))
    .map((f) => fileStat(`/assets/${f}`)!)
    .sort((a, b) => b.gzip - a.gzip)
}

/** "123.4 kB" */
export const kb = (n: number) => `${(n / 1000).toFixed(1)} kB`

/** Gói chiếm nhiều nhất trong một chunk: "antd 62% · react-dom 21% · (app) 9%". */
export function topPackages(s: FileStat, n = 4): string {
  if (!s.packages) return ''
  const total = Object.values(s.packages).reduce((a, b) => a + b, 0) || 1
  return Object.entries(s.packages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k} ${Math.round((v / total) * 100)}%`)
    .join(' · ')
}
