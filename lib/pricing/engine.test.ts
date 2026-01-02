import { describe, it, expect } from 'vitest'
import {
  calculateRentalDays,
  calculatePricing,
  calculateOverage,
  formatCents,
  parseDate,
  type PricingRule,
} from './engine'

// Sample pricing rule matching our seed data (15 yard dumpster)
const sampleRule: PricingRule = {
  base_price: 39900,      // $399.00
  delivery_fee: 0,
  haul_fee: 0,
  included_days: 3,
  extra_day_fee: 2500,    // $25.00/day
  included_tons: 1.00,
  overage_per_ton: 10000, // $100.00/ton
  dumpster_size: 15,
  waste_type: 'household_trash',
  public_notes: 'Test notes',
}

describe('calculateRentalDays', () => {
  it('should return 0 for same-day pickup', () => {
    const dropoff = new Date(2025, 0, 15) // Jan 15
    const pickup = new Date(2025, 0, 15)  // Jan 15
    expect(calculateRentalDays(dropoff, pickup)).toBe(0)
  })

  it('should return 1 for next-day pickup', () => {
    const dropoff = new Date(2025, 0, 15) // Jan 15
    const pickup = new Date(2025, 0, 16)  // Jan 16
    expect(calculateRentalDays(dropoff, pickup)).toBe(1)
  })

  it('should return 3 for 3-day rental', () => {
    const dropoff = new Date(2025, 0, 15) // Jan 15
    const pickup = new Date(2025, 0, 18)  // Jan 18
    expect(calculateRentalDays(dropoff, pickup)).toBe(3)
  })

  it('should return 7 for week-long rental', () => {
    const dropoff = new Date(2025, 0, 15) // Jan 15
    const pickup = new Date(2025, 0, 22)  // Jan 22
    expect(calculateRentalDays(dropoff, pickup)).toBe(7)
  })

  it('should handle month boundary', () => {
    const dropoff = new Date(2025, 0, 30) // Jan 30
    const pickup = new Date(2025, 1, 2)   // Feb 2
    expect(calculateRentalDays(dropoff, pickup)).toBe(3)
  })

  it('should return 0 for invalid dates (pickup before dropoff)', () => {
    const dropoff = new Date(2025, 0, 20)
    const pickup = new Date(2025, 0, 15)
    expect(calculateRentalDays(dropoff, pickup)).toBe(0)
  })
})

describe('calculatePricing', () => {
  it('should calculate correct pricing for 3-day rental (included days)', () => {
    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18) // 3 days

    const result = calculatePricing(sampleRule, dropoff, pickup)

    expect(result.snapshot.rental_days).toBe(3)
    expect(result.snapshot.extra_days).toBe(0)
    expect(result.snapshot.base_price).toBe(39900)
    expect(result.snapshot.total).toBe(39900) // $399, no extras
    expect(result.lineItems).toHaveLength(1) // Just base price
    expect(result.lineItems[0].type).toBe('base')
  })

  it('should calculate correct pricing for 5-day rental (2 extra days)', () => {
    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 20) // 5 days

    const result = calculatePricing(sampleRule, dropoff, pickup)

    expect(result.snapshot.rental_days).toBe(5)
    expect(result.snapshot.extra_days).toBe(2)
    expect(result.snapshot.total).toBe(39900 + (2 * 2500)) // $399 + $50 = $449
    expect(result.lineItems).toHaveLength(2) // Base + extra days
  })

  it('should calculate correct pricing for 10-day rental (7 extra days)', () => {
    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 25) // 10 days

    const result = calculatePricing(sampleRule, dropoff, pickup)

    expect(result.snapshot.rental_days).toBe(10)
    expect(result.snapshot.extra_days).toBe(7)
    expect(result.snapshot.total).toBe(39900 + (7 * 2500)) // $399 + $175 = $574
  })

  it('should include delivery fee when present', () => {
    const ruleWithDelivery: PricingRule = {
      ...sampleRule,
      delivery_fee: 5000, // $50
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18)

    const result = calculatePricing(ruleWithDelivery, dropoff, pickup)

    expect(result.snapshot.delivery_fee).toBe(5000)
    expect(result.snapshot.total).toBe(39900 + 5000) // $449
    expect(result.lineItems).toHaveLength(2) // Base + delivery
  })

  it('should include haul fee when present', () => {
    const ruleWithHaul: PricingRule = {
      ...sampleRule,
      haul_fee: 7500, // $75
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18)

    const result = calculatePricing(ruleWithHaul, dropoff, pickup)

    expect(result.snapshot.haul_fee).toBe(7500)
    expect(result.snapshot.total).toBe(39900 + 7500) // $474.00
  })

  it('should throw error when pickup is before dropoff', () => {
    const dropoff = new Date(2025, 0, 20)
    const pickup = new Date(2025, 0, 15)

    expect(() => calculatePricing(sampleRule, dropoff, pickup))
      .toThrow('Pickup date must be on or after dropoff date')
  })

  it('should preserve snapshot data correctly', () => {
    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18)

    const result = calculatePricing(sampleRule, dropoff, pickup)

    expect(result.snapshot.included_days).toBe(3)
    expect(result.snapshot.included_tons).toBe(1.00)
    expect(result.snapshot.overage_per_ton).toBe(10000)
    expect(result.snapshot.dumpster_size).toBe(15)
    expect(result.snapshot.waste_type).toBe('household_trash')
    expect(result.snapshot.notes).toBe('Test notes')
  })
})

