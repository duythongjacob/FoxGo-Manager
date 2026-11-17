import { describe, expect, it } from 'vitest'
import { compactVnd, goldPerLuong, isMarket, isUsdVnd, parseCoinGecko, parseUsdVnd, pct, usd } from './market'

describe('parseCoinGecko', () => {
  it('đọc Bitcoin và PAX Gold', () => {
    const m = parseCoinGecko({
      bitcoin: { usd: 97000, vnd: 2.4e9, usd_24h_change: 1.5, last_updated_at: 100 },
      'pax-gold': { usd: 2650, vnd: 6.7e7, last_updated_at: 200 },
    })
    expect(m).toEqual({
      btc: { usd: 97000, vnd: 2.4e9, change24h: 1.5 },
      gold: { usd: 2650, vnd: 6.7e7, change24h: null },
      updated: 200_000,
    })
  })

  it('thiếu dữ liệu → null', () => {
    expect(parseCoinGecko({ bitcoin: { usd: 1, vnd: 1 } })).toBeNull()
    expect(parseCoinGecko(null)).toBeNull()
  })
})

describe('parseUsdVnd', () => {
  it('lấy VND', () => {
    expect(parseUsdVnd({ result: 'success', rates: { VND: 25400 }, time_last_update_unix: 10 })).toEqual({
      rate: 25400,
      updated: 10_000,
    })
  })
  it('lỗi → null', () => {
    expect(parseUsdVnd({ result: 'error' })).toBeNull()
    expect(parseUsdVnd({ result: 'success', rates: {} })).toBeNull()
  })
})

describe('định dạng', () => {
  it('quy đổi vàng ra đ/lượng', () => {
    expect(Math.round(goldPerLuong(2000, 25000))).toBe(60_282_500)
  })
  it('rút gọn VND', () => {
    expect(compactVnd(1_900_000_000)).toBe('1.90 tỷ')
    expect(compactVnd(122_940_000)).toBe('122.9 tr')
    expect(compactVnd(25_400.4)).toBe('25,400')
  })
  it('phần trăm và USD', () => {
    expect(pct(1.234)).toBe('+1.23%')
    expect(pct(-0.4)).toBe('-0.40%')
    expect(pct(null)).toBeNull()
    expect(usd(97250.6)).toBe('$97,251')
  })
})

describe('isMarket / isUsdVnd (kiểm đệm localStorage)', () => {
  it('nhận dữ liệu đúng dạng', () => {
    const m = parseCoinGecko({ bitcoin: { usd: 1, vnd: 2 }, 'pax-gold': { usd: 3, vnd: 4 } })
    expect(isMarket(m)).toBe(true)
    expect(isUsdVnd({ rate: 25400, updated: 0 })).toBe(true)
  })
  it('từ chối đệm hỏng', () => {
    for (const bad of [null, {}, { btc: {}, gold: {} }, 'x']) expect(isMarket(bad)).toBe(false)
    for (const bad of [null, {}, { rate: -1, updated: 0 }, { rate: '25400', updated: 0 }])
      expect(isUsdVnd(bad)).toBe(false)
  })
})
