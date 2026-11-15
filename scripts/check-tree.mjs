#!/usr/bin/env node
/**
 * Kiểm tra docs/CAU_TRUC_THU_MUC.md khớp thư mục thật của app (chép từ Fox.TàiChính `app/scripts/check-tree.mjs`):
 *  - thư mục có trên đĩa mà chưa có dòng trong bảng → lỗi (quên ghi chú)
 *  - dòng trong bảng mà thư mục không còn → lỗi (ghi chú cũ)
 * Chỉ đọc TÊN thư mục, không đọc nội dung file. Dòng bảng dạng: | `duong/dan/` | ... |  (`*` = tên bất kỳ)
 * Chạy: `npm run check:tree` (nằm trong `npm run check`).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Gốc app = thư mục cha của scripts/ */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DOC = join(ROOT, 'docs', 'CAU_TRUC_THU_MUC.md')
/** Thư mục sinh tự động / công cụ — không cần ghi chú */
const IGNORE = new Set([
  'node_modules',
  'dist',
  '.git',
  '.firebase',
  'coverage',
  '.vite',
  '.vscode',
  '.claude',
])

if (!existsSync(DOC)) {
  console.error('✗ Thiếu docs/CAU_TRUC_THU_MUC.md')
  process.exit(1)
}

const md = readFileSync(DOC, 'utf8')
const rows = [...md.matchAll(/^\|\s*`([^`]+\/)`\s*\|(.*)$/gm)]
const toRe = (p) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+') + '$')
// ⚙️ sinh tự động: không commit nên bản clone có thể không có → không báo "không còn"
const patterns = rows.map((m) => ({ p: m[1], re: toRe(m[1]), local: /⚙️/u.test(m[2]) }))

/** Liệt kê mọi thư mục con (đường dẫn tương đối, kết thúc bằng "/"). */
function walk(rel, out) {
  for (const d of readdirSync(join(ROOT, rel), { withFileTypes: true })) {
    if (!d.isDirectory() || IGNORE.has(d.name)) continue
    const path = `${rel ? rel + '/' : ''}${d.name}/`
    out.push(path)
    // mẫu có `*` = bên trong là dữ liệu tự sinh → không đi sâu
    const wild = patterns.some((x) => x.p.includes('*') && x.re.test(path))
    if (!wild) walk(path.slice(0, -1), out)
  }
  return out
}

const dirs = walk('', [])
const missing = dirs.filter((d) => !patterns.some((x) => x.re.test(d)))
const stale = patterns.filter((x) => !x.local && !dirs.some((d) => x.re.test(d))).map((x) => x.p)

if (missing.length || stale.length) {
  console.error('✗ docs/CAU_TRUC_THU_MUC.md chưa khớp thư mục thật:')
  for (const d of missing)
    console.error(`  + thiếu ghi chú: ${d}   → thêm dòng | \`${d}\` | chức năng | ghi chú | và cập nhật cây`)
  for (const d of stale) console.error(`  - thư mục không còn: ${d}   → xóa dòng khỏi bảng và cây`)
  process.exit(1)
}
console.log(`✓ Cấu trúc thư mục: ${dirs.length} thư mục đều có ghi chú (${rows.length} dòng)`)
