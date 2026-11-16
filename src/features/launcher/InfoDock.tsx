/**
 * Thanh thông số bên trái trang chủ — xem docs/features/thanh-thong-so.md.
 * Gọi dịch vụ ngoài qua data/external.ts (đã có đệm); file này lo vòng làm mới, trạng thái tải/lỗi và hiển thị.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { ConfigProvider, Select, theme, type ThemeConfig } from 'antd'
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import WxIcon from '@/components/WxIcon'
import { FUEL, fetchMarket, fetchUsdVnd, fetchWeather, readCityName, saveCityName } from '@/data/external'
import { normalize } from '@/lib/apps'
import { fuelDateLabel, pickRon95 } from '@/lib/fuel'
import { href } from '@/lib/route'
import { formatDate, formatTime, greeting } from '@/lib/greeting'
import { compactVnd, goldPerLuong, OZ_PER_LUONG, pct, usd, type Market } from '@/lib/market'
import { cityByName, dayLabel, describeWeather, VN_CITIES, type Weather } from '@/lib/weather'

/** Chu kỳ hỏi lại dịch vụ ngoài (đệm trong external.ts vẫn quyết định có gọi mạng thật hay không). */
const REFRESH_MS = 10 * 60_000
/** Thử lại sau lỗi giá thị trường (CoinGecko miễn phí hay trả 429). */
const RETRY_MS = 60_000

/** Ô chọn thành phố: nền tối của trang chủ cần giao diện tối của AntD với màu nền xanh đậm khớp thanh thông số. */
const DARK: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: { colorPrimary: '#2dd4bf', colorBgElevated: '#0d2f2b', borderRadiusLG: 12 },
}
/** Giao diện sáng: dùng theme mặc định (đã cấu hình ở Root), chỉ bo góc khớp. */
const LIGHT: ThemeConfig = { token: { borderRadiusLG: 12 } }

/** Giờ hiện tại, tự cập nhật mỗi `intervalMs` (15 giây là đủ cho đồng hồ hh:mm). */
function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/** Ngày theo giờ máy, dạng YYYY-MM-DD (khớp `daily.time` của Open-Meteo với timezone=auto). */
const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const hhmm = (ms: number) => formatTime(new Date(ms))

/** % thay đổi 24 giờ có màu tăng/giảm; |v| ≤ 0,005% coi như đứng giá (không tô màu). */
function Change({ v }: { v: number | null }) {
  if (v === null) return null
  const dir = v > 0.005 ? 'up' : v < -0.005 ? 'down' : ''
  return <span className={`dk-chg ${dir}`}>{pct(v)}</span>
}

/** Xăng RON95 vùng 1 kỳ gần nhất — tính một lần (snapshot không đổi khi trang đang mở). */
const RON95 = FUEL ? pickRon95(FUEL.items) : null

/** Một dòng giá: nhãn bên trái, giá trị + biến động bên phải; `title` = tooltip riêng của dòng. */
function Stat({
  label,
  value,
  change,
  failed,
  title,
}: {
  label: string
  value?: ReactNode
  change?: ReactNode
  failed: boolean
  title?: string
}) {
  return (
    <li className="dk-stat" title={title}>
      <span className="dk-label">{label}</span>
      {value !== undefined ? (
        <span className="dk-stat-val">
          <b className="dk-value">{value}</b>
          {change}
        </span>
      ) : failed ? (
        <span className="dk-wait is-failed">Chưa tải được</span>
      ) : (
        <span className="dk-skel" style={{ width: 84 }} aria-label="Đang tải" />
      )}
    </li>
  )
}

/**
 * Thanh dọc bên trái trang chủ: giờ + lời chào, thời tiết (Open-Meteo), vàng thế giới quy đổi đ/lượng
 * + Bitcoin (CoinGecko), USD/VND (ExchangeRate-API). Chỉ để tham khảo. Không gửi dữ liệu cá nhân.
 */
