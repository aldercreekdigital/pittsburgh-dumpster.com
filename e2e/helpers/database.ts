import { createClient } from '@supabase/supabase-js'

/**
 * Database helpers for E2E tests
 * Uses service role key for direct database access
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.warn('Warning: No Supabase service key found. Set SUPABASE_SECRET_KEY env var.')
}

export const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const DEFAULT_BUSINESS_ID = '00000000-0000-0000-0000-000000000001'

// Test data constants
export const TEST_ADMIN = {
  email: 'gmurin@icloud.com',
  password: 'gmurin08',
  userId: 'd906a864-e7c2-4b1f-a0b8-3edcb55cd5a4',
}

export const TEST_ADDRESS = {
  full_address: '123 Main St, Pittsburgh, PA 15213, USA',
  street: '123 Main St',
  city: 'Pittsburgh',
  state: 'PA',
  zip: '15213',
  lat: 40.4406,
  lng: -79.9959,
}

/**
 * Clean up test data created during tests
 */
export async function cleanupTestData() {
  // Delete test customers (except seeded admin)
  await adminClient
    .from('customers')
    .delete()
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .neq('email', TEST_ADMIN.email)

  // Delete test booking requests
  await adminClient
    .from('booking_requests')
    .delete()
    .eq('business_id', DEFAULT_BUSINESS_ID)

  // Delete test bookings
  await adminClient
    .from('bookings')
    .delete()
    .eq('business_id', DEFAULT_BUSINESS_ID)

  // Delete test invoices
  await adminClient
    .from('invoices')
    .delete()
    .eq('business_id', DEFAULT_BUSINESS_ID)

  // Delete test quotes
  await adminClient
    .from('quotes')
    .delete()
    .eq('business_id', DEFAULT_BUSINESS_ID)

  // Delete test addresses
  await adminClient
    .from('addresses')
    .delete()
    .eq('business_id', DEFAULT_BUSINESS_ID)

  // Delete test carts
  await adminClient
    .from('carts')
    .delete()
    .eq('business_id', DEFAULT_BUSINESS_ID)
}

/**
 * Create a test customer
 */
export async function createTestCustomer(overrides: Partial<{
  email: string
  name: string
  phone: string
  user_id: string | null
}> = {}) {
  const { data, error } = await adminClient
    .from('customers')
    .insert({
      business_id: DEFAULT_BUSINESS_ID,
      email: overrides.email || `test-${Date.now()}@example.com`,
      name: overrides.name || 'Test Customer',
      phone: overrides.phone || '412-555-1234',
      user_id: overrides.user_id || null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Create a test address
 */
export async function createTestAddress(customerId?: string) {
  const { data, error } = await adminClient
    .from('addresses')
    .insert({
      business_id: DEFAULT_BUSINESS_ID,
      customer_id: customerId || null,
      ...TEST_ADDRESS,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Create a test quote with pricing snapshot
 */
export async function createTestQuote(addressId: string) {
  const { data, error } = await adminClient
    .from('quotes')
    .insert({
      business_id: DEFAULT_BUSINESS_ID,
      address_id: addressId,
      waste_type: 'household_trash',
      dumpster_size: 10,
      dropoff_date: getDateString(1), // tomorrow
      pickup_date: getDateString(4), // 4 days from now
      status: 'draft',
      pricing_snapshot: {
        base_price: 35000,
        delivery_fee: 0,
        haul_fee: 0,
        included_days: 3,
        extra_day_fee: 2500,
        included_tons: 1,
        overage_per_ton: 10000,
        rental_days: 3,
        extra_days: 0,
        subtotal: 35000,
        total: 35000,
      },
    })
    .select('*')
    .single()

  if (error) throw error

  // Add line items
  await adminClient.from('quote_line_items').insert([
    { quote_id: data.id, label: '10 Yard Dumpster - 3 Day Rental', amount: 35000, sort_order: 0 },
  ])

  return data
}

/**
 * Create a test booking request
 */
export async function createTestBookingRequest(customerId: string, quoteId: string) {
  const { data, error } = await adminClient
    .from('booking_requests')
    .insert({
      business_id: DEFAULT_BUSINESS_ID,
      customer_id: customerId,
      quote_id: quoteId,
      status: 'pending',
      customer_inputs: { notes: 'Test booking request' },
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function getDateString(daysFromNow: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

/**
 * Get pricing rules
 */
export async function getPricingRules() {
  const { data, error } = await adminClient
    .from('pricing_rules')
    .select('*')
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .eq('active', true)

  if (error) throw error
  return data
}
