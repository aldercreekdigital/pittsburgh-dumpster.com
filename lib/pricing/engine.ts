/**
 * Pricing Engine for Dumpster Rentals
 *
 * This is a pure function that calculates pricing based on:
 * - Pricing rule (base price, fees, included days/tons)
 * - Rental dates (dropoff and pickup)
 *
 * All money values are in cents (integers). Never use floats for money.
 *
 * Tax Rules (PA-Compliant - Waste Management Model):
 * - TAXABLE: Container rental only (base_price)
 * - NON-TAXABLE: Delivery, Haul/Disposal, Extended Service Days, Overages
 * - Language: Use "Extended Service Days" not "Extra Rental Days"
 */

// Tax rate for PA (7% = state 6% + Allegheny County 1%)
export const PA_TAX_RATE = 0.07

// Stripe fee structure
export const STRIPE_PERCENTAGE = 0.029  // 2.9%
export const STRIPE_FIXED_FEE = 30      // $0.30 in cents

export interface PricingRule {
  base_price: number      // cents
  delivery_fee: number    // cents
  haul_fee: number        // cents
  included_days: number
  extra_day_fee: number   // cents per day
  included_tons: number
  overage_per_ton: number // cents per ton
  dumpster_size: number
  waste_type: string
  public_notes?: string | null
}

export interface PricingOptions {
  taxExempt?: boolean     // If true, skip tax calculation
  includeProcessingFee?: boolean  // If true, add Stripe processing fee (default: true)
}

export interface PricingSnapshot {
  base_price: number
  delivery_fee: number
  haul_fee: number
  included_days: number
  extra_day_fee: number
  included_tons: number
  overage_per_ton: number
  rental_days: number
  extra_days: number
  extended_service_fee: number  // renamed from extra days cost for clarity
  subtotal: number              // base + delivery + haul + extended_service
  taxable_amount: number        // base_price only (rental is taxable)
  tax_rate: number              // 0.07 for PA
  tax_amount: number            // taxable_amount * tax_rate
  processing_fee: number        // Stripe pass-through
  total: number                 // subtotal + tax + processing_fee
  dumpster_size: number
  waste_type: string
  notes: string | null
  tax_exempt: boolean           // whether tax was skipped
}

export type LineItemType =
  | 'rental'            // TAXABLE - dumpster rental
  | 'delivery'          // non-taxable
  | 'haul'              // non-taxable (disposal fee)
  | 'extended_service'  // non-taxable (extended service days)
  | 'tax'               // the tax line
  | 'processing_fee'    // card processing fee
  | 'discount'          // discount
  | 'adjustment'        // other adjustments
  | 'overage'           // tonnage overage (charged separately)
  // Legacy types for backward compatibility
  | 'base'              // maps to 'rental'
  | 'extra_days'        // maps to 'extended_service'

export interface LineItem {
  label: string
  amount: number  // cents (can be negative for discounts)
  type: LineItemType
  sort_order: number
  taxable?: boolean  // helper for display
}

export interface PricingResult {
  snapshot: PricingSnapshot
  lineItems: LineItem[]
}

/**
 * Calculate the number of rental days between two dates.
 * Uses full calendar day counting: pickup_date - dropoff_date.
 *
 * Examples:
 * - dropoff: Jan 1, pickup: Jan 1 = 0 days (same day pickup)
 * - dropoff: Jan 1, pickup: Jan 2 = 1 day
 * - dropoff: Jan 1, pickup: Jan 4 = 3 days
 */
export function calculateRentalDays(dropoffDate: Date, pickupDate: Date): number {
  // Normalize to start of day (UTC) to avoid timezone issues
  const dropoff = new Date(Date.UTC(
    dropoffDate.getFullYear(),
    dropoffDate.getMonth(),
    dropoffDate.getDate()
  ))
  const pickup = new Date(Date.UTC(
    pickupDate.getFullYear(),
    pickupDate.getMonth(),
    pickupDate.getDate()
  ))

  const diffMs = pickup.getTime() - dropoff.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Cannot have negative rental days
  return Math.max(0, diffDays)
}

/**
 * Calculate pricing for a dumpster rental.
 *
 * @param rule - The pricing rule to apply
 * @param dropoffDate - Date the dumpster will be dropped off
 * @param pickupDate - Date the dumpster will be picked up
 * @param options - Optional settings (tax exempt, include processing fee)
 * @returns Pricing snapshot and line items
 */
