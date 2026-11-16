#!/usr/bin/env node
/**
 * Chặn deploy production (https://foxgo.web.app) nếu: không ở nhánh chính, FoxGo_Manager còn thay đổi chưa commit,
 * hoặc HEAD chưa có tag fd-vX.Y.Z khớp package.json. Chạy đầu `npm run deploy`. Xem docs/QUY_TRINH.md mục 5.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const MAIN_BRANCHES = ['master', 'main']
const sh = (c) => execSync(c, { encoding: 'utf8' }).trim()
const fail = (m) => {
  console.error(
    `✖ Không deploy: ${m}\n  Quy trình: gộp vào nhánh chính → npm run release -- <patch|minor|major> → npm run deploy`,
  )
  process.exit(1)
}

const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const branch = sh('git rev-parse --abbrev-ref HEAD')
if (!MAIN_BRANCHES.includes(branch))
  fail(`đang ở nhánh "${branch}", chỉ deploy từ ${MAIN_BRANCHES.join('/')}`)
if (sh('git status --porcelain -- .')) fail('FoxGo_Manager còn thay đổi chưa commit')
const tags = sh('git tag --points-at HEAD').split('\n').filter(Boolean)
if (!tags.includes(`fd-v${version}`)) fail(`HEAD chưa có tag fd-v${version} (chưa chạy npm run release)`)
console.log(`✔ Deploy FoxGo Manager v${version} từ ${branch}`)
