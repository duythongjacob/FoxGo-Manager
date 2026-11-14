import { parseMode, THEME_KEY, type ThemeMode } from '@/lib/theme'

/** Đọc/ghi chế độ giao diện trong localStorage (chỉ là tiện ích trên máy — lỗi thì bỏ qua). */
export function readMode(): ThemeMode {
  try {
    return parseMode(localStorage.getItem(THEME_KEY))
  } catch {
    return 'system'
  }
}

export function saveMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    /* trình duyệt chặn lưu trữ → chỉ áp dụng trong phiên */
  }
}

export function systemPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
}
