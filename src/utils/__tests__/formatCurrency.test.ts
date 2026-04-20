import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../formatCurrency'

// Exempeltest — visar studenterna att setupen fungerar
describe('formatCurrency', () => {
  it('formaterar ett heltal med två decimaler', () => {
    expect(formatCurrency(100)).toBe('100.00 kr')
  })
})