export default function InfoDock({
  dark,
  collapsed,
  onToggle,
  onSettings,
}: {
  /** Trang đang ở giao diện tối? */
  dark: boolean
  collapsed: boolean
  onToggle: () => void
  /** Mở popup Cài đặt trang chủ (FD-005) */
  onSettings: () => void
}) {
  const now = useNow(15_000)
  const [city, setCity] = useState(() => cityByName(readCityName()))
  const [w, setW] = useState<Weather | null>(null)
  const [wErr, setWErr] = useState(false)
  const [m, setM] = useState<Market | null>(null)
  const [mErr, setMErr] = useState(false)
  const [rate, setRate] = useState<{ rate: number; updated: number } | null>(null)
  const [rErr, setRErr] = useState(false)

  // Thời tiết: tải ngay + mỗi 10 phút; đổi thành phố → chạy lại. `alive` chặn setState sau khi rời trang.
  useEffect(() => {
    let alive = true
    const load = () => {
      fetchWeather(city)
        .then((r) => {
          if (!alive) return
          setW(r.value)
          setWErr(false)
        })
        .catch(() => {
          if (alive) setWErr(true)
        })
    }
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [city])

  // Giá vàng/Bitcoin + tỷ giá: tải ngay + mỗi 10 phút; lỗi CoinGecko thì thử lại sau 1 phút.
  useEffect(() => {
    let alive = true
    let retry: ReturnType<typeof setTimeout> | undefined
    const load = () => {
      clearTimeout(retry)
      fetchMarket()
        .then((r) => {
          if (!alive) return
          setM(r.value)
          setMErr(false)
        })
        .catch(() => {
          if (!alive) return
          setMErr(true)
          // CoinGecko miễn phí hay trả 429 (quá nhiều yêu cầu) → thử lại sớm, không đợi chu kỳ 10 phút
          retry = setTimeout(load, RETRY_MS)
        })
      fetchUsdVnd()
        .then((r) => {
          if (!alive) return
          setRate(r.value)
          setRErr(false)
        })
        .catch(() => {
          if (alive) setRErr(true)
        })
    }
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => {
      alive = false
      clearInterval(t)
      clearTimeout(retry)
    }
  }, [])

  const onCity = (name: string) => {
    const c = cityByName(name)
    setCity(c)
    setW(null)
    saveCityName(c.name)
  }

  const [weekday, date] = formatDate(now).split(', ')
  const wx = w ? describeWeather(w.code) : null
  const today = isoDay(now)
  // vàng: ưu tiên quy đổi theo tỷ giá ExchangeRate-API; chưa có thì dùng giá VND của CoinGecko
  const goldLuong = m ? (rate ? goldPerLuong(m.gold.usd, rate.rate) : m.gold.vnd * OZ_PER_LUONG) : null
  // Nguồn bắt buộc ghi (Open-Meteo CC BY 4.0, ExchangeRate-API) — để trong tooltip, không chiếm chỗ trên giao diện
  const source =
    'Nguồn: Open-Meteo · CoinGecko (PAX Gold ≈ 1 oz vàng thế giới, chưa gồm chênh lệch vàng miếng trong nước) · ' +
    `ExchangeRate-API${m ? ` · cập nhật ${hhmm(m.updated)}` : ''}` +
    `${FUEL ? ` · xăng: ${FUEL.source}, kỳ ${fuelDateLabel(FUEL.priceDate)}` : ''}. Chỉ để tham khảo.`

  const cityOptions = VN_CITIES.map((c) => ({ value: c.name, label: c.name }))

  return (
    <>
      {/* Nền mờ (chỉ điện thoại) + nút menu luôn có sẵn; chỉ đổi class → chuyển động bằng CSS transition */}
      <div className={`dk-backdrop${collapsed ? '' : ' is-open'}`} onClick={onToggle} aria-hidden />
      <button
        type="button"
        className={`dk-toggle${collapsed ? '' : ' is-open'}`}
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls="fd-dock"
        aria-label={collapsed ? 'Mở rộng thanh thông số' : 'Thu nhỏ thanh thông số'}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>
      <aside
        id="fd-dock"
        className={`dk${collapsed ? ' is-collapsed' : ''}`}
        aria-label="Giờ, thời tiết và giá thị trường"
        title={source}
      >
        {/* Dựng cả hai dạng một lần, ẩn/hiện bằng CSS → bấm thu/mở không phải dựng lại (tránh giật) */}
        <div className="dk-rail" aria-hidden={!collapsed}>
          <b className="dk-rail-time">{formatTime(now)}</b>
          {w && wx && (
            <span className="dk-rail-wx" title={`${city.name}: ${wx.text}`}>
              <WxIcon kind={wx.icon} night={!w.isDay} size={22} />
              {Math.round(w.temp)}°
            </span>
          )}
        </div>
        <div className="dk-full" aria-hidden={collapsed}>
          <div className="dk-block">
            <b className="dk-time">{formatTime(now)}</b>
            <span className="dk-date">
              {weekday}, {date} · {greeting(now.getHours())}
            </span>
          </div>

          <div className="dk-block">
            <div className="dk-wx-row">
              <div className="dk-wx-now">
                {w && wx ? (
                  <>
                    <WxIcon kind={wx.icon} night={!w.isDay} size={18} />
                    <b className="dk-temp">{Math.round(w.temp)}°</b>
                    <span className="dk-wx-text">{wx.text}</span>
                  </>
                ) : wErr ? (
                  <span className="dk-wait is-failed">Chưa tải được thời tiết</span>
                ) : (
                  <span
                    className="dk-skel"
                    style={{ width: 110, height: 18 }}
                    aria-label="Đang tải thời tiết"
                  />
                )}
              </div>
              <ConfigProvider theme={dark ? DARK : LIGHT}>
                <Select
                  className="dk-city"
                  popupClassName="dk-city-pop"
                  variant="borderless"
                  size="small"
                  showSearch
                  value={city.name}
                  options={cityOptions}
                  onChange={onCity}
                  filterOption={(input, opt) =>
                    normalize(String(opt?.label ?? '')).includes(normalize(input))
                  }
                  suffixIcon={<EnvironmentOutlined />}
                  popupMatchSelectWidth={200}
                  placement="bottomRight"
                  aria-label="Chọn thành phố"
                />
              </ConfigProvider>
            </div>
            {w && w.days.length > 0 && (
              <ul className="dk-days" aria-label="Dự báo 3 ngày">
                {w.days.map((d) => (
                  <li key={d.date} title={describeWeather(d.code).text}>
                    <span>{dayLabel(d.date, today)}</span>
                    <span className="dk-range">
                      {Math.round(d.max)}° <i>{Math.round(d.min)}°</i>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ul className="dk-block dk-stats">
            <Stat
              label="Vàng"
              value={goldLuong !== null ? `${compactVnd(goldLuong)}/lượng` : undefined}
              change={m && <Change v={m.gold.change24h} />}
              failed={mErr}
            />
            <Stat
              label="USD"
              value={rate ? `${Math.round(rate.rate).toLocaleString('en-US')} đ` : undefined}
              failed={rErr}
            />
            <Stat
              label="Bitcoin"
              value={m ? usd(m.btc.usd) : undefined}
              change={m && <Change v={m.btc.change24h} />}
              failed={mErr}
            />
            {FUEL && RON95 && (
              <Stat
                label="Xăng RON95"
                value={`${RON95.region1.toLocaleString('en-US')} đ`}
                change={<span className="dk-chg">kỳ {fuelDateLabel(FUEL.priceDate).slice(0, 5)}</span>}
                failed={false}
                title={
                  `Giá bán lẻ ${RON95.name} vùng 1 của Petrolimex (đ/lít), kỳ điều hành ${fuelDateLabel(FUEL.priceDate)}` +
                  `${RON95.region2 ? ` · vùng 2: ${RON95.region2.toLocaleString('en-US')} đ` : ''}. Nguồn: ${FUEL.source}.`
                }
              />
            )}
          </ul>
        </div>

        <button
          type="button"
          className="dk-about dk-settings"
          onClick={onSettings}
          aria-label="Cài đặt trang chủ"
          title={collapsed ? 'Cài đặt' : undefined}
        >
          <SettingOutlined aria-hidden />
          <span className="dk-about-text">Cài đặt</span>
        </button>
        <a
          className="dk-about"
          href={href('about')}
          aria-label="Giới thiệu FoxGo"
          title={collapsed ? 'Giới thiệu' : undefined}
        >
          <InfoCircleOutlined aria-hidden />
          <span className="dk-about-text">Giới thiệu</span>
        </a>
      </aside>
    </>
  )
}
