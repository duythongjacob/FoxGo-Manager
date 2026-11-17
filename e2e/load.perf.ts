/**
 * FD-014: tốc độ tải trang trên bản build production (`npm run e2e:perf`, cấu hình playwright.perf.config.ts).
 * Trang chủ là trang mở đầu trình duyệt → phải nhanh: đo DOMContentLoaded, load, FCP, LCP, lúc hiện nội dung, thời
 * gian màn chờ (trang Giới thiệu), số byte JS/CSS/font tải về — so với ngân sách (BUDGET) và in bảng tổng kết.
 * Mỗi trang đo RUNS lần, bộ đệm trình duyệt xóa trước mỗi lần (lần đầu vào), lấy trung vị cho ổn định.
 * Điện thoại: CPU chậm 4× + mạng 4G (giống Lighthouse mobile ở mức nhẹ hơn). Dịch vụ ngoài bị chặn (dữ liệu mẫu).
 */
import { expect, test, type CDPSession, type Page } from '@playwright/test'
import { allAssets, fileStat, kb, topPackages, type FileStat } from './bundle'
import { stubNetwork } from './helpers'

/** Số lần đo mỗi trang (lấy trung vị). */
const RUNS = 5

/** Mạng 4G giả lập cho khung điện thoại: 40 ms trễ, 9 Mbit/s tải xuống, 1,5 Mbit/s tải lên. */
const MOBILE_NET = {
  offline: false,
  latency: 40,
  downloadThroughput: (9e6 / 8) | 0,
  uploadThroughput: (1.5e6 / 8) | 0,
}
/** CPU điện thoại tầm trung ≈ chậm hơn máy tính 4 lần. */
const MOBILE_CPU = 4

interface Budget {
  /** ms */
  dcl: number
  load: number
  fcp: number
  lcp: number
  /** ms tới lúc nội dung chính dùng được (ô app / tiêu đề Hero + màn chờ đã gỡ khỏi trang) */
  content: number
  /** ms màn chờ (Preloader) hiện trên màn hình — gồm cả 500 ms mờ dần */
  preloader: number
  /** byte JS tải lúc vào trang (đã nén gzip/brotli khi truyền) */
  js: number
  css: number
  font: number
}

/**
 * Ngân sách — chặt nhưng chừa ~30–50% so với số đo thật lúc viết (17/11/2026, máy anh) để không đỏ vì máy bận.
 * Số đo lúc viết (trung vị): trang chủ máy tính FCP 304 / nội dung 82 ms, điện thoại FCP 940 / nội dung 663 ms;
 * Giới thiệu máy tính nội dung 1549 ms (màn chờ 1462), điện thoại 3533 ms (màn chờ 2918). JS 225 / 279 kB.
 * Trang chủ chặt hơn trang Giới thiệu (Giới thiệu cố ý có màn chờ ≥ 700 ms + 500 ms mờ dần và nạp thêm `motion`).
 */
const BUDGET: Record<'may-tinh' | 'dien-thoai', Record<'home' | 'about', Budget>> = {
  'may-tinh': {
    home: {
      dcl: 300,
      load: 400,
      fcp: 600,
      lcp: 800,
      content: 400,
      preloader: 0,
      js: 260_000,
      css: 12_000,
      font: 200_000,
    },
    about: {
      dcl: 300,
      load: 400,
      fcp: 500,
      lcp: 1800,
      content: 2200,
      preloader: 2000,
      js: 320_000,
      css: 22_000,
      font: 230_000,
    },
  },
  'dien-thoai': {
    home: {
      dcl: 900,
      load: 1000,
      fcp: 1500,
      lcp: 1500,
      content: 1200,
      preloader: 0,
      js: 260_000,
      css: 12_000,
      font: 200_000,
    },
    about: {
      dcl: 900,
      load: 1000,
      fcp: 1200,
      lcp: 4500,
      content: 4800,
      preloader: 4000,
      js: 320_000,
      css: 22_000,
      font: 230_000,
    },
  },
}

/** Chunk JS nào gzip lớn hơn mức này thì đánh dấu "nặng" trong bảng. */
const BIG_CHUNK = 100_000

/** Trang đo: đường dẫn + bộ chọn "nội dung chính đã hiện". */
const TARGETS = [
  { id: 'home', name: 'Trang chủ', path: '/#/', ready: '.lc-tiles .lc-tile' },
  { id: 'about', name: 'Giới thiệu', path: '/#/gioi-thieu', ready: '#h-hero' },
] as const

interface Sample {
  ttfb: number
  dcl: number
  load: number
  fcp: number
  lcp: number
  content: number
  /** ms màn chờ hiện trên màn hình (0 = không có) */
  preloader: number
  /** byte truyền qua mạng theo loại (transferSize, đã nén) */
  bytes: Record<'js' | 'css' | 'font' | 'img' | 'other', number>
  requests: number
  resources: string[]
}

/**
 * Gắn trước khi trang chạy: ghi LCP, lúc phần tử `ready` xuất hiện, lúc màn chờ (.pl-root) hiện / biến mất.
 * Dùng MutationObserver trên `document` (init script chạy trước khi có <html>).
 */
