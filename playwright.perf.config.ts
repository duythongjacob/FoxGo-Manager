/**
 * FD-014: đo tốc độ tải trang — `npm run e2e:perf`. Build production vào `dist-perf/` (không đụng `dist/` dùng để
 * deploy) rồi chạy `vite preview` cổng 4171 (4170 là preview của chay_local.bat). Chạy tuần tự 1 luồng để số đo ổn
 * định. Khung "điện thoại" giả lập CPU chậm 4× + mạng 4G (e2e/load.perf.ts). Tài liệu: docs/features/test-giao-dien.md.
 */
import { defineConfig, devices } from '@playwright/test'

/** Cổng preview riêng cho đo tốc độ. */
const PORT = 4171

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.perf.ts',
  outputDir: 'test-results/perf',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/perf' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'off',
  },
  projects: [
    { name: 'may-tinh', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } },
    { name: 'dien-thoai', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // --sourcemap: để e2e/bundle.ts chia kích thước từng file JS theo thư viện (react, antd, motion…)
    command: `npx vite build --outDir dist-perf --emptyOutDir --sourcemap && npx vite preview --outDir dist-perf --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // luôn build mới — đo đúng mã hiện tại
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
