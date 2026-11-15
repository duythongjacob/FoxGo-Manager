import { describe, expect, it } from 'vitest'
import { cityByName, dayLabel, DEFAULT_CITY, describeWeather, parseOpenMeteo } from './weather'

describe('describeWeather', () => {
  it('mã WMO → mô tả + biểu tượng', () => {
    expect(describeWeather(0)).toEqual({ text: 'Trời quang', icon: 'sun' })
    expect(describeWeather(63)).toEqual({ text: 'Mưa vừa', icon: 'rain' })
    expect(describeWeather(999)).toEqual({ text: 'Không rõ', icon: 'cloud' })
  })
})

describe('parseOpenMeteo', () => {
  it('chuẩn hóa phản hồi', () => {
    const w = parseOpenMeteo(
      {
        current: {
          temperature_2m: 27.4,
          apparent_temperature: 30,
          relative_humidity_2m: 80,
          wind_speed_10m: 9,
          weather_code: 2,
          is_day: 1,
        },
        daily: {
          time: ['2026-11-14'],
          temperature_2m_max: [29],
          temperature_2m_min: [22],
          weather_code: [61],
          precipitation_probability_max: [40],
        },
      },
      5,
    )
    expect(w).toMatchObject({ temp: 27.4, feels: 30, humidity: 80, isDay: true, fetched: 5 })
    expect(w?.days[0]).toEqual({ date: '2026-11-14', max: 29, min: 22, code: 61, rain: 40 })
  })
  it('thiếu nhiệt độ → null', () => {
    expect(parseOpenMeteo({ current: {} }, 0)).toBeNull()
  })
})

describe('thành phố & ngày', () => {
  it('tên lạ → mặc định', () => {
    expect(cityByName('Đà Nẵng').name).toBe('Đà Nẵng')
    expect(cityByName('Atlantis')).toBe(DEFAULT_CITY)
    expect(cityByName(null)).toBe(DEFAULT_CITY)
  })
  it('nhãn ngày', () => {
    expect(dayLabel('2026-11-14', '2026-11-14')).toBe('Hôm nay')
    expect(dayLabel('2026-11-15', '2026-11-14')).toBe('Mai')
    expect(dayLabel('2026-11-16', '2026-11-14')).toBe('T2')
  })
})
