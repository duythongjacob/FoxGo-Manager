/**
 * Hằng số + hook chuyển động dùng chung của trang Giới thiệu (component ở kit.tsx).
 * Tài liệu: docs/features/gioi-thieu.md → "Chuyển động".
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { APPS } from '@/data/apps'
import type { FoxApp } from '@/lib/apps'
import { PRELOAD_START } from '@/components/Preloader'

/** Đường cong chung "expo out": vào nhanh, dừng êm. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** Vùng "đã vào màn" cho hiệu ứng hiện dần: bớt 12% đáy để phần tử hiện khi đã thực sự nhìn thấy. */
export const VIEW = { once: true, margin: '0px 0px -12% 0px' } as const

/** Mốc bề rộng bật các mục ghim (sticky kể chuyện) — màn hẹp hơn thì xếp dọc bình thường. */
export const WIDE = '(min-width: 961px)'

/** Tìm app theo mã (FF, FW…). */
export const appByCode = (code: string): FoxApp | undefined => APPS.find((a) => a.code === code)

/** Định dạng số kiểu Việt Nam: 4820000 → "4.820.000". */
export const vnd = (n: number) => Math.round(n).toLocaleString('vi-VN')

/**
 * Bộ đếm nhịp cho giao diện minh họa "đang chạy": tăng 1 mỗi `ms` khi phần tử đang trong màn.
 * Ngoài màn hoặc "giảm chuyển động" → đứng yên (không tốn CPU, không gây rối mắt).
 */
export function useLoop<T extends HTMLElement = HTMLDivElement>(ms: number) {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!inView || reduce) return
    const t = setInterval(() => setTick((n) => n + 1), ms)
    return () => clearInterval(t)
  }, [inView, reduce, ms])
  return { ref, tick, live: inView && !reduce }
}

/** Đúng/sai theo media query, cập nhật khi đổi kích thước. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}

/** Ảnh trang Giới thiệu dùng (linh vật các app + cáo ăn mừng) — tải trước khi mở màn chờ. */
const PRELOAD_IMAGES = [...new Set([...APPS.map((a) => a.mascot), '/fox/bieu-cam/fox-celebrate.svg'])]
/** Màn chờ hiện tối thiểu (ms) — tránh nháy khi đã có sẵn trong bộ đệm. */
const PRELOAD_MIN_MS = 700
/** Chờ tối đa (ms) — mạng chậm/ảnh lỗi thì vẫn mở trang, không treo người dùng. */
const PRELOAD_MAX_MS = 8000

/**
 * Tải trước font (Be Vietnam Pro) + ảnh của trang Giới thiệu cho màn chờ.
 * @returns `progress` 0…1 và `ready` khi xong (hoặc quá PRELOAD_MAX_MS).
 */
export function usePreload() {
  const [loaded, setLoaded] = useState(0)
  const [ready, setReady] = useState(false)
  const total = PRELOAD_IMAGES.length + 1 // +1 = font

  useEffect(() => {
    let alive = true
    const tick = () => alive && setLoaded((n) => n + 1)
    const img = (src: string) =>
      new Promise<void>((res) => {
        const el = new Image()
        el.onload = el.onerror = () => res()
        el.src = src
      }).then(tick)
    // document.fonts.ready chỉ chờ font đang được dùng — gọi load() các độ đậm trang dùng để chắc chắn đã tải
    const fonts = Promise.all(
      [400, 600, 700, 800].map((w) => document.fonts?.load(`${w} 16px "Be Vietnam Pro"`, 'Fox')),
    )
      .catch(() => undefined)
      .then(tick)
    const all = Promise.all([fonts, ...PRELOAD_IMAGES.map(img), wait(PRELOAD_MIN_MS)])
    Promise.race([all, wait(PRELOAD_MAX_MS)]).then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  return { progress: ready ? 1 : PRELOAD_START + (1 - PRELOAD_START) * (loaded / total), ready }
}

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
