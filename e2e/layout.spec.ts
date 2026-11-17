/**
 * FD-014: mọi trang × sáng / tối × máy tính / điện thoại — không tràn ngang, không tiêu đề bị ép, ô app không đè nhau,
 * không lỗi / cảnh báo console, không gọi host lạ. Ảnh chụp từng trang đính trong báo cáo (npm run e2e:report).
 */
import { expect, test } from '@playwright/test'
import {
  horizontalOverflow,
  openPage,
  overlapping,
  PAGES,
  scrollThrough,
  snap,
  squeezedHeadings,
  stubNetwork,
  watchErrors,
} from './helpers'

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`giao diện ${scheme === 'light' ? 'sáng' : 'tối'}`, () => {
    // chế độ mặc định "Theo hệ thống" → trang theo prefers-color-scheme của trình duyệt
    test.use({ colorScheme: scheme })

    for (const p of PAGES) {
      test(`bố cục ${p.name}`, async ({ page }, info) => {
        const errors = watchErrors(page)
        const net = await stubNetwork(page)
        await openPage(page, p.id)

        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme)
        if (p.id === 'about') await scrollThrough(page)
        await snap(page, info, `${p.name}-${scheme}`)

        expect(await horizontalOverflow(page), 'trang tràn ngang').toBeNull()
        expect(await squeezedHeadings(page), 'tiêu đề bị ép').toEqual([])
        if (p.id === 'home')
          expect(await overlapping(page, '.lc-tiles .lc-tile'), 'ô app đè nhau').toEqual([])
        expect(errors, 'lỗi console').toEqual([])
        expect(net.foreign, 'gọi host ngoài danh sách được duyệt').toEqual([])
      })
    }
  })
}

test('đường dẫn lạ → về trang chủ', async ({ page }) => {
  await stubNetwork(page)
  await page.goto('/#/khong-co-trang-nay')
  await expect(page.locator('.lc-tiles .lc-tile').first()).toBeVisible()
})

test('vào thẳng một mục trang Giới thiệu → cuộn tới mục đó', async ({ page }) => {
  await stubNetwork(page)
  await page.goto('/#/gioi-thieu/tinh-nang')
  const section = page.locator('#tinh-nang')
  await expect(section).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('.pl-root')).toHaveCount(0, { timeout: 10_000 })
  // LandingPage nhảy lại sau 0 / 300 / 900 ms (bố cục còn giãn) → chờ hết rồi đo
  await page.waitForTimeout(1200)
  const top = await section.evaluate((el) => el.getBoundingClientRect().top)
  expect(Math.abs(top), 'đầu mục Tính năng nằm sát mép trên màn hình').toBeLessThan(120)
})
