/**
 * Lưu chế độ sáng/tối trên máy (localStorage `foxdots.theme`, cùng khóa với script đầu index.html).
 * Tính năng: docs/features/giao-dien-sang-toi.md. Hàm thuần ở lib/theme.ts — file này chỉ chạm trình duyệt.
 */
import { parseMode, THEME_KEY, type ThemeMode } from '@/lib/theme'

/** Đọc/ghi chế độ giao diện trong localStorage (chỉ là tiện ích trên máy — lỗi thì bỏ qua). */
export function readMode(): ThemeMode {
  try {
    return parseMode(localStorage.getItem(THEME_KEY))
  } catch {
    return 'system'
  }
}

/** Ghi chế độ đã chọn; trình duyệt chặn lưu trữ (chế độ riêng tư…) thì chỉ áp dụng trong phiên. */
export function saveMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    /* trình duyệt chặn lưu trữ → chỉ áp dụng trong phiên */
  }
}

/** Hệ điều hành đang để giao diện tối? (false khi không có matchMedia, VD môi trường test) */
export function systemPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
}
