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
      // Đổi mục trên trang đang mở: chờ ~2 khung hình rồi cuộn. Vào thẳng link có mục khi trang chưa nạp xong
      // (Giới thiệu nạp lười) → phần tử chưa có, trang đó tự cuộn khi dựng xong (LandingPage).
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
