import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { generateQuotePdf } from '@/lib/pdf/quote'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface PricingSnapshot {
  base_price: number
  delivery_fee: number
  haul_fee: number
  included_days: number
  extra_day_fee: number
  included_tons: number
  overage_per_ton: number
  rental_days: number
  extra_days: number
  extended_service_fee: number
  subtotal: number
  taxable_amount: number
  tax_rate: number
  tax_amount: number
  processing_fee: number
  total: number
  dumpster_size: number
  waste_type: string
  tax_exempt: boolean
}

interface QuoteData {
  id: string
  waste_type: string
  dumpster_size: number
  dropoff_date: string
  pickup_date: string
  expires_at: string | null
  pricing_snapshot: PricingSnapshot | null
  created_at: string
  address: { full_address: string } | null
  line_items: { label: string; amount: number; line_type: string }[]
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('quotes')
      .select(`
        id,
        waste_type,
        dumpster_size,
        dropoff_date,
        pickup_date,
        expires_at,
        pricing_snapshot,
        created_at,
        address:addresses(full_address),
        line_items:quote_line_items(label, amount, line_type)
      `)
      .eq('id', id)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    const quote = data as QuoteData
    const pricing = quote.pricing_snapshot

    if (!pricing) {
      return NextResponse.json(
        { error: 'Quote has no pricing data' },
        { status: 400 }
      )
    }

    const pdfBuffer = generateQuotePdf({
      quoteId: quote.id,
      createdAt: quote.created_at,
      expiresAt: quote.expires_at || undefined,
      address: quote.address?.full_address || 'N/A',
      dumpsterSize: quote.dumpster_size,
      wasteType: quote.waste_type,
      dropoffDate: quote.dropoff_date,
      pickupDate: quote.pickup_date,
      rentalDays: pricing.rental_days,
      includedTons: pricing.included_tons,
      lineItems: quote.line_items.map(item => ({
        label: item.label,
        amount: item.amount,
        type: item.line_type,
      })),
      subtotal: pricing.subtotal,
      taxAmount: pricing.tax_amount,
      processingFee: pricing.processing_fee,
      total: pricing.total,
      overagePerTon: pricing.overage_per_ton,
      taxExempt: pricing.tax_exempt,
    })

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