describe('calculateOverage', () => {
  const snapshot = {
    base_price: 39900,
    delivery_fee: 0,
    haul_fee: 0,
    included_days: 3,
    extra_day_fee: 2500,
    included_tons: 1.00,
    overage_per_ton: 10000,
    rental_days: 3,
    extra_days: 0,
    subtotal: 39900,
    total: 39900,
    dumpster_size: 15,
    waste_type: 'household_trash',
    notes: null,
  }

  it('should return 0 when actual tons is within included', () => {
    expect(calculateOverage(snapshot, 0.5)).toBe(0)
    expect(calculateOverage(snapshot, 1.0)).toBe(0)
  })

  it('should calculate overage for 0.5 tons over', () => {
    // 1.5 tons - 1.0 included = 0.5 tons overage
    // 0.5 * $100 = $50
    expect(calculateOverage(snapshot, 1.5)).toBe(5000)
  })

  it('should calculate overage for 2 tons over', () => {
    // 3.0 tons - 1.0 included = 2.0 tons overage
    // 2.0 * $100 = $200
    expect(calculateOverage(snapshot, 3.0)).toBe(20000)
  })

  it('should handle fractional tons', () => {
    // 1.25 tons - 1.0 included = 0.25 tons overage
    // 0.25 * $100 = $25
    expect(calculateOverage(snapshot, 1.25)).toBe(2500)
  })

  it('should handle larger included tons (20 yard)', () => {
    const snapshot20 = { ...snapshot, included_tons: 2.00 }

    expect(calculateOverage(snapshot20, 1.5)).toBe(0)
    expect(calculateOverage(snapshot20, 2.0)).toBe(0)
    expect(calculateOverage(snapshot20, 2.5)).toBe(5000) // 0.5 tons over
  })
})

describe('formatCents', () => {
  it('should format whole dollars', () => {
    expect(formatCents(39900)).toBe('$399.00')
  })

  it('should format with cents', () => {
    expect(formatCents(39950)).toBe('$399.50')
  })

  it('should format zero', () => {
    expect(formatCents(0)).toBe('$0.00')
  })

  it('should format large amounts with commas', () => {
    expect(formatCents(125000)).toBe('$1,250.00')
  })
})

describe('parseDate', () => {
  it('should parse YYYY-MM-DD format', () => {
    const date = parseDate('2025-01-15')
    expect(date.getFullYear()).toBe(2025)
    expect(date.getMonth()).toBe(0) // January is 0
    expect(date.getDate()).toBe(15)
  })

  it('should parse February date', () => {
    const date = parseDate('2025-02-28')
    expect(date.getMonth()).toBe(1) // February is 1
    expect(date.getDate()).toBe(28)
  })
})

describe('pricing scenarios', () => {
  it('should calculate 10 yard dumpster correctly', () => {
    const rule10: PricingRule = {
      base_price: 35000,      // $350
      delivery_fee: 0,
      haul_fee: 0,
      included_days: 3,
      extra_day_fee: 2500,
      included_tons: 1.00,
      overage_per_ton: 10000,
      dumpster_size: 10,
      waste_type: 'household_trash',
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18) // 3 days

    const result = calculatePricing(rule10, dropoff, pickup)
    expect(result.snapshot.total).toBe(35000) // $350
  })

  it('should calculate 20 yard dumpster correctly', () => {
    const rule20: PricingRule = {
      base_price: 50000,      // $500
      delivery_fee: 0,
      haul_fee: 0,
      included_days: 3,
      extra_day_fee: 2500,
      included_tons: 2.00,
      overage_per_ton: 10000,
      dumpster_size: 20,
      waste_type: 'construction_debris',
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 22) // 7 days (4 extra)

    const result = calculatePricing(rule20, dropoff, pickup)
    expect(result.snapshot.total).toBe(50000 + (4 * 2500)) // $500 + $100 = $600
    expect(result.snapshot.included_tons).toBe(2.00)
  })
})
