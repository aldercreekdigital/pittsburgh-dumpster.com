import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { calculatePricing, parseDate, type PricingRule } from '@/lib/pricing/engine'
import type { Quote, PricingRule as DbPricingRule } from '@/lib/supabase/types'

interface ConfigureQuoteRequest {
  quoteId: string
  wasteType: 'construction_debris' | 'household_trash'
  dumpsterSize: number
  dropoffDate: string // YYYY-MM-DD
  pickupDate: string  // YYYY-MM-DD
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfigureQuoteRequest = await request.json()

    // Validate required fields
    if (!body.quoteId || !body.wasteType || !body.dumpsterSize || !body.dropoffDate || !body.pickupDate) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const dropoffDate = parseDate(body.dropoffDate)
    const pickupDate = parseDate(body.pickupDate)

    if (pickupDate < dropoffDate) {
      return NextResponse.json(
        { ok: false, error: 'Pickup date must be on or after dropoff date' },
        { status: 400 }
      )
    }

    // Validate dropoff is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dropoffDate < today) {
      return NextResponse.json(
        { ok: false, error: 'Dropoff date cannot be in the past' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify quote exists and is in draft status
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select('id, status, business_id')
      .eq('id', body.quoteId)
      .single()

    const quote = quoteData as Pick<Quote, 'id' | 'status' | 'business_id'> | null

    if (quoteError || !quote) {
      return NextResponse.json(
        { ok: false, error: 'Quote not found' },
        { status: 404 }
      )
    }

    if (quote.status !== 'draft') {
      return NextResponse.json(
        { ok: false, error: 'Quote is no longer editable' },
        { status: 400 }
      )
    }

    // Fetch pricing rule for the selected options
    const { data: pricingRuleData, error: ruleError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('waste_type', body.wasteType)
      .eq('dumpster_size', body.dumpsterSize)
      .eq('active', true)
      .single()

    const pricingRule = pricingRuleData as DbPricingRule | null

    if (ruleError || !pricingRule) {
      return NextResponse.json(
        { ok: false, error: 'Pricing not available for this configuration' },
        { status: 400 }
      )
    }

    // Calculate pricing
    const rule: PricingRule = {
      base_price: pricingRule.base_price,
      delivery_fee: pricingRule.delivery_fee,
      haul_fee: pricingRule.haul_fee,
      included_days: pricingRule.included_days,
      extra_day_fee: pricingRule.extra_day_fee,
      included_tons: Number(pricingRule.included_tons),
      overage_per_ton: pricingRule.overage_per_ton,
      dumpster_size: pricingRule.dumpster_size,
      waste_type: pricingRule.waste_type,
      public_notes: pricingRule.public_notes,
    }

    const { snapshot, lineItems } = calculatePricing(rule, dropoffDate, pickupDate)

    // Update quote with configuration and pricing snapshot
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        waste_type: body.wasteType,
        dumpster_size: body.dumpsterSize,
        dropoff_date: body.dropoffDate,
        pickup_date: body.pickupDate,
        pricing_snapshot: snapshot as unknown as Record<string, unknown>,
      } as never)
      .eq('id', body.quoteId)

    if (updateError) {
      console.error('Error updating quote:', updateError)
      return NextResponse.json(
        { ok: false, error: 'Failed to update quote' },
        { status: 500 }
      )
    }

    // Delete existing line items and insert new ones
    await supabase
      .from('quote_line_items')
      .delete()
      .eq('quote_id', body.quoteId)

    if (lineItems.length > 0) {
      const { error: lineItemsError } = await supabase
        .from('quote_line_items')
        .insert(
          lineItems.map(item => ({
            quote_id: body.quoteId,
            label: item.label,
            amount: item.amount,
            line_type: item.type,
            sort_order: item.sort_order,
          })) as never
        )

      if (lineItemsError) {
        console.error('Error inserting line items:', lineItemsError)
        // Non-fatal, quote is still updated
      }
    }

    return NextResponse.json({
      ok: true,
      quoteId: body.quoteId,
      pricing: {
        total: snapshot.total,
        subtotal: snapshot.subtotal,
        taxableAmount: snapshot.taxable_amount,
        taxAmount: snapshot.tax_amount,
        taxRate: snapshot.tax_rate,
        processingFee: snapshot.processing_fee,
        rentalDays: snapshot.rental_days,
        extraDays: snapshot.extra_days,
        extendedServiceFee: snapshot.extended_service_fee,
        includedDays: snapshot.included_days,
        includedTons: snapshot.included_tons,
        lineItems: lineItems.map(item => ({
          label: item.label,
          amount: item.amount,
          type: item.type,
          taxable: item.taxable,
        })),
      },
    })

  } catch (error) {
    console.error('Quote configure error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
