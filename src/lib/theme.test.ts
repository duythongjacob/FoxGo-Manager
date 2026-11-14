import { describe, expect, it } from 'vitest'
import { nextMode, parseMode, resolveDark } from './theme'

describe('parseMode', () => {
  it('giá trị lạ / rỗng → system', () => {
    expect(parseMode(null)).toBe('system')
    expect(parseMode(undefined)).toBe('system')
    expect(parseMode('blue')).toBe('system')
    expect(parseMode('dark')).toBe('dark')
  })
})

describe('resolveDark', () => {
  it('chế độ cố định bỏ qua hệ thống', () => {
    expect(resolveDark('dark', false)).toBe(true)
    expect(resolveDark('light', true)).toBe(false)
  })
  it('theo hệ thống', () => {
    expect(resolveDark('system', true)).toBe(true)
    expect(resolveDark('system', false)).toBe(false)
  })
})

describe('nextMode', () => {
  it('xoay vòng đủ 3 chế độ', () => {
    expect(nextMode('system')).toBe('light')
    expect(nextMode('light')).toBe('dark')
    expect(nextMode('dark')).toBe('system')
  })
})
