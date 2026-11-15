/**
 * Thời tiết — hàm thuần (chép từ Fox.TàiChính `lib/weather.ts`, FF-034).
 * Mã thời tiết WMO (Open-Meteo `weather_code`) → mô tả tiếng Việt + nhóm biểu tượng; danh sách thành phố;
 * chuẩn hóa phản hồi API. Tính năng: docs/features/thanh-thong-so.md.
 */
export type WeatherIcon = 'sun' | 'partly' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'storm' | 'snow'

/** Bảng mã WMO 4677 (bộ mã Open-Meteo trả về): [các mã, mô tả, biểu tượng]. */
const TABLE: [number[], string, WeatherIcon][] = [
  [[0], 'Trời quang', 'sun'],
  [[1], 'Ít mây', 'partly'],
  [[2], 'Có mây', 'partly'],
  [[3], 'Nhiều mây', 'cloud'],
  [[45, 48], 'Sương mù', 'fog'],
  [[51, 53, 55], 'Mưa phùn', 'drizzle'],
  [[56, 57], 'Mưa phùn lạnh', 'drizzle'],
  [[61], 'Mưa nhỏ', 'rain'],
  [[63], 'Mưa vừa', 'rain'],
  [[65], 'Mưa to', 'rain'],
  [[66, 67], 'Mưa lạnh', 'rain'],
  [[71, 73, 75, 77], 'Tuyết', 'snow'],
  [[80], 'Mưa rào nhẹ', 'rain'],
  [[81], 'Mưa rào', 'rain'],
  [[82], 'Mưa rào rất to', 'rain'],
  [[85, 86], 'Mưa tuyết', 'snow'],
  [[95], 'Dông', 'storm'],
  [[96, 99], 'Dông kèm mưa đá', 'storm'],
]

/** Mã WMO → mô tả + biểu tượng; mã lạ → "Không rõ". */
export function describeWeather(code: number): { text: string; icon: WeatherIcon } {
  const row = TABLE.find(([codes]) => codes.includes(code))
  return row ? { text: row[1], icon: row[2] } : { text: 'Không rõ', icon: 'cloud' }
}

export interface City {
  name: string
  lat: number
  lon: number
}

/** Thành phố lớn ở Việt Nam (tọa độ trung tâm, làm tròn ~1 km) — chọn ngay trên máy, không gọi dịch vụ tìm địa danh. */
export const VN_CITIES: City[] = [
  { name: 'Hà Nội', lat: 21.03, lon: 105.85 },
  { name: 'TP. Hồ Chí Minh', lat: 10.78, lon: 106.7 },
  { name: 'Hải Phòng', lat: 20.86, lon: 106.68 },
  { name: 'Đà Nẵng', lat: 16.05, lon: 108.21 },
  { name: 'Cần Thơ', lat: 10.03, lon: 105.78 },
  { name: 'Huế', lat: 16.46, lon: 107.59 },
  { name: 'Nha Trang', lat: 12.24, lon: 109.19 },
  { name: 'Đà Lạt', lat: 11.94, lon: 108.44 },
  { name: 'Vũng Tàu', lat: 10.35, lon: 107.08 },
  { name: 'Quy Nhơn', lat: 13.78, lon: 109.22 },
  { name: 'Buôn Ma Thuột', lat: 12.67, lon: 108.04 },
  { name: 'Vinh', lat: 18.68, lon: 105.68 },
  { name: 'Thanh Hóa', lat: 19.81, lon: 105.78 },
  { name: 'Hạ Long', lat: 20.95, lon: 107.08 },
  { name: 'Thái Nguyên', lat: 21.59, lon: 105.85 },
  { name: 'Bắc Ninh', lat: 21.19, lon: 106.08 },
  { name: 'Lào Cai', lat: 22.48, lon: 103.97 },
  { name: 'Biên Hòa', lat: 10.95, lon: 106.82 },
  { name: 'Phan Thiết', lat: 10.93, lon: 108.1 },
  { name: 'Phú Quốc', lat: 10.22, lon: 103.96 },
  { name: 'Hội An', lat: 15.88, lon: 108.33 },
]

export const DEFAULT_CITY = VN_CITIES[0]

/** Tên đã lưu → City (lạ thì về mặc định). */
export const cityByName = (name: string | null | undefined): City =>
  VN_CITIES.find((c) => c.name === name) ?? DEFAULT_CITY

/** Thời tiết đã chuẩn hóa. Nhiệt độ °C, độ ẩm %, gió km/h. */
export interface Weather {
  temp: number
  /** Nhiệt độ cảm nhận */
  feels: number
  humidity: number
  wind: number
  /** Mã WMO — đưa vào describeWeather() */
  code: number
  /** false = ban đêm → biểu tượng mặt trăng */
  isDay: boolean
  /** Dự báo theo ngày (YYYY-MM-DD giờ địa phương); rain = % khả năng mưa cao nhất, null nếu nguồn không có */
  days: { date: string; max: number; min: number; code: number; rain: number | null }[]
  /** Thời điểm tải (ms) */
  fetched: number
}

/** Chuẩn hóa phản hồi /v1/forecast của Open-Meteo; null nếu thiếu dữ liệu. */
export function parseOpenMeteo(json: unknown, now: number): Weather | null {
  const j = json as {
    current?: Record<string, number>
    daily?: {
      time?: string[]
      temperature_2m_max?: number[]
      temperature_2m_min?: number[]
      weather_code?: number[]
      precipitation_probability_max?: (number | null)[]
    }
  }
  const c = j?.current
  if (!c || typeof c.temperature_2m !== 'number') return null
  const d = j.daily ?? {}
  const days = (d.time ?? []).map((date, i) => ({
    date,
    max: d.temperature_2m_max?.[i] ?? NaN,
    min: d.temperature_2m_min?.[i] ?? NaN,
    code: d.weather_code?.[i] ?? -1,
    rain: d.precipitation_probability_max?.[i] ?? null,
  }))
  return {
    temp: c.temperature_2m,
    feels: c.apparent_temperature ?? c.temperature_2m,
    humidity: c.relative_humidity_2m ?? 0,
    wind: c.wind_speed_10m ?? 0,
    code: c.weather_code ?? -1,
    isDay: c.is_day !== 0,
    days,
    fetched: now,
  }
}

const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/** "2026-11-15" → "Hôm nay" / "Mai" / "T2"… so với ngày `today` (YYYY-MM-DD). */
export function dayLabel(date: string, today: string): string {
  if (date === today) return 'Hôm nay'
  const ms = Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)
  if (ms === 86_400_000) return 'Mai'
  return WD[new Date(`${date}T00:00:00Z`).getUTCDay()] ?? date
}
