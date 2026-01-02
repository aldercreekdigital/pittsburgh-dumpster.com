import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { calculatePricing, parseDate, type PricingRule } from '@/lib/pricing/engine'
import type { StashedBookingData } from '@/lib/booking/stash'

interface PricingRuleRow {
  id: string
  waste_type: string
  dumpster_size: number
  base_price: number
  delivery_fee: number
  haul_fee: number
  included_days: number
  extra_day_fee: number
  included_tons: number
  overage_per_ton: number
  public_notes: string | null
}

/**
 * Complete a booking by creating all necessary records:
 * - Customer (if not exists)
 * - Address
 * - Quote with pricing snapshot
 * - Cart item
 *
 * Requires authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const body: StashedBookingData = await request.json()

    // Validate required fields
    if (!body.address || !body.quote) {
      return NextResponse.json(
        { ok: false, error: 'Missing address or quote data' },
        { status: 400 }
      )
    }

    const { address, quote } = body

    if (!address.fullAddress || typeof address.lat !== 'number' || typeof address.lng !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'Invalid address data' },
        { status: 400 }
      )
    }

    if (!quote.wasteType || !quote.dumpsterSize || !quote.dropoffDate || !quote.pickupDate) {
      return NextResponse.json(
        { ok: false, error: 'Invalid quote configuration' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    // Get the current user from the session
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: userError } = await authClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // 1. Get or create customer
    const { data: existingCustomer } = await adminClient
      .from('customers')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .single()

    let customerId: string

    if (existingCustomer) {
      customerId = (existingCustomer as { id: string }).id
    } else {
      const { data: newCustomer, error: customerError } = await adminClient
        .from('customers')
        .insert({
          business_id: DEFAULT_BUSINESS_ID,
          user_id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email || '',
          phone: user.user_metadata?.phone || '',
        } as never)
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError)
        return NextResponse.json(
          { ok: false, error: 'Failed to create customer record' },
          { status: 500 }
        )
      }

      customerId = (newCustomer as { id: string }).id
    }

    // 2. Create address record
    const { data: addressData, error: addressError } = await adminClient
      .from('addresses')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: customerId,
        full_address: address.fullAddress,
        street: address.street || null,
        city: address.city || null,
        state: address.state || null,
        zip: address.zip || null,
        lat: address.lat,
        lng: address.lng,
        place_id: address.placeId || null,
      } as never)
      .select('id')
      .single()

    const addressRecord = addressData as { id: string } | null

    if (addressError || !addressRecord) {
      console.error('Error creating address:', addressError)
      return NextResponse.json(
        { ok: false, error: 'Failed to save address' },
        { status: 500 }
      )
    }

    // 3. Get pricing rule
    const { data: ruleData, error: ruleError } = await adminClient
      .from('pricing_rules')
      .select('*')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('waste_type', quote.wasteType)
      .eq('dumpster_size', quote.dumpsterSize)
      .eq('active', true)
      .single()

    const rule = ruleData as PricingRuleRow | null

    if (ruleError || !rule) {
      console.error('Error fetching pricing rule:', ruleError)
      return NextResponse.json(
        { ok: false, error: 'Pricing not available for this configuration' },
        { status: 400 }
      )
    }

    // 4. Calculate pricing
    const pricingRule: PricingRule = {
      base_price: rule.base_price,
      delivery_fee: rule.delivery_fee,
      haul_fee: rule.haul_fee,
      included_days: rule.included_days,
      extra_day_fee: rule.extra_day_fee,
      included_tons: rule.included_tons,
      overage_per_ton: rule.overage_per_ton,
      dumpster_size: rule.dumpster_size,
      waste_type: rule.waste_type,
      public_notes: rule.public_notes,
    }

    const pricingResult = calculatePricing(
      pricingRule,
      parseDate(quote.dropoffDate),
      parseDate(quote.pickupDate)
    )

    // 5. Create quote with pricing snapshot
    const { data: quoteData, error: quoteError } = await adminClient
      .from('quotes')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        address_id: addressRecord.id,
        customer_id: customerId,
        waste_type: quote.wasteType,
        dumpster_size: quote.dumpsterSize,
        dropoff_date: quote.dropoffDate,
        pickup_date: quote.pickupDate,
        status: 'draft',
        pricing_snapshot: pricingResult.snapshot,
      } as never)
      .select('id')
      .single()

    const quoteRecord = quoteData as { id: string } | null

    if (quoteError || !quoteRecord) {
      console.error('Error creating quote:', quoteError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create quote' },
        { status: 500 }
      )
    }

    // 6. Create quote line items
    for (const item of pricingResult.lineItems) {
      await adminClient
        .from('quote_line_items')
        .insert({
          quote_id: quoteRecord.id,
          label: item.label,
          amount: item.amount,
          sort_order: item.sort_order,
        } as never)
    }

    // 7. Get or create active cart (handle race conditions)
    const { data: existingCarts } = await adminClient
      .from('carts')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)

    let cartId: string

    if (existingCarts && existingCarts.length > 0) {
      cartId = (existingCarts[0] as { id: string }).id
    } else {
      const { data: newCart, error: cartError } = await adminClient
        .from('carts')
        .insert({
          business_id: DEFAULT_BUSINESS_ID,
          user_id: user.id,
          status: 'active',
        } as never)
        .select('id')
        .single()

      if (cartError || !newCart) {
        console.error('Error creating cart:', cartError)
        return NextResponse.json(
          { ok: false, error: 'Failed to create cart' },
          { status: 500 }
        )
      }

      cartId = (newCart as { id: string }).id
    }

    // 8. Add quote to cart
    const { error: cartItemError } = await adminClient
      .from('cart_items')
      .insert({
        cart_id: cartId,
        quote_id: quoteRecord.id,
      } as never)

    if (cartItemError) {
      console.error('Error adding to cart:', cartItemError)
      return NextResponse.json(
        { ok: false, error: 'Failed to add to cart' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      quoteId: quoteRecord.id,
      cartId,
    })

  } catch (error) {
    console.error('Complete booking error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