function instrument(ready: string) {
  const w = window as unknown as { __fd: Record<string, number | null> }
  w.__fd = { lcp: 0, content: null, plOn: null, plOff: null }
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) w.__fd.lcp = e.startTime
  }).observe({ type: 'largest-contentful-paint', buffered: true })
  const check = () => {
    const now = performance.now()
    const pl = document.querySelector('.pl-root')
    if (pl && w.__fd.plOn === null) w.__fd.plOn = now
    if (!pl && w.__fd.plOn !== null && w.__fd.plOff === null) w.__fd.plOff = now
    // nội dung "dùng được": phần tử chính đã có VÀ không còn màn chờ che
    if (w.__fd.content === null && document.querySelector(ready) && !pl) w.__fd.content = now
  }
  new MutationObserver(check).observe(document, { childList: true, subtree: true })
}

/** Xóa bộ đệm + cookie/localStorage → mô phỏng lần đầu vào trang. */
async function coldStart(page: Page, cdp: CDPSession) {
  await page.goto('about:blank')
  await cdp.send('Network.clearBrowserCache')
  await page.context().clearCookies()
}

async function measure(page: Page, cdp: CDPSession, t: (typeof TARGETS)[number]): Promise<Sample> {
  await coldStart(page, cdp)
  await page.goto(t.path, { waitUntil: 'load' })
  await page.waitForFunction(
    () => (window as unknown as { __fd: { content: number | null } }).__fd.content !== null,
    null,
    {
      timeout: 30_000,
    },
  )
  // LCP chốt khi có tương tác hoặc ẩn trang; chờ thêm một nhịp cho ứng viên cuối
  await page.waitForTimeout(500)
  const s = await page.evaluate(() => {
    const fd = (window as unknown as { __fd: Record<string, number> }).__fd
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
    const bytes = { js: 0, css: 0, font: 0, img: 0, other: 0 }
    const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const resources: string[] = []
    for (const r of res) {
      if (new URL(r.name).origin !== location.origin) continue
      resources.push(r.name)
      const k = /\.js(\?|$)/.test(r.name)
        ? 'js'
        : /\.css(\?|$)/.test(r.name)
          ? 'css'
          : /\.woff2?(\?|$)/.test(r.name)
            ? 'font'
            : /\.(svg|png|jpe?g|webp|avif)(\?|$)/.test(r.name)
              ? 'img'
              : 'other'
      bytes[k] += r.transferSize
    }
    bytes.other += nav.transferSize
    return {
      ttfb: nav.responseStart,
      dcl: nav.domContentLoadedEventEnd,
      load: nav.loadEventEnd,
      fcp,
      lcp: fd.lcp,
      content: fd.content,
      preloader: fd.plOn !== null && fd.plOff !== null ? fd.plOff - fd.plOn : 0,
      bytes,
      requests: resources.length + 1,
      resources,
    }
  })
  return s
}

const median = (xs: number[]) => {
  const a = [...xs].sort((x, y) => x - y)
  return a[Math.floor(a.length / 2)]
}
const ms = (n: number) => `${Math.round(n)} ms`

