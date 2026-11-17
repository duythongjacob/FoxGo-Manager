/**
 * FD-014: test trình duyệt (Playwright) — `npm run e2e`. Chạy trên dev server chế độ test (cổng 5171), hai khung:
 * máy tính 1366×900 và điện thoại Pixel 7. Dịch vụ ngoài (thời tiết, giá) bị chặn, trả dữ liệu mẫu (e2e/helpers.ts).
 * Đo tốc độ tải trang dùng cấu hình riêng `playwright.perf.config.ts` (bản build production).
 * Ảnh chụp + báo cáo: test-results/, playwright-report/ (không commit). Tài liệu: docs/features/test-giao-dien.md.
 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.spec.ts',
  outputDir: 'test-results',
  fullyParallel: true,
  // dev server Vite biên dịch theo yêu cầu → lần đầu mỗi trang chậm; 3 luồng là vừa với máy cá nhân
  workers: 3,
  retries: 0,
  timeout: 45_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5171',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'may-tinh', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } },
    { name: 'dien-thoai', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:5171',
    // đang mở dev:test thì dùng luôn server đó
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
