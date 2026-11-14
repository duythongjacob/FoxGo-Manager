/** Chế độ sáng/tối. Khóa THEME_KEY phải khớp đoạn script đầu index.html. */

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_KEY = 'foxdots.theme'

const MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

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

export const MODE_LABEL: Record<ThemeMode, string> = {
  system: 'Theo hệ thống',
  light: 'Sáng',
  dark: 'Tối',
}
