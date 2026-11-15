import { describe, expect, it } from 'vitest'
import { href, parseRoute } from './route'

describe('parseRoute', () => {
  it('trống hoặc "/" → trang chủ', () => {
    expect(parseRoute('')).toEqual({ id: 'home' })
    expect(parseRoute('#/')).toEqual({ id: 'home' })
  })

  it('nhận trang Giới thiệu', () => {
    expect(parseRoute('#/gioi-thieu')).toEqual({ id: 'about' })
  })

  it('tách mục con để cuộn tới', () => {
    expect(parseRoute('#/gioi-thieu/FF')).toEqual({ id: 'about', anchor: 'ff' })
  })

  it('đường dẫn lạ (kể cả tab Ứng dụng cũ) → trang chủ', () => {
    expect(parseRoute('#/khong-co')).toEqual({ id: 'home' })
    expect(parseRoute('#/ung-dung')).toEqual({ id: 'home' })
  })
})

describe('href', () => {
  it('tạo hash khớp parseRoute', () => {
    expect(href('home')).toBe('#/')
    expect(href('about', 'fh')).toBe('#/gioi-thieu/fh')
    expect(parseRoute(href('about'))).toEqual({ id: 'about' })
  })
})