export function calculatePricing(
  rule: PricingRule,
  dropoffDate: Date,
  pickupDate: Date,
  options: PricingOptions = {}
): PricingResult {
  const { taxExempt = false, includeProcessingFee = true } = options

  // Validate dates
  if (pickupDate < dropoffDate) {
    throw new Error('Pickup date must be on or after dropoff date')
  }

  const rentalDays = calculateRentalDays(dropoffDate, pickupDate)
  const extraDays = Math.max(0, rentalDays - rule.included_days)
  const extendedServiceFee = extraDays * rule.extra_day_fee

  // Calculate subtotal (before tax and processing fee)
  const subtotal = rule.base_price + rule.delivery_fee + rule.haul_fee + extendedServiceFee

  // Tax calculation: Only rental (base_price) is taxable in PA
  const taxableAmount = rule.base_price
  const taxRate = taxExempt ? 0 : PA_TAX_RATE
  const taxAmount = taxExempt ? 0 : Math.round(taxableAmount * PA_TAX_RATE)

  // Processing fee: calculated on (subtotal + tax)
  const preProcessingTotal = subtotal + taxAmount
  const processingFee = includeProcessingFee
    ? Math.round(preProcessingTotal * STRIPE_PERCENTAGE) + STRIPE_FIXED_FEE
    : 0

  // Final total
  const total = subtotal + taxAmount + processingFee

  // Build snapshot (immutable record of pricing at this point in time)
  const snapshot: PricingSnapshot = {
    base_price: rule.base_price,
    delivery_fee: rule.delivery_fee,
    haul_fee: rule.haul_fee,
    included_days: rule.included_days,
    extra_day_fee: rule.extra_day_fee,
    included_tons: rule.included_tons,
    overage_per_ton: rule.overage_per_ton,
    rental_days: rentalDays,
    extra_days: extraDays,
    extended_service_fee: extendedServiceFee,
    subtotal,
    taxable_amount: taxableAmount,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    processing_fee: processingFee,
    total,
    dumpster_size: rule.dumpster_size,
    waste_type: rule.waste_type,
    notes: rule.public_notes ?? null,
    tax_exempt: taxExempt,
  }

  // Build line items for display
  const lineItems: LineItem[] = []
  let sortOrder = 0

  // Rental (base price) - TAXABLE
  lineItems.push({
    label: `${rule.dumpster_size} Yard Dumpster Rental (${rule.included_days} days included)`,
    amount: rule.base_price,
    type: 'rental',
    sort_order: sortOrder++,
    taxable: true,
  })

  // Delivery fee (if any) - non-taxable
  if (rule.delivery_fee > 0) {
    lineItems.push({
      label: 'Delivery Fee',
      amount: rule.delivery_fee,
      type: 'delivery',
      sort_order: sortOrder++,
      taxable: false,
    })
  }

  // Haul/Disposal fee (if any) - non-taxable
  if (rule.haul_fee > 0) {
    lineItems.push({
      label: 'Disposal Fee',
      amount: rule.haul_fee,
      type: 'haul',
      sort_order: sortOrder++,
      taxable: false,
    })
  }

  // Extended Service Days (if any) - non-taxable
  // Important: Use "Extended Service Days" not "Extra Rental Days" for PA tax compliance
  if (extraDays > 0) {
    lineItems.push({
      label: `Extended Service Days (${extraDays} day${extraDays > 1 ? 's' : ''} @ $${(rule.extra_day_fee / 100).toFixed(2)})`,
      amount: extendedServiceFee,
      type: 'extended_service',
      sort_order: sortOrder++,
      taxable: false,
    })
  }

  // Tax line item (if not exempt)
  if (!taxExempt && taxAmount > 0) {
    lineItems.push({
      label: `PA Sales Tax (7% on $${(taxableAmount / 100).toFixed(2)})`,
      amount: taxAmount,
      type: 'tax',
      sort_order: sortOrder++,
    })
  }

  // Processing fee (if included)
  if (includeProcessingFee && processingFee > 0) {
    lineItems.push({
      label: 'Card Processing Fee',
      amount: processingFee,
      type: 'processing_fee',
      sort_order: sortOrder++,
      taxable: false,
    })
  }

  return { snapshot, lineItems }
}

/**
 * Calculate overage charges based on actual tonnage.
 * Overages are non-taxable (service fee charged separately after pickup).
 *
 * @param snapshot - The pricing snapshot from the original quote
 * @param actualTons - The actual weight in tons from the dump ticket
 * @param includeProcessingFee - Whether to include Stripe processing fee (default: true)
 * @returns Object with overage amount, processing fee, and total
 */
export function calculateOverage(
  snapshot: PricingSnapshot,
  actualTons: number,
  includeProcessingFee: boolean = true
): { overageAmount: number; processingFee: number; total: number; overageTons: number } {
  const overageTons = Math.max(0, actualTons - snapshot.included_tons)
  // Round to nearest 0.01 ton, then calculate
  const overageAmount = Math.round(overageTons * snapshot.overage_per_ton)

  // Processing fee on overage (no tax since overages are non-taxable)
  const processingFee = includeProcessingFee && overageAmount > 0
    ? Math.round(overageAmount * STRIPE_PERCENTAGE) + STRIPE_FIXED_FEE
    : 0

  const total = overageAmount + processingFee

  return { overageAmount, processingFee, total, overageTons }
}

/**
 * Calculate processing fee for any amount
 * @param amount - Amount in cents
 * @returns Processing fee in cents
 */
export function calculateProcessingFee(amount: number): number {
  if (amount <= 0) return 0
  return Math.round(amount * STRIPE_PERCENTAGE) + STRIPE_FIXED_FEE
}

/**
 * Format cents as a dollar string for display
 */
export function formatCents(cents: number): string {
  const dollars = cents / 100
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

/**
 * Parse a date string (YYYY-MM-DD) to a Date object
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}
