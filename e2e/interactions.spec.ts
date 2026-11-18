/**
 * FD-014: thao tác trên trang — ô app trỏ đúng link (src/data/apps.ts), thanh thông số (mở/thu, dữ liệu mẫu, lỗi
 * mạng, chọn + tìm thành phố), popup Cài đặt (hủy, link sai bị chặn), màn chờ trang Giới thiệu, nút sáng/tối.
 * Lưu thiết lập qua tải lại trang: persistence.spec.ts.
 */
import { expect, test } from '@playwright/test'
import { APPS } from '../src/data/apps'
import { sortApps } from '../src/lib/apps'
import { openAbout, openHome, openSettings, stubNetwork, watchErrors } from './helpers'

/** Tên ô như trên trang chủ: "Fox.TàiChính" → "Tài Chính", "FoxGo Mind" → "Mind" (khớp tileName trong features/launcher/tiles.ts). */
const tileName = (name: string) =>
  name.replace(/^(Fox\.|FoxGo\s+)/, '').replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')

test.describe('ô app trên trang chủ', () => {
  test('đủ app, đúng thứ tự (mở được theo khai báo → kế hoạch), link đúng URL', async ({ page }) => {
    const errors = watchErrors(page)
    await stubNetwork(page)
    await openHome(page)

    const tiles = page.locator('.lc-tiles .lc-tile')
    const expected = sortApps(APPS)
    await expect(tiles).toHaveCount(expected.length)
    for (const [i, app] of expected.entries()) {
      const tile = tiles.nth(i)
      await expect(tile.locator('.lc-tile-name')).toHaveText(tileName(app.name))
      if (app.status !== 'planned' && app.url) {
        await expect(tile).toHaveAttribute('href', app.url)
        await expect(tile).toHaveAttribute('aria-label', `Mở ${app.name}`)
        // mặc định mở ngay tab này (Cài đặt → "Mở trong tab mới" tắt)
        await expect(tile).not.toHaveAttribute('target', /.*/)
        // chỉ link https công khai — không trỏ localhost (bản trên máy là link phụ `extra`)
        expect(app.url).toMatch(/^https:\/\/[a-z0-9-]+\.web\.app$/)
      } else {
        // app kế hoạch: không phải thẻ <a>, không bấm được
        expect(await tile.evaluate((el) => el.tagName)).toBe('SPAN')
        await expect(tile).toHaveAttribute('data-planned', '1')
      }
    }
    expect(errors).toEqual([])
  })

  test('bấm ô app đang chạy → điều hướng tới đúng app', async ({ page }) => {
    await stubNetwork(page)
    await openHome(page)
    const app = sortApps(APPS).find((a) => a.status === 'live' && a.url)!
    // chặn trang đích (host ngoài) — chỉ cần biết trình duyệt đi đúng địa chỉ
    const nav = page.waitForRequest((r) => r.isNavigationRequest() && r.url().startsWith(app.url!))
    await page.getByRole('link', { name: `Mở ${app.name}` }).click()
    expect((await nav).url()).toContain(new URL(app.url!).host)
  })

  test('trang chủ không dùng màn chờ, không nạp thư viện motion', async ({ page }) => {
    const scripts: string[] = []
    page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()))
    await stubNetwork(page)
    await openHome(page)
    await expect(page.locator('.pl-root')).toHaveCount(0)
    expect(scripts.filter((u) => /node_modules\/\.vite\/deps\/motion|features\/landing/.test(u))).toEqual([])
  })
})

