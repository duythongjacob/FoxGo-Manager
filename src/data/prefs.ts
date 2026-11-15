/**
 * Đọc/ghi thiết lập trang chủ (FD-005) trong localStorage — chỉ trên máy này, không gửi đi đâu.
 * Khóa `foxdots.prefs` (giữ tiền tố cũ như các khóa khác — FD-012). Kiểm tra dữ liệu ở lib/prefs.ts.
 * Tính năng: docs/features/cai-dat.md.
 */
import { DEFAULT_PREFS, parsePrefs, type Prefs } from '@/lib/prefs'

const KEY = 'foxdots.prefs'

/** Thiết lập đã lưu; lỗi đọc / JSON hỏng → mặc định. */
export function readPrefs(): Prefs {
  try {
    return parsePrefs(JSON.parse(localStorage.getItem(KEY) ?? 'null'))
  } catch {
    return DEFAULT_PREFS
  }
}

/** Ghi thiết lập; trình duyệt chặn lưu trữ → chỉ áp dụng trong phiên. */
export function savePrefs(p: Prefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* chỉ áp dụng trong phiên */
  }
}
