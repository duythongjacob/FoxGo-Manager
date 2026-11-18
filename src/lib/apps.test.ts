import { describe, expect, it } from 'vitest'
import { normalize, sortApps, type FoxApp } from './apps'

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

describe('sortApps', () => {
  it('mở được (đang chạy / đang xây) → kế hoạch, giữ thứ tự trong nhóm', () => {
    expect(sortApps(APPS).map((a) => a.code)).toEqual(['FF', 'FH', 'FW', 'FL'])
  })
  it('đang xây đứng trước đang chạy nếu khai báo trước', () => {
    const list = [APPS[2], APPS[1]]
    expect(sortApps(list).map((a) => a.code)).toEqual(['FH', 'FF'])
  })
})
