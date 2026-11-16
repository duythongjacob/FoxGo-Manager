import { describe, expect, it } from 'vitest'
import { clamp01, stepOf } from './motion'

describe('clamp01', () => {
  it('kẹp về [0, 1], NaN → 0', () => {
    expect(clamp01(-2)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(3)).toBe(1)
    expect(clamp01(NaN)).toBe(0)
  })
})

describe('stepOf', () => {
  it('chia đều thành n bước, p = 1 vẫn là bước cuối', () => {
    expect(stepOf(0, 4)).toBe(0)
    expect(stepOf(0.24, 4)).toBe(0)
    expect(stepOf(0.25, 4)).toBe(1)
    expect(stepOf(0.99, 4)).toBe(3)
    expect(stepOf(1, 4)).toBe(3)
  })

  it('ngoài [0, 1] (tiến độ chia cho một phần quãng cuộn) vẫn nằm trong 0…n-1', () => {
    expect(stepOf(-0.3, 6)).toBe(0)
    expect(stepOf(1.25, 6)).toBe(5)
    expect(stepOf(0.7, 1)).toBe(0)
  })
})
