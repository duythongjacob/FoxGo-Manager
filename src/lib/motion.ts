/**
 * Hàm thuần cho hiệu ứng cuộn trang Giới thiệu — xem docs/features/gioi-thieu.md.
 * Tiến độ cuộn (0 → 1) do thư viện `motion` (useScroll) tính; ở đây chỉ đổi tiến độ thành bước rời rạc.
 */

/** Kẹp về [0, 1]; NaN → 0. */
export function clamp01(x: number): number {
  return x > 0 ? (x < 1 ? x : 1) : 0
}

/** Chia tiến độ thành `n` bước bằng nhau → chỉ số bước 0…n-1 (p ≥ 1 vẫn là bước cuối, p < 0 là bước đầu). */
export function stepOf(p: number, n: number): number {
  if (n <= 1) return 0
  return Math.min(n - 1, Math.floor(clamp01(p) * n))
}
