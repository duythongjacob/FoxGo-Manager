/**
 * Dịch vụ ngoài được phép (anh duyệt 14/11/2026, giống Fox.TàiChính) — CHỈ gửi tọa độ thành phố đã chọn / tên đồng coin,
 * KHÔNG gửi dữ liệu cá nhân. Đệm localStorage; mất mạng thì dùng bản đã lưu gần nhất. Giao diện phải ghi nguồn.
 *  - Open-Meteo (không cần key, CC BY 4.0): https://open-meteo.com
 *  - CoinGecko simple/price (không cần key): https://www.coingecko.com — Bitcoin, PAX Gold ≈ 1 oz vàng
 *  - ExchangeRate-API open access (không cần key): https://www.exchangerate-api.com — USD/VND
 *  - Giá xăng Petrolimex (anh yêu cầu 15/11/2026, giống Fox.TàiChính FF-075): KHÔNG gọi từ trình duyệt — snapshot
 *    `fuel.json` đóng gói cùng trang, tạo trên máy bằng `npm run fuel:update` (GET giaxanghomnay.com).
 * Tính năng: docs/features/thanh-thong-so.md. Phân tích phản hồi (hàm thuần, có test) ở lib/weather.ts, lib/market.ts, lib/fuel.ts.
 * Khóa localStorage: `foxdots.ext.*` (đệm), `foxdots.city` (thành phố) — giữ tên cũ để không mất cài đặt (FD-012).
 */
import { isFuelPrices, type FuelPrices } from '@/lib/fuel'
import { isMarket, isUsdVnd, parseCoinGecko, parseUsdVnd, type Market } from '@/lib/market'
import { isWeather, parseOpenMeteo, type City, type Weather } from '@/lib/weather'
import fuelSnapshot from './fuel.json'

/** Giá xăng dầu kỳ gần nhất (snapshot trong bundle); null nếu file hỏng → thanh thông số ẩn dòng xăng. */
export const FUEL: FuelPrices | null = isFuelPrices(fuelSnapshot) ? fuelSnapshot : null

/** Kết quả gọi dịch vụ ngoài kèm cờ "đang dùng bản cũ". */
export interface Fetched<T> {
  value: T
  /** true = lấy từ bản đã lưu do lỗi mạng (có thể cũ) */
  stale: boolean
}

/**
 * Đọc đệm; JSON hỏng, sai cấu trúc (`valid` từ chối) hoặc thời điểm lưu không hợp lệ / ở tương lai → coi như không có.
 * Vì sao kiểm kỹ: localStorage có thể bị sửa tay hoặc còn định dạng cũ — trước FD-014 đệm sai cấu trúc làm
 * thanh thông số ném lỗi khi vẽ và trắng cả trang chủ.
 */
function readCache<T>(key: string, valid: (v: unknown) => v is T): { at: number; value: T } | null {
  try {
    const c = JSON.parse(localStorage.getItem(key) ?? 'null') as { at?: unknown; value?: unknown } | null
    if (!c || typeof c.at !== 'number' || c.at > Date.now() || !valid(c.value)) return null
    return { at: c.at, value: c.value }
  } catch {
    return null
  }
}

function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), value }))
  } catch {
    /* trình duyệt chặn lưu trữ → bỏ qua */
  }
}

/** GET JSON, quá 8 giây thì hủy; không gửi cookie/referrer (nguồn không biết người dùng đang mở trang nào). */
async function getJson(url: string, ms = 8000): Promise<unknown> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

/** Đọc đệm còn hạn → trả luôn; hết hạn → gọi mạng; lỗi → trả bản đệm cũ (stale) nếu có. */
async function cached<T>(
  key: string,
  ttl: number,
  valid: (v: unknown) => v is T,
  load: () => Promise<T | null>,
): Promise<Fetched<T>> {
  const c = readCache(key, valid)
  if (c && Date.now() - c.at < ttl) return { value: c.value, stale: false }
  try {
    const v = await load()
    if (v === null) throw new Error('Dữ liệu không hợp lệ')
    writeCache(key, v)
    return { value: v, stale: false }
  } catch (e) {
    if (c) return { value: c.value, stale: true }
    throw e
  }
}

/** Thời tiết hiện tại + 3 ngày của thành phố. Đệm 30 phút, khóa theo tọa độ (đổi thành phố không lẫn đệm). */
export function fetchWeather(city: City): Promise<Fetched<Weather>> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${city.lat.toFixed(2)}&longitude=${city.lon.toFixed(2)}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max' +
    '&timezone=auto&forecast_days=3'
  return cached(
    `foxdots.ext.weather:${city.lat.toFixed(2)},${city.lon.toFixed(2)}`,
    30 * 60_000,
    isWeather,
    async () => parseOpenMeteo(await getJson(url), Date.now()),
  )
}

/** Giá Bitcoin + PAX Gold (USD, VND, % 24 giờ). Đệm 10 phút — gói miễn phí CoinGecko giới hạn số lần gọi. */
export function fetchMarket(): Promise<Fetched<Market>> {
  return cached('foxdots.ext.market', 10 * 60_000, isMarket, async () =>
    parseCoinGecko(
      await getJson(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd,vnd' +
          '&include_24hr_change=true&include_last_updated_at=true',
      ),
    ),
  )
}

/** Tỷ giá USD/VND. Đệm 6 giờ — nguồn chỉ cập nhật khoảng 1 lần/ngày. */
export function fetchUsdVnd(): Promise<Fetched<{ rate: number; updated: number }>> {
  return cached('foxdots.ext.usdvnd', 6 * 3600_000, isUsdVnd, async () =>
    parseUsdVnd(await getJson('https://open.er-api.com/v6/latest/USD')),
  )
}

/** Thành phố thời tiết đã chọn (lưu tên, khi đọc đối chiếu với VN_CITIES). */
const CITY_KEY = 'foxdots.city'

/** Tên thành phố đã lưu, hoặc null nếu chưa chọn / không đọc được. */
export function readCityName(): string | null {
  try {
    return localStorage.getItem(CITY_KEY)
  } catch {
    return null
  }
}

/** Ghi tên thành phố đã chọn; lỗi lưu trữ thì chỉ áp dụng trong phiên. */
export function saveCityName(name: string): void {
  try {
    localStorage.setItem(CITY_KEY, name)
  } catch {
    /* chỉ áp dụng trong phiên */
  }
}
