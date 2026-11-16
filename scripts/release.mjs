#!/usr/bin/env node
/**
 * Phát hành phiên bản mới FoxGo Manager:  npm run release -- <patch|minor|major>
 * Theo quy trình của Fox.TàiChính (FoxGo_Finance/app/scripts/release.mjs). Xem docs/QUY_TRINH.md mục 5.
 *  1. Kiểm tra: đang ở nhánh chính (master/main), thư mục FoxGo_Manager không còn thay đổi chưa commit,
 *     CHANGELOG có mục "Chưa phát hành" không trống.
 *  2. Lấy giá xăng kỳ mới nhất (npm run fuel:update — lỗi mạng thì giữ bản cũ), chạy npm run check + build.
 *  3. Tăng version (package.json + package-lock.json), chốt CHANGELOG thành "## [x.y.z] — ngày".
 *  4. Commit "chore(release): FD vX.Y.Z" + tag fd-vX.Y.Z.
 * Sau đó: npm run deploy.
 *
 * Vì sao tag có tiền tố "fd-": repo git là thư mục gốc FoxdotsProject (chung tài liệu, linh vật) — tiền tố cho biết
 * tag thuộc app nào, tránh lẫn nếu sau này repo gốc có phiên bản khác.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/** Nhánh được phép phát hành — repo gốc đang dùng master; chấp nhận cả main nếu sau này đổi tên. */
const MAIN_BRANCHES = ['master', 'main']
const HEAD = '## [Chưa phát hành]'

const sh = (cmd, opts = {}) => String(execSync(cmd, { cwd: APP, encoding: 'utf8', ...opts }) ?? '').trim()
const fail = (msg) => {
  console.error(`✖ ${msg}`)
  process.exit(1)
}

const kind = process.argv[2]
if (!['patch', 'minor', 'major'].includes(kind)) fail('Cách dùng: npm run release -- <patch|minor|major>')

// 1. Kiểm tra git & CHANGELOG
const branch = sh('git rev-parse --abbrev-ref HEAD')
if (!MAIN_BRANCHES.includes(branch))
  fail(
    `Phải phát hành từ nhánh chính (${MAIN_BRANCHES.join('/')}), đang ở "${branch}". Gộp nhánh tính năng trước.`,
  )
// Chỉ xét thư mục app (`-- .`): thay đổi ở ../docs hay ../Fox.Files không chặn phát hành Manager
if (sh('git status --porcelain -- .'))
  fail('FoxGo_Manager còn thay đổi chưa commit. Commit hoặc stash trước khi phát hành.')

const clPath = path.join(APP, 'CHANGELOG.md')
const cl = fs.readFileSync(clPath, 'utf8')
const start = cl.indexOf(HEAD)
if (start < 0) fail(`CHANGELOG.md thiếu mục "${HEAD}"`)
const after = start + HEAD.length
const next = cl.indexOf('\n## [', after)
const body = cl.slice(after, next < 0 ? undefined : next).trim()
if (!body || body.includes('_(chưa có thay đổi)_'))
  fail('Mục "Chưa phát hành" trong CHANGELOG đang trống — ghi lại thay đổi trước.')

// 2. Dữ liệu đóng gói + kiểm tra chất lượng
console.log('▶ npm run fuel:update')
try {
  sh('npm run fuel:update', { stdio: 'inherit' })
} catch {
  // Trang giá xăng lỗi/đổi định dạng không nên chặn phát hành — dùng snapshot đang có
  console.warn('⚠ Không lấy được giá xăng mới — giữ src/data/fuel.json hiện tại.')
}
console.log('▶ npm run check')
sh('npm run check', { stdio: 'inherit' })
console.log('▶ npm run build')
sh('npm run build', { stdio: 'inherit' })

// 3. Tăng version + chốt CHANGELOG
const pkgPath = path.join(APP, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const [ma, mi, pa] = pkg.version.split('.').map(Number)
const version =
  kind === 'major' ? `${ma + 1}.0.0` : kind === 'minor' ? `${ma}.${mi + 1}.0` : `${ma}.${mi}.${pa + 1}`
const tag = `fd-v${version}`
if (sh('git tag --list').split('\n').includes(tag)) fail(`Tag ${tag} đã tồn tại`)
pkg.version = version
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
const lockPath = path.join(APP, 'package-lock.json')
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
  lock.version = version
  if (lock.packages?.['']) lock.packages[''].version = version
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n')
}
const today = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD theo giờ máy
fs.writeFileSync(
  clPath,
  cl.slice(0, after) +
    `\n\n_(chưa có thay đổi)_\n\n## [${version}] — ${today}\n\n${body}\n` +
    (next < 0 ? '' : cl.slice(next)),
)

// 4. Commit + tag (kèm fuel.json nếu vừa cập nhật)
sh('git add package.json package-lock.json CHANGELOG.md src/data/fuel.json')
const msg = `chore(release): FD v${version}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
sh('git commit -q -F -', { input: msg })
sh(`git tag -a ${tag} -m "FoxGo Manager v${version}"`)
console.log(
  `\n✔ Đã phát hành FoxGo Manager v${version} (commit + tag ${tag}). Bước tiếp theo: npm run deploy`,
)
