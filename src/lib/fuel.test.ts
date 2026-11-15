import { describe, expect, it } from 'vitest'
import { htmlToText, parseGxhnText } from '../../scripts/fuel-parse.mjs'
import snapshot from '../data/fuel.json'
import { fuelDateLabel, isFuelPrices, pickRon95 } from './fuel'

describe('fuel', () => {
  it('pickRon95: ưu tiên RON 95-III / Mức 3, tránh loại V', () => {
    const gx = [
      { name: 'Xăng E10 RON 95 Mức 5', region1: 21840, region2: null, unit: '' },
      { name: 'Xăng E10 RON 95 Mức 3', region1: 19840, region2: null, unit: '' },
    ]
    expect(pickRon95(gx)!.region1).toBe(19840)
    expect(pickRon95([{ name: 'Xăng RON 95-V', region1: 1, region2: null, unit: '' }])!.name).toBe(
      'Xăng RON 95-V',
    )
    expect(pickRon95([{ name: 'Dầu DO', region1: 20000, region2: null, unit: '' }])).toBeNull()
  })
  it('parseGxhnText: bảng Petrolimex trên giaxanghomnay.com', () => {
    const html = `<div>Lịch sử thay đổi giá xăng dầu &#128197; Ngày 12/11/2026</div>
      <table><tr><th>Xăng/dầu</th><th>Tăng giảm</th><th>Tăng giảm kỳ trước*</th><th>Giá vùng 1</th><th>Giá vùng 2</th></tr>
      <tr><td>Xăng E5 RON 92 Mức 2</td><td>0</td><td>-1,500</td><td>19,390</td><td>19,770</td></tr>
      <tr><td>Xăng E10 RON 95 Mức 3</td><td>0</td><td>-1,310</td><td>19,840</td><td>20,230</td></tr></table>
      <p>giaxanghomnay.com Giá của Petrolimex cập nhật 2026-11-14 00:00:04</p>`
    const r = parseGxhnText(htmlToText(html))
    expect(r.priceDate).toBe('2026-11-12')
    expect(r.items.map((i) => [i.name, i.region1, i.region2])).toEqual([
      ['Xăng E5 RON 92 Mức 2', 19390, 19770],
      ['Xăng E10 RON 95 Mức 3', 19840, 20230],
    ])
    expect(parseGxhnText('không có bảng').items).toEqual([])
  })
  it('snapshot fuel.json trong bundle hợp lệ và có RON95', () => {
    expect(isFuelPrices(snapshot)).toBe(true)
    expect(pickRon95(snapshot.items)).not.toBeNull()
    expect(isFuelPrices({ priceDate: 'x', items: [] })).toBe(false)
  })
  it('fuelDateLabel', () => {
    expect(fuelDateLabel('2026-11-12')).toBe('12/11/2026')
    expect(fuelDateLabel('lạ')).toBe('lạ')
  })
})