for (const t of TARGETS) {
  test(`tốc độ tải ${t.name}`, async ({ page }, info) => {
    const project = info.project.name as keyof typeof BUDGET
    const budget = BUDGET[project][t.id]
    await stubNetwork(page)
    await page.addInitScript(instrument, t.ready)
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Network.enable')
    if (project === 'dien-thoai') {
      await cdp.send('Network.emulateNetworkConditions', MOBILE_NET)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: MOBILE_CPU })
    }

    // lần làm nóng: preview server nén + đệm file lần đầu, không tính
    await measure(page, cdp, t)
    const samples: Sample[] = []
    for (let i = 0; i < RUNS; i++) samples.push(await measure(page, cdp, t))

    const pick = (f: (s: Sample) => number) => median(samples.map(f))
    const m = {
      ttfb: pick((s) => s.ttfb),
      dcl: pick((s) => s.dcl),
      load: pick((s) => s.load),
      fcp: pick((s) => s.fcp),
      lcp: pick((s) => s.lcp),
      content: pick((s) => s.content),
      preloader: pick((s) => s.preloader),
      js: pick((s) => s.bytes.js),
      css: pick((s) => s.bytes.css),
      font: pick((s) => s.bytes.font),
      img: pick((s) => s.bytes.img),
      requests: pick((s) => s.requests),
    }

    // lần vào lại (có bộ đệm trình duyệt) — trang chủ được mở nhiều lần mỗi ngày
    await page.goto(t.path, { waitUntil: 'load' })
    await page.reload({ waitUntil: 'load' })
    await page.waitForFunction(
      () => (window as unknown as { __fd: { content: number | null } }).__fd.content !== null,
    )
    const warm = await page.evaluate(() => (window as unknown as { __fd: { content: number } }).__fd.content)

    // file JS/CSS đã tải, kèm gzip + gói chiếm nhiều nhất (từ source map)
    const loaded = [...new Set(samples[0].resources)]
      .map((u) => fileStat(u))
      .filter((f): f is FileStat => !!f && /\.(js|css)$/.test(f.url))
      .sort((a, b) => b.gzip - a.gzip)

    const rows: [string, string, string][] = [
      ['TTFB', ms(m.ttfb), '—'],
      ['DOMContentLoaded', ms(m.dcl), `≤ ${budget.dcl} ms`],
      ['load', ms(m.load), `≤ ${budget.load} ms`],
      ['First Contentful Paint', ms(m.fcp), `≤ ${budget.fcp} ms`],
      ['Largest Contentful Paint', ms(m.lcp), `≤ ${budget.lcp} ms`],
      ['Hiện nội dung chính', ms(m.content), `≤ ${budget.content} ms`],
      [
        'Màn chờ hiện',
        m.preloader ? ms(m.preloader) : 'không có',
        budget.preloader ? `≤ ${budget.preloader} ms` : 'không được có',
      ],
      ['Vào lại (có bộ đệm)', ms(warm), '—'],
      ['JS tải về (nén)', kb(m.js), `≤ ${kb(budget.js)}`],
      ['CSS tải về (nén)', kb(m.css), `≤ ${kb(budget.css)}`],
      ['Font', kb(m.font), `≤ ${kb(budget.font)}`],
      ['Ảnh', kb(m.img), '—'],
      ['Số request', String(m.requests), '—'],
    ]
    const table =
      `${t.name} — ${project}${project === 'dien-thoai' ? ` (CPU ÷${MOBILE_CPU}, 4G)` : ''} — trung vị ${RUNS} lần\n` +
      rows.map(([a, b, c]) => `  ${a.padEnd(26)} ${b.padStart(10)}   ${c}`).join('\n') +
      '\n  File đã tải (gzip / gốc — gói chiếm nhiều nhất):\n' +
      loaded
        .map(
          (f) =>
            `  ${f.gzip > BIG_CHUNK ? '⚠ ' : '  '}${f.url.padEnd(44)} ${kb(f.gzip).padStart(9)} / ${kb(f.raw).padStart(9)}  ${topPackages(f)}`,
        )
        .join('\n')
    console.log(`\n${table}\n`)
    await info.attach(`toc-do-${t.id}.txt`, { body: table, contentType: 'text/plain' })
    await info.attach(`toc-do-${t.id}.json`, {
      body: JSON.stringify({ median: m, warm, samples }, null, 2),
      contentType: 'application/json',
    })

    expect.soft(m.dcl, 'DOMContentLoaded').toBeLessThanOrEqual(budget.dcl)
    expect.soft(m.load, 'load').toBeLessThanOrEqual(budget.load)
    expect.soft(m.fcp, 'FCP').toBeLessThanOrEqual(budget.fcp)
    expect.soft(m.lcp, 'LCP').toBeLessThanOrEqual(budget.lcp)
    expect.soft(m.content, 'hiện nội dung chính').toBeLessThanOrEqual(budget.content)
    expect.soft(m.js, 'byte JS').toBeLessThanOrEqual(budget.js)
    expect.soft(m.css, 'byte CSS').toBeLessThanOrEqual(budget.css)
    expect.soft(m.font, 'byte font').toBeLessThanOrEqual(budget.font)
    expect.soft(m.preloader, 'màn chờ').toBeLessThanOrEqual(budget.preloader)
    if (t.id === 'home') {
      // trang chủ không được kéo theo mã trang Giới thiệu / thư viện motion (nạp lười)
      const motion = loaded.filter((f) => (f.packages?.motion ?? 0) > 1000).map((f) => f.url)
      expect.soft(motion, 'trang chủ tải thư viện motion').toEqual([])
    }
  })
}

// Playwright bắt buộc tham số đầu là mẫu tách {} (đọc tên fixture) — test này không cần fixture nào
// eslint-disable-next-line no-empty-pattern
test('tổng quan bundle (mọi chunk JS/CSS)', async ({}, info) => {
  test.skip(info.project.name !== 'may-tinh', 'bundle giống nhau ở mọi khung — chỉ in một lần')
  const assets = allAssets()
  const total = (re: RegExp) => assets.filter((a) => re.test(a.url)).reduce((s, a) => s + a.gzip, 0)
  const table =
    `Bundle dist-perf/assets — tổng JS ${kb(total(/\.js$/))} gzip, CSS ${kb(total(/\.css$/))} gzip\n` +
    assets
      .map(
        (f) =>
          `  ${f.gzip > BIG_CHUNK ? '⚠ ' : '  '}${f.url.padEnd(44)} ${kb(f.gzip).padStart(9)} / ${kb(f.raw).padStart(9)}  ${topPackages(f, 6)}`,
      )
      .join('\n')
  console.log(`\n${table}\n`)
  await info.attach('bundle.txt', { body: table, contentType: 'text/plain' })
  // không chunk nào vượt cảnh báo của Vite (chunkSizeWarningLimit 1500 kB gốc)
  for (const a of assets) expect.soft(a.raw, a.url).toBeLessThan(1_500_000)
})
