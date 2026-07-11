import { describe, expect, it } from 'vitest'
import { calculatePayout, calculateQualityScore, payoutCoefficient } from './domain'

describe('payout calculation', () => {
  it('uses quality bands', () => {
    expect(payoutCoefficient(59)).toBe(0.5)
    expect(payoutCoefficient(60)).toBe(0.8)
    expect(payoutCoefficient(75)).toBe(1)
    expect(payoutCoefficient(90)).toBe(1.25)
  })

  it('multiplies the base rate', () => {
    expect(calculatePayout(1000, 94, 500, 'VALID')).toBe(1750)
    expect(calculatePayout(1000, 94, 500, 'INVALID')).toBe(0)
  })

  it('calculates quality only from operator criteria', () => {
    const criteria = [
      { label: 'Шаги', score: 100, weight: 50, note: '' },
      { label: 'Общение', score: 80, weight: 50, note: '' },
    ]
    expect(calculateQualityScore(criteria)).toBe(90)
  })
})
