import { describe, expect, it } from 'vitest'
import { applyOrder, MAX_DESC, MAX_LINKS, move, nameFromUrl, normalizeUrl, parsePrefs } from './prefs'

describe('prefs (FD-005)', () => {
  it('normalizeUrl: thêm https, chỉ nhận http/https', () => {
    expect(normalizeUrl('youtube.com')).toBe('https://youtube.com/')
    expect(normalizeUrl('  http://a.vn/x?y=1 ')).toBe('http://a.vn/x?y=1')
    expect(normalizeUrl('http://localhost:5175')).toBe('http://localhost:5175/')
    expect(normalizeUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeUrl('data:text/html,hi')).toBeNull()
    expect(normalizeUrl('abc')).toBeNull()
    expect(normalizeUrl('a b.com')).toBeNull()
    expect(normalizeUrl('')).toBeNull()
  })
  it('nameFromUrl', () => {
    expect(nameFromUrl('https://www.youtube.com/watch')).toBe('youtube')
    expect(nameFromUrl('lạ')).toBe('lạ')
  })
  it('parsePrefs: bỏ dữ liệu hỏng, link nguy hiểm, trùng id; giới hạn số link', () => {
    expect(parsePrefs(null)).toEqual({ order: [], newTab: false, links: [], lineFx: 'normal' })
    const p = parsePrefs({
      order: ['app:FF', 1, 'app:FF', 'link:a'],
      newTab: true,
      links: [
        { id: 'a', name: ' Mail ', url: 'mail.google.com' },
        { id: 'a', name: 'trùng', url: 'x.com' },
        { id: 'b', name: 'xấu', url: 'javascript:alert(1)' },
        { id: 'c', name: '', url: 'y.com' },
        'rác',
      ],
    })
    expect(p.order).toEqual(['app:FF', 'link:a'])
    expect(p.newTab).toBe(true)
    expect(p.links).toEqual([{ id: 'a', name: 'Mail', url: 'https://mail.google.com/' }])
    const many = Array.from({ length: 40 }, (_, i) => ({ id: `${i}`, name: 'n', url: 'a.vn' }))
    expect(parsePrefs({ links: many }).links).toHaveLength(MAX_LINKS)
  })
  it('parsePrefs: hiệu ứng line — nhận normal/slow/off, giá trị lạ → normal', () => {
    expect(parsePrefs({ lineFx: 'slow' }).lineFx).toBe('slow')
    expect(parsePrefs({ lineFx: 'off' }).lineFx).toBe('off')
    expect(parsePrefs({ lineFx: 'nhanh' }).lineFx).toBe('normal')
    expect(parsePrefs({ lineFx: 1 }).lineFx).toBe('normal')
  })
  it('parsePrefs: giữ mô tả link (cắt độ dài), bỏ mô tả rỗng/sai kiểu', () => {
    const p = parsePrefs({
      links: [
        { id: 'a', name: 'A', url: 'a.com', desc: '  Video  ' },
        { id: 'b', name: 'B', url: 'b.com', desc: '   ' },
        { id: 'c', name: 'C', url: 'c.com', desc: 5 },
        { id: 'd', name: 'D', url: 'd.com', desc: 'x'.repeat(100) },
      ],
    })
    expect(p.links.map((l) => l.desc)).toEqual(['Video', undefined, undefined, 'x'.repeat(MAX_DESC)])
  })
  it('applyOrder: theo order, mục mới ở cuối giữ thứ tự gốc, khóa thừa bị bỏ', () => {
    const items = ['a', 'b', 'c', 'd']
    expect(applyOrder(items, (x) => x, ['c', 'zzz', 'a'])).toEqual(['c', 'a', 'b', 'd'])
    expect(applyOrder(items, (x) => x, [])).toEqual(items)
  })
  it('move', () => {
    expect(move([1, 2, 3], 1, -1)).toEqual([2, 1, 3])
    expect(move([1, 2, 3], 2, 1)).toEqual([1, 2, 3])
    expect(move([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
  })
})