test.describe('thanh thông số', () => {
  test('mở rộng → hiện giờ, thời tiết, vàng, USD, Bitcoin, xăng từ dữ liệu mẫu', async ({ page }) => {
    const net = await stubNetwork(page)
    await openHome(page)
    const toggle = page.locator('.dk-toggle')
    // luôn thu nhỏ khi mở trang (anh chọn 15/11/2026)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const dock = page.locator('#fd-dock .dk-full')
    await expect(dock.locator('.dk-time')).toHaveText(/^\d{1,2}:\d{2}$/)
    await expect(dock.locator('.dk-temp')).toHaveText('27°')
    await expect(dock.locator('.dk-wx-text')).toHaveText('Có mây')
    await expect(dock.locator('.dk-days li')).toHaveCount(3)
    await expect(dock.locator('.dk-days li').first()).toContainText('Hôm nay')
    await expect(dock.locator('.dk-stat', { hasText: 'USD' })).toContainText('25,400 đ')
    await expect(dock.locator('.dk-stat', { hasText: 'Bitcoin' })).toContainText('$97,250')
    await expect(dock.locator('.dk-stat', { hasText: 'Bitcoin' })).toContainText('+1.23%')
    // vàng = 2650 USD/oz × 25 400 × 1,20565 oz/lượng ≈ 81,2 tr
    await expect(dock.locator('.dk-stat', { hasText: 'Vàng' })).toContainText('81.2 tr/lượng')
    await expect(dock.locator('.dk-stat', { hasText: 'Xăng RON95' })).toContainText('đ')
    // nguồn dữ liệu bắt buộc ghi (giấy phép Open-Meteo / ExchangeRate-API)
    await expect(page.locator('#fd-dock')).toHaveAttribute('title', /Open-Meteo.*CoinGecko.*ExchangeRate-API/)
    // mỗi dịch vụ một địa chỉ, không gọi lặp. Dev server bật React StrictMode → effect chạy 2 lần lúc mở trang
    // (chỉ ở dev) nên cho phép ≤ 2; bản build gọi 1 lần.
    for (const host of ['open-meteo', 'coingecko', 'er-api']) {
      const calls = net.api.filter((u) => u.includes(host))
      expect(new Set(calls).size, host).toBe(1)
      expect(calls.length, host).toBeLessThanOrEqual(2)
    }
    // chỉ gửi tọa độ thành phố mặc định (Hà Nội) — không dữ liệu cá nhân
    expect(net.api.find((u) => u.includes('open-meteo'))).toContain('latitude=21.03&longitude=105.85')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('điện thoại: bấm nền mờ thì thu thanh thông số', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'nền mờ chỉ có trên màn < 1080px')
    await stubNetwork(page)
    await openHome(page)
    await page.locator('.dk-toggle').click()
    await expect(page.locator('.dk-backdrop')).toHaveClass(/is-open/)
    // bấm vào phần nền mờ không bị thanh thông số che (mép phải màn hình)
    const vp = page.viewportSize()!
    await page.mouse.click(vp.width - 10, vp.height / 2)
    await expect(page.locator('.dk-toggle')).toHaveAttribute('aria-expanded', 'false')
  })

  test('máy tính: bấm ra ngoài hoặc nhấn Esc thì thu thanh thông số', async ({ page, isMobile }) => {
    test.skip(isMobile, 'điện thoại đã có test nền mờ')
    await stubNetwork(page)
    await openHome(page)
    const toggle = page.locator('.dk-toggle')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // bấm trong thanh thì không đóng
    await page.locator('#fd-dock .dk-time').click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const vp = page.viewportSize()!
    await page.mouse.click(vp.width - 10, vp.height - 10)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('dịch vụ ngoài lỗi, chưa có đệm → báo "Chưa tải được", trang vẫn chạy', async ({ page }) => {
    const errors = watchErrors(page)
    await stubNetwork(page, 'error')
    await openHome(page)
    await page.locator('.dk-toggle').click()
    const dock = page.locator('#fd-dock .dk-full')
    await expect(dock.getByText('Chưa tải được thời tiết')).toBeVisible()
    await expect(dock.locator('.dk-stat', { hasText: 'USD' })).toContainText('Chưa tải được')
    await expect(dock.locator('.dk-stat', { hasText: 'Bitcoin' })).toContainText('Chưa tải được')
    await expect(page.locator('.lc-tiles .lc-tile').first()).toBeVisible()
    expect(errors).toEqual([])
  })

  test('chọn thành phố bằng ô tìm (gõ không dấu) → gọi thời tiết đúng tọa độ', async ({ page }) => {
    const net = await stubNetwork(page)
    await openHome(page)
    await page.locator('.dk-toggle').click()
    await page.locator('.dk-city').click()
    await page.keyboard.type('da nang')
    const option = page.locator('.dk-city-pop .ant-select-item-option')
    await expect(option).toHaveCount(1)
    await expect(option).toHaveText('Đà Nẵng')
    await option.click()
    await expect(page.locator('.dk-city .ant-select-selection-item')).toHaveText('Đà Nẵng')
    await expect.poll(() => net.api.some((u) => u.includes('latitude=16.05&longitude=108.21'))).toBe(true)
    await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')
  })
})

test.describe('popup Cài đặt', () => {
  test('mở / hủy không đổi gì; "Lưu thay đổi" chỉ bật khi có thay đổi', async ({ page }) => {
    const errors = watchErrors(page)
    await stubNetwork(page)
    await openHome(page)
    const modal = await openSettings(page)
    await expect(modal).toBeVisible()
    const save = modal.getByRole('button', { name: 'Lưu thay đổi' })
    await expect(save).toBeDisabled()
    // đủ mọi ô trong danh sách thứ tự
    await expect(modal.locator('.st-item')).toHaveCount(APPS.length)

    await modal.getByRole('switch', { name: 'Mở trong tab mới' }).click()
    await expect(save).toBeEnabled()
    await modal.getByRole('button', { name: 'Hủy' }).click()
    await expect(modal).toBeHidden()
    expect(await page.evaluate(() => localStorage.getItem('foxdots.prefs'))).toBeNull()
    await expect(page.locator('.lc-tiles a.lc-tile').first()).not.toHaveAttribute('target', /.*/)
    expect(errors).toEqual([])
  })

  test('link sai / link javascript: bị từ chối, link đúng được thêm', async ({ page }) => {
    await stubNetwork(page)
    await openHome(page)
    const modal = await openSettings(page)
    const url = modal.getByRole('textbox', { name: 'Địa chỉ link' })

    for (const bad of ['javascript:alert(1)', 'khong co cham', 'data:text/html,hi']) {
      await url.fill(bad)
      await modal.getByRole('button', { name: 'Thêm' }).click()
      await expect(modal.getByRole('alert')).toContainText('Link chưa đúng')
    }
    await url.fill('example.com/trang')
    await modal.getByRole('button', { name: 'Thêm' }).click()
    await expect(modal.getByRole('alert')).toHaveCount(0)
    await expect(modal.locator('.st-item').last()).toContainText('example')
    await expect(modal.locator('.st-count').last()).toHaveText('1/24')
  })
})

test.describe('trang Giới thiệu', () => {
  test('màn chờ hiện rồi biến mất, mở khóa cuộn', async ({ page }) => {
    await stubNetwork(page)
    await page.goto('/#/gioi-thieu')
    await expect(page.locator('.pl-root')).toBeVisible()
    await expect(page.locator('.pl-root')).toHaveAttribute('role', 'status')
    await expect(page.locator('.pl-root')).toHaveCount(0, { timeout: 10_000 })
    await expect(page.locator('#h-hero')).toBeVisible()
    await expect(page.locator('html')).not.toHaveClass(/pl-lock/)
  })

  test('nút sáng/tối xoay vòng Theo hệ thống → Sáng → Tối, lưu vào localStorage', async ({ page }) => {
    await stubNetwork(page)
    await openAbout(page)
    const btn = page.locator('.fd-top button')
    await expect(btn).toHaveAttribute('aria-label', /^Giao diện: Theo hệ thống/)
    await btn.click()
    await expect(btn).toHaveAttribute('aria-label', /^Giao diện: Sáng/)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    expect(await page.evaluate(() => localStorage.getItem('foxdots.theme'))).toBe('light')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-label', /^Giao diện: Tối/)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await page.evaluate(() => localStorage.getItem('foxdots.theme'))).toBe('dark')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-label', /^Giao diện: Theo hệ thống/)
  })

  test('link chân trang: app đang chạy trỏ đúng URL; nút "Mở trang chủ" về #/', async ({ page }) => {
    await stubNetwork(page)
    await openAbout(page)
    const nav = page.getByRole('navigation', { name: 'Sản phẩm' })
    for (const app of APPS.filter((a) => a.url && a.status !== 'planned')) {
      const link = nav.getByRole('link', { name: app.name })
      await expect(link).toHaveAttribute('href', app.url!)
      await expect(link).toHaveAttribute('target', '_blank')
    }
    // app kế hoạch không có link
    for (const app of APPS.filter((a) => a.status === 'planned'))
      await expect(nav.getByRole('link', { name: app.name })).toHaveCount(0)

    await page.locator('.fd-top-cta').click()
    await expect(page).toHaveURL(/#\/$/)
    await expect(page.locator('.lc-tiles .lc-tile').first()).toBeVisible()
  })

  test('nút "Giới thiệu" trên trang chủ mở trang Giới thiệu', async ({ page }) => {
    await stubNetwork(page)
    await openHome(page)
    // điện thoại: nút nằm trong thanh thông số đang thu → mở ra trước
    if (!(await page.getByRole('link', { name: 'Giới thiệu FoxGo' }).isVisible()))
      await page.locator('.dk-toggle').click()
    await page.getByRole('link', { name: 'Giới thiệu FoxGo' }).click()
    await expect(page).toHaveURL(/#\/gioi-thieu$/)
    await expect(page.locator('#h-hero')).toBeVisible({ timeout: 20_000 })
  })
})
