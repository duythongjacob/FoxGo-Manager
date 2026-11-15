import { defineConfig } from 'vitest/config'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

/** Đường dẫn thật (đúng chữ hoa ổ đĩa) — tránh Vite coi file là "ngoài root" trên Windows (bài học từ Fox.TàiChính). */
const real = (u: URL) => fs.realpathSync.native(fileURLToPath(u))

// FoxGo_Manager: trang tổng hợp các app Fox. Chỉ link + mô tả chung, không đọc dữ liệu cá nhân, không gọi dịch vụ ngoài.
export default defineConfig(({ mode }) => ({
  root: real(new URL('.', import.meta.url)),
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { '@': real(new URL('./src', import.meta.url)) } },
  server: { host: 'localhost', port: mode === 'test' ? 5171 : 5170 },
  preview: { host: 'localhost', port: 4170 },
  build: { chunkSizeWarningLimit: 1500 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
}))
