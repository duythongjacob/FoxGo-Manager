/**
 * FD-014: hàm dùng chung cho test trình duyệt (Playwright) — chặn dịch vụ ngoài bằng dữ liệu mẫu, gom lỗi console,
 * mở trang, các phép đo bố cục. Tài liệu: docs/features/test-giao-dien.md.
 * Đo bằng getBoundingClientRect trong trình duyệt (không so ảnh pixel → không vỡ khi đổi màu / chữ / giá).
 */
import { expect, type Page, type Route, type TestInfo } from '@playwright/test'

/** Ba dịch vụ ngoài được duyệt (CLAUDE.md, src/data/external.ts). Mọi host khác ngoài localhost đều bị chặn. */
export const API = {
  weather: /^https:\/\/api\.open-meteo\.com\//,
  market: /^https:\/\/api\.coingecko\.com\//,
  usdvnd: /^https:\/\/open\.er-api\.com\//,
} as const

/** Ngày YYYY-MM-DD theo giờ máy, cộng `plus` ngày — dự báo mẫu luôn bắt đầu từ hôm nay. */
const isoDay = (plus = 0) => {
  const d = new Date(Date.now() + plus * 86_400_000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Phản hồi mẫu (đúng định dạng thật, số liệu bịa) — kiểm bằng hàm parse trong src/lib/weather.ts, market.ts. */
export const FIXTURES = {
  weather: () => ({
    current: {
      temperature_2m: 27.4,
      apparent_temperature: 29.1,
      relative_humidity_2m: 70,
      weather_code: 2,
      wind_speed_10m: 9,
      is_day: 1,
    },
    daily: {
      time: [isoDay(0), isoDay(1), isoDay(2)],
      temperature_2m_max: [31, 30, 29],
      temperature_2m_min: [23, 22, 22],
      weather_code: [2, 61, 3],
      precipitation_probability_max: [10, 60, 20],
    },
  }),
  market: () => ({
    bitcoin: { usd: 97250, vnd: 2_470_000_000, usd_24h_change: 1.23, last_updated_at: 1_763_300_000 },
    'pax-gold': { usd: 2650, vnd: 67_300_000, usd_24h_change: -0.4, last_updated_at: 1_763_300_000 },
  }),
  usdvnd: () => ({ result: 'success', rates: { VND: 25_400 }, time_last_update_unix: 1_763_250_000 }),
}

/** Cách dịch vụ ngoài trả lời trong test: dữ liệu mẫu (mặc định), lỗi HTTP 500, hoặc mất mạng. */
export type ApiMode = 'ok' | 'error' | 'offline'

export interface NetLog {
  /** URL dịch vụ ngoài trình duyệt đã gọi (đã chặn, trả dữ liệu mẫu) */
  api: string[]
  /** Request tới host lạ (không phải localhost / 3 dịch vụ duyệt) — phải luôn rỗng: không analytics, không CDN */
  foreign: string[]
}

/**
 * Chặn toàn bộ mạng ra ngoài: 3 dịch vụ duyệt trả dữ liệu mẫu (hoặc lỗi theo `mode`), host lạ bị hủy và ghi lại.
 * Gọi TRƯỚC page.goto. Test chạy được khi không có mạng, số liệu luôn giống nhau.
 */
export async function stubNetwork(
  page: Page,
  mode: ApiMode | Partial<Record<keyof typeof API, ApiMode>> = 'ok',
) {
  const log: NetLog = { api: [], foreign: [] }
  const modeOf = (k: keyof typeof API): ApiMode => (typeof mode === 'string' ? mode : (mode[k] ?? 'ok'))
  await page.route(
    (url) => !/^(localhost|127\.0\.0\.1)$/.test(url.hostname),
    async (route: Route) => {
      const url = route.request().url()
      const key = (Object.keys(API) as (keyof typeof API)[]).find((k) => API[k].test(url))
      if (!key) {
        log.foreign.push(url)
        return route.abort('blockedbyclient')
      }
      log.api.push(url)
      const m = modeOf(key)
      if (m === 'offline') return route.abort('internetdisconnected')
      if (m === 'error') return route.fulfill({ status: 500, body: 'lỗi giả' })
      // CORS: trang ở localhost gọi sang host khác → phải có Access-Control-Allow-Origin như dịch vụ thật
      return route.fulfill({
        json: FIXTURES[key](),
        headers: { 'access-control-allow-origin': '*' },
      })
    },
  )
  return log
}

/** Lỗi console / lỗi JS chưa bắt trong lúc chạy test (gắn bằng watchErrors trước khi mở trang). */
export function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() !== 'error' && m.type() !== 'warning') return
    const t = m.text()
    // request bị chặn có chủ đích (host lạ, test mất mạng) không phải lỗi giao diện
    if (/Failed to load resource|net::ERR_/.test(t)) return
    // cảnh báo của chính Vite dev server / React DevTools — không có ở bản build
    if (/\[vite\]|Download the React DevTools/.test(t)) return
    errors.push(`${m.type()}: ${t}`)
  })
  return errors
}

/** Đường dẫn hash của các trang (src/lib/route.ts) — thêm trang mới thì thêm ở đây. */
export const PAGES = [
  { id: 'home', path: '/', name: 'trang-chu' },
  { id: 'about', path: '/gioi-thieu', name: 'gioi-thieu' },
] as const

/**
 * Mở trang chủ và chờ vẽ xong: có ô app, thanh thông số đã có giờ, phông chữ đã tải.
 * Dịch vụ ngoài phải được chặn trước (stubNetwork).
 */
