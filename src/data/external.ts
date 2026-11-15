/**
 * Dịch vụ ngoài được phép (anh duyệt 14/11/2026, giống Fox.TàiChính) — CHỈ gửi tọa độ thành phố đã chọn / tên đồng coin,
 * KHÔNG gửi dữ liệu cá nhân. Đệm localStorage; mất mạng thì dùng bản đã lưu gần nhất. Giao diện phải ghi nguồn.
 *  - Open-Meteo (không cần key, CC BY 4.0): https://open-meteo.com
 *  - CoinGecko simple/price (không cần key): https://www.coingecko.com — Bitcoin, PAX Gold ≈ 1 oz vàng
 *  - ExchangeRate-API open access (không cần key): https://www.exchangerate-api.com — USD/VND
 */
import { parseCoinGecko, parseUsdVnd, type Market } from '@/lib/market'
import { parseOpenMeteo, type City, type Weather } from '@/lib/weather'

export interface Fetched<T> {
  value: T
  /** true = lấy từ bản đã lưu do lỗi mạng (có thể cũ) */
  stale: boolean
}

function readCache<T>(key: string): { at: number; value: T } | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null')
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
async function cached<T>(key: string, ttl: number, load: () => Promise<T | null>): Promise<Fetched<T>> {
  const c = readCache<T>(key)
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

export function fetchWeather(city: City): Promise<Fetched<Weather>> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${city.lat.toFixed(2)}&longitude=${city.lon.toFixed(2)}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max' +
    '&timezone=auto&forecast_days=3'
  return cached(`foxdots.ext.weather:${city.lat.toFixed(2)},${city.lon.toFixed(2)}`, 30 * 60_000, async () =>
    parseOpenMeteo(await getJson(url), Date.now()),
  )
}

export function fetchMarket(): Promise<Fetched<Market>> {
  return cached('foxdots.ext.market', 10 * 60_000, async () =>
    parseCoinGecko(
      await getJson(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd,vnd' +
          '&include_24hr_change=true&include_last_updated_at=true',
      ),
    ),
  )
}

export function fetchUsdVnd(): Promise<Fetched<{ rate: number; updated: number }>> {
  return cached('foxdots.ext.usdvnd', 6 * 3600_000, async () =>
    parseUsdVnd(await getJson('https://open.er-api.com/v6/latest/USD')),
  )
}

const CITY_KEY = 'foxdots.city'

export function readCityName(): string | null {
  try {
    return localStorage.getItem(CITY_KEY)
  } catch {
    return null
  }
}

export function saveCityName(name: string): void {
  try {
    localStorage.setItem(CITY_KEY, name)
  } catch {
    /* chỉ áp dụng trong phiên */
  }
}
