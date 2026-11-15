/** Hook điều hướng: nghe sự kiện `hashchange`; logic tách đường dẫn ở lib/route.ts. Xem docs/features/dieu-huong.md. */
import { useEffect, useState } from 'react'
import { parseRoute, type Route } from '@/lib/route'

/** Trang hiện tại theo location.hash; đổi trang → cuộn lên đầu, hoặc tới mục `anchor` nếu có. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const on = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    if (route.anchor) {
      // chờ trang mới vẽ xong rồi mới cuộn (gọi ngay thì phần tử đích chưa tồn tại; 30 ms ≈ 2 khung hình)
      const t = setTimeout(
        () => document.getElementById(route.anchor!)?.scrollIntoView({ block: 'start' }),
        30,
      )
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [route.id, route.anchor])

  return route
}
