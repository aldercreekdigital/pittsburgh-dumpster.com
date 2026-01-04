import { describe, it, expect } from 'vitest'
import {
  calculateRentalDays,
  calculatePricing,
  calculateOverage,
  calculateProcessingFee,
  formatCents,
  parseDate,
  PA_TAX_RATE,
  STRIPE_PERCENTAGE,
  STRIPE_FIXED_FEE,
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

// Helper to calculate expected total with tax and processing fee
function expectedTotal(subtotal: number, taxableAmount: number, taxExempt = false, includeProcessingFee = true): number {
  const taxAmount = taxExempt ? 0 : Math.round(taxableAmount * PA_TAX_RATE)
  const preProcessing = subtotal + taxAmount
  const processingFee = includeProcessingFee ? Math.round(preProcessing * STRIPE_PERCENTAGE) + STRIPE_FIXED_FEE : 0
  return subtotal + taxAmount + processingFee
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
    expect(result.snapshot.subtotal).toBe(39900)
    expect(result.snapshot.taxable_amount).toBe(39900) // Only rental is taxable
    expect(result.snapshot.tax_amount).toBe(Math.round(39900 * PA_TAX_RATE)) // 7% of $399
    expect(result.snapshot.total).toBe(expectedTotal(39900, 39900))

    // Should have rental, tax, and processing fee line items
    expect(result.lineItems).toHaveLength(3)
    expect(result.lineItems[0].type).toBe('rental')
    expect(result.lineItems[0].taxable).toBe(true)
    expect(result.lineItems[1].type).toBe('tax')
    expect(result.lineItems[2].type).toBe('processing_fee')
  })

  it('should calculate correct pricing for 5-day rental (2 extra days)', () => {
    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 20) // 5 days

    const result = calculatePricing(sampleRule, dropoff, pickup)

    expect(result.snapshot.rental_days).toBe(5)
    expect(result.snapshot.extra_days).toBe(2)
    expect(result.snapshot.extended_service_fee).toBe(2 * 2500) // $50
    expect(result.snapshot.subtotal).toBe(39900 + 5000) // $449
    expect(result.snapshot.taxable_amount).toBe(39900) // Still only rental
    expect(result.snapshot.total).toBe(expectedTotal(44900, 39900))

    // Should have rental, extended service, tax, and processing fee
    expect(result.lineItems).toHaveLength(4)
    expect(result.lineItems[1].type).toBe('extended_service')
    expect(result.lineItems[1].label).toContain('Extended Service Days')
  })

  it('should skip tax for tax-exempt customers', () => {
    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18)

    const result = calculatePricing(sampleRule, dropoff, pickup, { taxExempt: true })

    expect(result.snapshot.tax_exempt).toBe(true)
    expect(result.snapshot.tax_rate).toBe(0)
    expect(result.snapshot.tax_amount).toBe(0)
    expect(result.snapshot.total).toBe(expectedTotal(39900, 39900, true))

    // Should NOT have tax line item
    const taxLine = result.lineItems.find(item => item.type === 'tax')
    expect(taxLine).toBeUndefined()
  })

  it('should skip processing fee when requested', () => {
    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18)

    const result = calculatePricing(sampleRule, dropoff, pickup, { includeProcessingFee: false })

    expect(result.snapshot.processing_fee).toBe(0)
    expect(result.snapshot.total).toBe(expectedTotal(39900, 39900, false, false))

    // Should NOT have processing fee line item
    const processingLine = result.lineItems.find(item => item.type === 'processing_fee')
    expect(processingLine).toBeUndefined()
  })

  it('should include delivery fee when present (non-taxable)', () => {
    const ruleWithDelivery: PricingRule = {
      ...sampleRule,
      delivery_fee: 5000, // $50
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18)

    const result = calculatePricing(ruleWithDelivery, dropoff, pickup)

    expect(result.snapshot.delivery_fee).toBe(5000)
    expect(result.snapshot.subtotal).toBe(44900) // $399 + $50
    expect(result.snapshot.taxable_amount).toBe(39900) // Only rental
    expect(result.snapshot.total).toBe(expectedTotal(44900, 39900))

    // Delivery line should be non-taxable
    const deliveryLine = result.lineItems.find(item => item.type === 'delivery')
    expect(deliveryLine).toBeDefined()
    expect(deliveryLine!.taxable).toBe(false)
  })

  it('should include haul/disposal fee when present (non-taxable)', () => {
    const ruleWithHaul: PricingRule = {
      ...sampleRule,
      haul_fee: 7500, // $75
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 18)

    const result = calculatePricing(ruleWithHaul, dropoff, pickup)

    expect(result.snapshot.haul_fee).toBe(7500)
    expect(result.snapshot.taxable_amount).toBe(39900) // Only rental

    // Haul line should show "Disposal Fee" label
    const haulLine = result.lineItems.find(item => item.type === 'haul')
    expect(haulLine).toBeDefined()
    expect(haulLine!.label).toBe('Disposal Fee')
    expect(haulLine!.taxable).toBe(false)
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

  it('should use correct PA-compliant labels', () => {
    const ruleWithAll: PricingRule = {
      ...sampleRule,
      delivery_fee: 5000,
      haul_fee: 7500,
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 20) // 5 days (2 extra)

    const result = calculatePricing(ruleWithAll, dropoff, pickup)

    // Check all labels match PA-compliant format
    expect(result.lineItems[0].label).toContain('Dumpster Rental')
    expect(result.lineItems[0].label).toContain('days included')
    expect(result.lineItems[1].label).toBe('Delivery Fee')
    expect(result.lineItems[2].label).toBe('Disposal Fee')
    expect(result.lineItems[3].label).toContain('Extended Service Days') // NOT "Extra Rental Days"
    expect(result.lineItems[4].label).toContain('PA Sales Tax')
    expect(result.lineItems[5].label).toBe('Card Processing Fee')
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
    extended_service_fee: 0,
    subtotal: 39900,
    taxable_amount: 39900,
    tax_rate: PA_TAX_RATE,
    tax_amount: Math.round(39900 * PA_TAX_RATE),
    processing_fee: 0,
    total: 39900,
    dumpster_size: 15,
    waste_type: 'household_trash',
    notes: null,
    tax_exempt: false,
  }

  it('should return 0 when actual tons is within included', () => {
    const result = calculateOverage(snapshot, 0.5)
    expect(result.overageAmount).toBe(0)
    expect(result.processingFee).toBe(0)
    expect(result.total).toBe(0)
  })

  it('should calculate overage for 0.5 tons over with processing fee', () => {
    // 1.5 tons - 1.0 included = 0.5 tons overage
    // 0.5 * $100 = $50
    const result = calculateOverage(snapshot, 1.5)

    expect(result.overageTons).toBe(0.5)
    expect(result.overageAmount).toBe(5000) // $50
    expect(result.processingFee).toBe(Math.round(5000 * STRIPE_PERCENTAGE) + STRIPE_FIXED_FEE)
    expect(result.total).toBe(result.overageAmount + result.processingFee)
  })

  it('should skip processing fee when requested', () => {
    const result = calculateOverage(snapshot, 1.5, false)

    expect(result.overageAmount).toBe(5000)
    expect(result.processingFee).toBe(0)
    expect(result.total).toBe(5000)
  })

  it('should calculate overage for 2 tons over', () => {
    // 3.0 tons - 1.0 included = 2.0 tons overage
    // 2.0 * $100 = $200
    const result = calculateOverage(snapshot, 3.0, false)
    expect(result.overageAmount).toBe(20000)
  })

  it('should handle fractional tons', () => {
    // 1.25 tons - 1.0 included = 0.25 tons overage
    // 0.25 * $100 = $25
    const result = calculateOverage(snapshot, 1.25, false)
    expect(result.overageAmount).toBe(2500)
  })

  it('should handle larger included tons (20 yard)', () => {
    const snapshot20 = { ...snapshot, included_tons: 2.00 }

    expect(calculateOverage(snapshot20, 1.5, false).overageAmount).toBe(0)
    expect(calculateOverage(snapshot20, 2.0, false).overageAmount).toBe(0)
    expect(calculateOverage(snapshot20, 2.5, false).overageAmount).toBe(5000) // 0.5 tons over
  })
})

describe('calculateProcessingFee', () => {
  it('should calculate correct fee for $100', () => {
    const fee = calculateProcessingFee(10000) // $100 in cents
    // 2.9% of $100 = $2.90 + $0.30 = $3.20
    expect(fee).toBe(Math.round(10000 * STRIPE_PERCENTAGE) + STRIPE_FIXED_FEE)
  })

  it('should return 0 for zero amount', () => {
    expect(calculateProcessingFee(0)).toBe(0)
  })

  it('should return 0 for negative amount', () => {
    expect(calculateProcessingFee(-1000)).toBe(0)
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

describe('pricing scenarios with tax', () => {
  it('should calculate 10 yard dumpster with tax correctly', () => {
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

    expect(result.snapshot.subtotal).toBe(35000)
    expect(result.snapshot.tax_amount).toBe(Math.round(35000 * PA_TAX_RATE)) // 7% of $350
    expect(result.snapshot.total).toBe(expectedTotal(35000, 35000))
  })

  it('should calculate 20 yard dumpster with extra days correctly', () => {
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

    const extendedServiceFee = 4 * 2500 // $100
    expect(result.snapshot.subtotal).toBe(50000 + extendedServiceFee) // $600
    expect(result.snapshot.taxable_amount).toBe(50000) // Only rental
    expect(result.snapshot.tax_amount).toBe(Math.round(50000 * PA_TAX_RATE)) // 7% of $500, not $600
    expect(result.snapshot.included_tons).toBe(2.00)
  })

  it('should calculate full invoice example from spec', () => {
    // From claude.md example:
    // 20-yd Dumpster Rental (3 days included)    $399.00    ✅
    // Extended Service Days (2 days @ $25)       $50.00
    // Subtotal                                   $449.00
    // PA Sales Tax (7% on $399.00)               $27.93
    // Card Processing Fee                        $14.13 (approx)
    // Total                                      $491.06 (approx)

    const rule: PricingRule = {
      base_price: 39900,
      delivery_fee: 0,
      haul_fee: 0,
      included_days: 3,
      extra_day_fee: 2500,
      included_tons: 1.00,
      overage_per_ton: 10000,
      dumpster_size: 20,
      waste_type: 'household_trash',
    }

    const dropoff = new Date(2025, 0, 15)
    const pickup = new Date(2025, 0, 20) // 5 days (2 extra)

    const result = calculatePricing(rule, dropoff, pickup)

    expect(result.snapshot.subtotal).toBe(44900) // $449
    expect(result.snapshot.tax_amount).toBe(2793) // 7% of $399
    expect(result.snapshot.processing_fee).toBeGreaterThan(0)

    // Processing fee should be ~2.9% of ($449 + $27.93) + $0.30
    const expectedProcessing = Math.round((44900 + 2793) * STRIPE_PERCENTAGE) + STRIPE_FIXED_FEE
    expect(result.snapshot.processing_fee).toBe(expectedProcessing)
  })
})
