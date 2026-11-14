import { describe, expect, it } from 'vitest'
import { countByStatus, filterApps, normalize, openable, sortApps, type FoxApp } from './apps'

const mk = (p: Partial<FoxApp> & Pick<FoxApp, 'code' | 'name' | 'status'>): FoxApp => ({
  area: '',
  desc: '',
  mascot: 'fox.svg',
  accent: '#000',
  ...p,
})

const APPS: FoxApp[] = [
  mk({ code: 'FW', name: 'Fox.CôngViệc', status: 'planned', area: 'Công việc' }),
  mk({
    code: 'FF',
    name: 'Fox.TàiChính',
    status: 'live',
    area: 'Tài chính',
    url: 'https://x',
    tags: ['thu chi'],
  }),
  mk({ code: 'FH', name: 'Fox.SứcKhỏe', status: 'building', area: 'Sức khỏe', url: 'http://y' }),
  mk({ code: 'FL', name: 'Fox.HọcTập', status: 'planned', area: 'Học tập', url: 'http://z' }),
]

describe('normalize', () => {
  it('bỏ dấu, đ → d, chữ thường', () => {
    expect(normalize('  Đồng Hồ Tài Chính ')).toBe('dong ho tai chinh')
  })
})

describe('filterApps', () => {
  it('chuỗi rỗng → trả đủ, không đổi mảng gốc', () => {
    const r = filterApps(APPS, '   ')
    expect(r).toHaveLength(4)
    expect(r).not.toBe(APPS)
  })
  it('tìm không dấu ra tên có dấu', () => {
    expect(filterApps(APPS, 'tai chinh').map((a) => a.code)).toEqual(['FF'])
  })
  it('tìm theo tag và mã', () => {
    expect(filterApps(APPS, 'thu chi').map((a) => a.code)).toEqual(['FF'])
    expect(filterApps(APPS, 'fh').map((a) => a.code)).toEqual(['FH'])
  })
  it('mọi từ phải khớp', () => {
    expect(filterApps(APPS, 'suc taichinh')).toEqual([])
  })
})

describe('sortApps', () => {
  it('đang chạy → đang xây → kế hoạch, giữ thứ tự trong nhóm', () => {
    expect(sortApps(APPS).map((a) => a.code)).toEqual(['FF', 'FH', 'FW', 'FL'])
  })
})

describe('openable', () => {
  it('bỏ app kế hoạch và app không có link', () => {
    expect(openable(APPS).map((a) => a.code)).toEqual(['FF', 'FH'])
  })
})

describe('countByStatus', () => {
  it('đếm theo trạng thái', () => {
    expect(countByStatus(APPS)).toEqual({ live: 1, building: 1, planned: 2 })
  })
})
