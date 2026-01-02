/**
 * Pricing Engine for Dumpster Rentals
 *
 * This is a pure function that calculates pricing based on:
 * - Pricing rule (base price, fees, included days/tons)
 * - Rental dates (dropoff and pickup)
 *
 * All money values are in cents (integers). Never use floats for money.
 */

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
  subtotal: number
  total: number
  dumpster_size: number
  waste_type: string
  notes: string | null
}

export interface LineItem {
  label: string
  amount: number  // cents (can be negative for discounts)
  type: 'base' | 'delivery' | 'haul' | 'extra_days' | 'tax' | 'discount' | 'adjustment'
  sort_order: number
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
 * @returns Pricing snapshot and line items
 */
export function calculatePricing(
  rule: PricingRule,
  dropoffDate: Date,
  pickupDate: Date
): PricingResult {
  // Validate dates
  if (pickupDate < dropoffDate) {
    throw new Error('Pickup date must be on or after dropoff date')
  }

  const rentalDays = calculateRentalDays(dropoffDate, pickupDate)
  const extraDays = Math.max(0, rentalDays - rule.included_days)
  const extraDaysCost = extraDays * rule.extra_day_fee

  // Calculate totals
  const subtotal = rule.base_price + rule.delivery_fee + rule.haul_fee + extraDaysCost
  const total = subtotal // No tax for now

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
    subtotal,
    total,
    dumpster_size: rule.dumpster_size,
    waste_type: rule.waste_type,
    notes: rule.public_notes ?? null,
  }

  // Build line items for display
  const lineItems: LineItem[] = []
  let sortOrder = 0

  // Base price
  lineItems.push({
    label: `${rule.dumpster_size} Yard Dumpster Rental`,
    amount: rule.base_price,
    type: 'base',
    sort_order: sortOrder++,
  })

  // Delivery fee (if any)
  if (rule.delivery_fee > 0) {
    lineItems.push({
      label: 'Delivery Fee',
      amount: rule.delivery_fee,
      type: 'delivery',
      sort_order: sortOrder++,
    })
  }

  // Haul fee (if any)
  if (rule.haul_fee > 0) {
    lineItems.push({
      label: 'Haul Away Fee',
      amount: rule.haul_fee,
      type: 'haul',
      sort_order: sortOrder++,
    })
  }

  // Extra days (if any)
  if (extraDays > 0) {
    lineItems.push({
      label: `Extra Days (${extraDays} day${extraDays > 1 ? 's' : ''} × $${(rule.extra_day_fee / 100).toFixed(2)})`,
      amount: extraDaysCost,
      type: 'extra_days',
      sort_order: sortOrder++,
    })
  }

  return { snapshot, lineItems }
}

/**
 * Calculate overage charges based on actual tonnage.
 *
 * @param snapshot - The pricing snapshot from the original quote
 * @param actualTons - The actual weight in tons from the dump ticket
 * @returns The overage amount in cents (0 if within included tons)
 */
export function calculateOverage(
  snapshot: PricingSnapshot,
  actualTons: number
): number {
  const overageTons = Math.max(0, actualTons - snapshot.included_tons)
  // Round up to nearest 0.01 ton, then calculate
  const overageCents = Math.ceil(overageTons * snapshot.overage_per_ton)
  return overageCents
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
