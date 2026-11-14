import { describe, expect, it } from 'vitest'
import { formatDate, formatTime, greeting, nudge } from './greeting'

describe('greeting', () => {
  it('đổi theo khung giờ, đúng ở biên', () => {
    expect(greeting(0)).toBe('Khuya rồi')
    expect(greeting(4)).toBe('Khuya rồi')
    expect(greeting(5)).toBe('Chào buổi sáng')
    expect(greeting(11)).toBe('Chào buổi trưa')
    expect(greeting(13)).toBe('Chào buổi chiều')
    expect(greeting(18)).toBe('Chào buổi tối')
    expect(greeting(23)).toBe('Chào buổi tối')
  })
})

describe('nudge', () => {
  it('mọi giờ đều có câu nhắn', () => {
    for (let h = 0; h < 24; h++) expect(nudge(h).length).toBeGreaterThan(0)
    expect(nudge(22)).not.toBe(nudge(21))
  })
})

describe('formatDate / formatTime', () => {
  it('thứ tiếng Việt, DD/MM/YYYY, giờ 24h có số 0', () => {
    const d = new Date(2026, 10, 14, 8, 5)
    expect(formatDate(d)).toBe('Thứ bảy, 14/11/2026')
    expect(formatTime(d)).toBe('08:05')
    expect(formatDate(new Date(2026, 0, 4))).toBe('Chủ nhật, 04/01/2026')
  })
})
