/**
 * Chế độ sáng/tối — hàm thuần. Khóa THEME_KEY phải khớp đoạn script đầu index.html.
 * Đọc/ghi trình duyệt ở app/themeStore.ts. Tính năng: docs/features/giao-dien-sang-toi.md.
 */

export type ThemeMode = 'system' | 'light' | 'dark'

/** Giữ tên cũ "foxdots" để không mất lựa chọn của người dùng (đổi tên phải kèm chuyển dữ liệu — FD-012). */
export const THEME_KEY = 'foxdots.theme'

const MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

/** Giá trị đọc từ localStorage → chế độ hợp lệ; lạ/trống → 'system'. */
export function parseMode(raw: string | null | undefined): ThemeMode {
  return MODES.includes(raw as ThemeMode) ? (raw as ThemeMode) : 'system'
}

/** Chế độ thực tế. `prefersDark` truyền rõ (không đọc môi trường bên trong — bài học FF-001/FF-009). */
export function resolveDark(mode: ThemeMode, prefersDark: boolean): boolean {
  return mode === 'dark' || (mode === 'system' && prefersDark)
}

/** Vòng: theo hệ thống → sáng → tối → theo hệ thống. */
export function nextMode(mode: ThemeMode): ThemeMode {
  return MODES[(MODES.indexOf(mode) + 1) % MODES.length]
}

/** Nhãn tiếng Việt cho nút đổi giao diện. */
export const MODE_LABEL: Record<ThemeMode, string> = {
  system: 'Theo hệ thống',
  light: 'Sáng',
  dark: 'Tối',
}