export async function openHome(page: Page) {
  await page.goto('/#/')
  await expect(page.locator('.lc-tiles .lc-tile').first()).toBeVisible({ timeout: 20_000 })
  await page.evaluate(() => document.fonts.ready)
  // hiệu ứng vào trang (CSS) + line vẽ dần
  await page.waitForTimeout(400)
}

/** Mở trang Giới thiệu, chờ màn chờ (Preloader) biến mất khỏi DOM và tiêu đề Hero hiện. */
export async function openAbout(page: Page, anchor?: string) {
  await page.goto(`/#/gioi-thieu${anchor ? `/${anchor}` : ''}`)
  await expect(page.locator('#h-hero')).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('.pl-root')).toHaveCount(0, { timeout: 10_000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
}

/** Mở trang theo id trong PAGES. */
export const openPage = (page: Page, id: (typeof PAGES)[number]['id']) =>
  id === 'home' ? openHome(page) : openAbout(page)

/**
 * Cuộn hết trang từ trên xuống (từng màn) để mọi hiệu ứng "hiện khi vào màn" chạy, rồi về đầu — để ảnh chụp cả trang
 * và phép đo tràn ngang thấy đủ nội dung của trang Giới thiệu.
 */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.round(innerHeight * 0.8))
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    scrollTo(0, document.documentElement.scrollHeight)
    await new Promise((r) => setTimeout(r, 400))
  })
}

/** Chụp cả trang, đính vào báo cáo HTML (xem lại bằng mắt: npm run e2e:report). */
export async function snap(page: Page, info: TestInfo, name: string, fullPage = true) {
  const body = await page.screenshot({ fullPage, animations: 'disabled' })
  await info.attach(name, { body, contentType: 'image/png' })
}

/** Trang không được rộng hơn khung nhìn (lỗi "tràn mép phải" trên điện thoại). Trả về phần tử gây tràn để dễ sửa. */
export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const w = document.documentElement.clientWidth
    if (document.documentElement.scrollWidth <= w + 1) return null
    const culprits: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width && r.right > w + 1 && getComputedStyle(el).position !== 'fixed') {
        // chỉ lấy phần tử ngoài cùng gây tràn (cha không tràn)
        const pr = el.parentElement?.getBoundingClientRect()
        if (!pr || pr.right <= w + 1)
          culprits.push(
            `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} → ${Math.round(r.right)}px`,
          )
      }
    }
    return { scrollWidth: document.documentElement.scrollWidth, width: w, culprits: culprits.slice(0, 5) }
  })
}

/**
 * Tiêu đề bị ép: xuống dòng trong khi rộng < minPx, hoặc xuống quá maxLines dòng.
 * Tiêu đề ngắn nằm gọn 1 dòng không tính.
 */
export async function squeezedHeadings(page: Page, minPx = 90, maxLines = 4) {
  return page.evaluate(
    ({ minPx, maxLines }) => {
      const out: string[] = []
      for (const el of document.querySelectorAll<HTMLElement>('main h1, main h2, main h3')) {
        const r = el.getBoundingClientRect()
        const text = (el.textContent ?? '').trim()
        if (!r.width || text.length < 8) continue
        const lh =
          parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3
        const lines = Math.round(r.height / lh)
        if ((lines >= 2 && r.width < minPx) || lines > maxLines)
          out.push(`"${text.slice(0, 40)}" rộng ${Math.round(r.width)}px, ${lines} dòng`)
      }
      return out
    },
    { minPx, maxLines },
  )
}

/** Phần tử (đang hiện) chồng lên nhau trong `selector` — VD hai ô app đè nhau trên màn hẹp. */
export async function overlapping(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const boxes = [...document.querySelectorAll<HTMLElement>(sel)]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter((b) => b.r.width > 0 && b.r.height > 0)
    const out: string[] = []
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].r
        const b = boxes[j].r
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (x > 2 && y > 2)
          out.push(`"${boxes[i].el.textContent?.slice(0, 20)}" đè "${boxes[j].el.textContent?.slice(0, 20)}"`)
      }
    return out
  }, selector)
}

/** Đọc localStorage của trang (đã JSON.parse nếu được). */
export async function storage(page: Page, key: string): Promise<unknown> {
  return page.evaluate((k) => {
    const v = localStorage.getItem(k)
    try {
      return v === null ? null : JSON.parse(v)
    } catch {
      return v
    }
  }, key)
}

/**
 * Ghi sẵn localStorage rồi tải lại trang — mô phỏng người dùng đã có dữ liệu cũ (hoặc dữ liệu bị sửa hỏng).
 * Phải đang ở trang cùng origin (đã page.goto) trước khi gọi.
 */
export async function seedStorage(page: Page, entries: Record<string, string>) {
  await page.evaluate((e) => {
    localStorage.clear()
    for (const [k, v] of Object.entries(e)) localStorage.setItem(k, v)
  }, entries)
}

/**
 * Mở popup Cài đặt trang chủ. Điện thoại: nút Cài đặt nằm trong thanh thông số đang thu (ẩn) → mở thanh trước.
 * @returns locator của popup
 */
export async function openSettings(page: Page) {
  const btn = page.getByRole('button', { name: 'Cài đặt trang chủ' })
  if (!(await btn.isVisible())) await page.locator('.dk-toggle').click()
  await btn.click()
  const modal = page.locator('.st-modal')
  await expect(modal).toBeVisible()
  return modal
}
