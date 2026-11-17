/**
 * FD-014: lưu dữ liệu trên máy (localStorage) — đổi thiết lập qua giao diện, tải lại trang, kiểm tra còn nguyên;
 * dữ liệu trống / hỏng / bị sửa tay / trình duyệt chặn lưu trữ không làm vỡ trang.
 * Khóa: foxdots.theme (themeStore.ts + index.html), foxdots.prefs (data/prefs.ts), foxdots.city, foxdots.ext.* (external.ts).
 */
import { expect, test } from '@playwright/test'
import { APPS } from '../src/data/apps'
import { sortApps } from '../src/lib/apps'
import { DEFAULT_PREFS } from '../src/lib/prefs'
import { openHome, openSettings, seedStorage, snap, storage, stubNetwork, watchErrors } from './helpers'

const firstLive = sortApps(APPS).find((a) => a.status !== 'planned' && a.url)!

test('Cài đặt: chế độ tối, tắt line, tab mới, thêm link, đổi thứ tự → tải lại vẫn giữ', async ({
  page,
}, info) => {
  const errors = watchErrors(page)
  await stubNetwork(page)
  await openHome(page)

  const modal = await openSettings(page)
  await modal.locator('.ant-segmented-item', { hasText: 'Tối' }).click()
  await modal.locator('.ant-segmented', { hasText: 'Bình thường' }).getByText('Tắt').click()
  await modal.getByRole('switch', { name: 'Mở trong tab mới' }).click()
  await modal.getByRole('textbox', { name: 'Tên link' }).fill('Tin tức')
  await modal.getByRole('textbox', { name: 'Mô tả link' }).fill('Đọc buổi sáng')
  await modal.getByRole('textbox', { name: 'Địa chỉ link' }).fill('vnexpress.net')
  await modal.getByRole('button', { name: 'Thêm' }).click()
  // link mới xếp cuối → đưa lên đầu (bấm "lên" nhiều lần)
  for (let i = 0; i < APPS.length; i++) await modal.getByRole('button', { name: 'Đưa Tin tức lên' }).click()
  await expect(modal.locator('.st-item').first()).toContainText('Tin tức')
  await modal.getByRole('button', { name: 'Lưu thay đổi' }).click()
  await expect(modal).toBeHidden()

  // áp dụng ngay, chưa cần tải lại
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.reload()
  await openHome(page)
  await snap(page, info, 'sau-khi-tai-lai')

  // giao diện tối ngay từ script đầu index.html (không nháy sáng)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(await storage(page, 'foxdots.theme')).toBe('dark')

  const prefs = (await storage(page, 'foxdots.prefs')) as typeof DEFAULT_PREFS
  expect(prefs.newTab).toBe(true)
  expect(prefs.lineFx).toBe('off')
  expect(prefs.links).toEqual([
    { id: expect.any(String), name: 'Tin tức', url: 'https://vnexpress.net/', desc: 'Đọc buổi sáng' },
  ])
  expect(prefs.order[0]).toBe(`link:${prefs.links[0].id}`)

  const tiles = page.locator('.lc-tiles .lc-tile')
  await expect(tiles).toHaveCount(APPS.length + 1)
  await expect(tiles.first()).toHaveAttribute('href', 'https://vnexpress.net/')
  await expect(tiles.first()).toContainText('Đọc buổi sáng')
  await expect(tiles.first()).toHaveAttribute('target', '_blank')
  await expect(tiles.first()).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(page.getByRole('link', { name: `Mở ${firstLive.name}` })).toHaveAttribute('target', '_blank')
  await expect(page.locator('.lc-main')).toHaveAttribute('data-lines', 'off')
  await expect(page.locator('.lc-lines')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('Cài đặt: xóa link + "Khôi phục mặc định" → tải lại về mặc định', async ({ page }) => {
  await stubNetwork(page)
  await openHome(page)
  await seedStorage(page, {
    'foxdots.theme': 'light',
    'foxdots.prefs': JSON.stringify({
      order: ['link:a1', 'app:FW'],
      newTab: true,
      lineFx: 'slow',
      links: [{ id: 'a1', name: 'Mail', url: 'https://mail.example.com/' }],
    }),
  })
  await page.reload()
  await openHome(page)
  await expect(page.locator('.lc-tiles .lc-tile').first()).toHaveText(/Mail/)
  await expect(page.locator('.lc-main')).toHaveAttribute('data-lines', 'slow')

  const modal = await openSettings(page)
  await modal.getByRole('button', { name: 'Xóa link Mail' }).click()
  await modal.getByRole('button', { name: 'Khôi phục mặc định' }).click()
  await modal.getByRole('button', { name: 'Lưu thay đổi' }).click()

  await page.reload()
  await openHome(page)
  expect(await storage(page, 'foxdots.theme')).toBe('system')
  const prefs = (await storage(page, 'foxdots.prefs')) as typeof DEFAULT_PREFS
  expect({ ...prefs, order: [] }).toEqual(DEFAULT_PREFS)
  await expect(page.locator('.lc-tiles .lc-tile')).toHaveCount(APPS.length)
  await expect(page.locator('.lc-tiles .lc-tile').first()).toHaveAttribute('href', firstLive.url!)
})

test('thành phố thời tiết đã chọn được nhớ sau khi tải lại', async ({ page }) => {
  const net = await stubNetwork(page)
  await openHome(page)
  await page.locator('.dk-toggle').click()
  await page.locator('.dk-city').click()
  await page.locator('.dk-city-pop .ant-select-item-option', { hasText: 'Huế' }).click()
  expect(await page.evaluate(() => localStorage.getItem('foxdots.city'))).toBe('Huế')
  // chờ thời tiết Huế tải xong và vào đệm rồi mới tải lại
  await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('foxdots.ext.weather:16.46,107.59') !== null))
    .toBe(true)

  net.api.length = 0
  await page.reload()
  await openHome(page)
  await page.locator('.dk-toggle').click()
  await expect(page.locator('.dk-city .ant-select-selection-item')).toHaveText('Huế')
  // Huế đã có đệm 30 phút → không gọi lại Open-Meteo; giá/tỷ giá cũng đang trong hạn đệm
  await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')
  expect(net.api, 'dùng đệm, không gọi mạng lại').toEqual([])
})

test('mất mạng nhưng có đệm cũ → vẫn hiện số liệu đã lưu', async ({ page }) => {
  const net = await stubNetwork(page)
  await openHome(page)
  await page.locator('.dk-toggle').click()
  await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')
  // làm đệm hết hạn (lùi thời điểm lưu 1 ngày) rồi cắt mạng
  await page.evaluate(() => {
    for (const k of Object.keys(localStorage).filter((k) => k.startsWith('foxdots.ext.'))) {
      const v = JSON.parse(localStorage.getItem(k)!)
      localStorage.setItem(k, JSON.stringify({ ...v, at: v.at - 86_400_000 }))
    }
  })
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await stubNetwork(page, 'offline')
  net.api.length = 0
  await page.reload()
  await openHome(page)
  await page.locator('.dk-toggle').click()
  await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')
  await expect(page.locator('.dk-stat', { hasText: 'USD' })).toContainText('25,400 đ')
  await expect(page.locator('.dk-stat', { hasText: 'Bitcoin' })).toContainText('$97,250')
})

test.describe('dữ liệu trống / hỏng không làm vỡ trang', () => {
  /** Mỗi bộ = nội dung localStorage trước khi tải trang. */
  const CASES: Record<string, Record<string, string>> = {
    'trống hoàn toàn': {},
    'JSON hỏng': {
      'foxdots.prefs': '{hỏng',
      'foxdots.theme': '"dark',
      'foxdots.city': '',
      'foxdots.ext.market': '{{{',
      'foxdots.ext.usdvnd': 'không phải json',
    },
    'sai kiểu dữ liệu': {
      'foxdots.prefs': JSON.stringify({ order: 'app:FF', newTab: 'yes', lineFx: 'nhanh', links: { a: 1 } }),
      'foxdots.theme': 'tim',
      'foxdots.city': 'Atlantis',
    },
    'prefs là null / mảng / số': { 'foxdots.prefs': '[1,2,3]', 'foxdots.theme': '42' },
    'link độc hại / quá dài / trùng id': {
      'foxdots.prefs': JSON.stringify({
        order: ['link:x', 'link:x', 7, 'app:KHONGCO'],
        newTab: false,
        links: [
          { id: 'x', name: 'Xấu', url: 'javascript:alert(1)' },
          { id: 'y', name: 'A'.repeat(500), url: 'example.com', desc: 'B'.repeat(500) },
          { id: 'y', name: 'Trùng id', url: 'example.org' },
          { id: 'z', name: '   ', url: 'example.net' },
          null,
        ],
      }),
    },
  }

  for (const [name, entries] of Object.entries(CASES)) {
    test(name, async ({ page }) => {
      const errors = watchErrors(page)
      await stubNetwork(page)
      await page.goto('/#/')
      await seedStorage(page, entries)
      await page.reload()
      await openHome(page)

      // trang chủ đủ ô app, thanh thông số chạy
      await expect(page.locator('.lc-tiles .lc-tile')).toHaveCount(
        APPS.length + (name.startsWith('link') ? 1 : 0),
      )
      await expect(page.locator('html')).toHaveAttribute('data-theme', /^(light|dark)$/)
      await page.locator('.dk-toggle').click()
      await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')
      // không có link javascript: nào lên trang
      expect(await page.locator('a[href^="javascript:"]').count()).toBe(0)
      // Cài đặt mở được và lưu đè dữ liệu hỏng bằng dữ liệu sạch
      const modal = await openSettings(page)
      await modal.getByRole('switch', { name: 'Mở trong tab mới' }).click()
      await modal.getByRole('button', { name: 'Lưu thay đổi' }).click()
      const prefs = (await storage(page, 'foxdots.prefs')) as typeof DEFAULT_PREFS
      expect(prefs.newTab).toBe(true)
      expect(Array.isArray(prefs.links) && Array.isArray(prefs.order)).toBe(true)
      for (const l of prefs.links) {
        expect(l.url).toMatch(/^https?:\/\//)
        expect(l.name.length).toBeLessThanOrEqual(24)
        expect((l.desc ?? '').length).toBeLessThanOrEqual(32)
      }
      expect(errors).toEqual([])
    })
  }

  test('đệm thời tiết đúng JSON nhưng sai cấu trúc (còn hạn) → không vỡ trang', async ({ page }) => {
    const errors = watchErrors(page)
    await stubNetwork(page)
    await page.goto('/#/')
    // đệm còn hạn (vừa lưu) nhưng giá trị thiếu trường — VD phiên bản cũ / bị sửa tay. Trước khi sửa (FD-014)
    // InfoDock đọc `w.days.length` của đệm này → ném lỗi khi vẽ, trắng cả trang chủ.
    const at = Date.now() - 1000
    await seedStorage(page, {
      'foxdots.ext.weather:21.03,105.85': JSON.stringify({ at, value: { temp: 'nóng' } }),
      'foxdots.ext.market': JSON.stringify({ at, value: {} }),
      'foxdots.ext.usdvnd': JSON.stringify({ at: Date.now() + 9e9, value: { rate: 1, updated: 0 } }),
    })
    await page.reload()
    await expect(page.locator('.lc-tiles .lc-tile').first()).toBeVisible({ timeout: 20_000 })
    await page.locator('.dk-toggle').click()
    await expect(page.locator('.lc-tiles .lc-tile')).toHaveCount(APPS.length)
    // đệm hỏng bị bỏ qua → tải lại từ dịch vụ (dữ liệu mẫu); đệm "ở tương lai" cũng không được tin
    await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')
    await expect(page.locator('.dk-stat', { hasText: 'USD' })).toContainText('25,400 đ')
    expect(errors).toEqual([])
  })

  test('trình duyệt chặn localStorage (chế độ riêng tư nghiêm) → trang vẫn chạy, đổi giao diện trong phiên', async ({
    page,
  }) => {
    const errors = watchErrors(page)
    await page.addInitScript(() => {
      const deny = () => {
        throw new DOMException('Bị chặn', 'SecurityError')
      }
      Object.defineProperty(window, 'localStorage', { get: deny, configurable: true })
    })
    await stubNetwork(page)
    await openHome(page)
    await expect(page.locator('.lc-tiles .lc-tile')).toHaveCount(APPS.length)
    await page.locator('.dk-toggle').click()
    await expect(page.locator('#fd-dock .dk-temp')).toHaveText('27°')

    const modal = await openSettings(page)
    await modal.locator('.ant-segmented-item', { hasText: 'Tối' }).click()
    await modal.getByRole('button', { name: 'Lưu thay đổi' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(errors).toEqual([])
  })
})
