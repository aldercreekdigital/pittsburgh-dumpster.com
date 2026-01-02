import { NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import type { PricingRule } from '@/lib/supabase/types'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Fetch active pricing rules for the business
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('active', true)
      .order('dumpster_size', { ascending: true })

    const rules = data as PricingRule[] | null

    if (error) {
      console.error('Error fetching pricing rules:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch pricing rules' },
        { status: 500 }
      )
    }

    // Group by dumpster size for easier frontend consumption
    const sizeMap = new Map<number, {
      size: number
      wasteTypes: {
        type: string
        basePrice: number
        includedDays: number
        extraDayFee: number
        includedTons: number
        overagePerTon: number
        notes: string | null
      }[]
    }>()

    for (const rule of rules || []) {
      if (!sizeMap.has(rule.dumpster_size)) {
        sizeMap.set(rule.dumpster_size, {
          size: rule.dumpster_size,
          wasteTypes: [],
        })
      }

      sizeMap.get(rule.dumpster_size)!.wasteTypes.push({
        type: rule.waste_type,
        basePrice: rule.base_price,
        includedDays: rule.included_days,
        extraDayFee: rule.extra_day_fee,
        includedTons: Number(rule.included_tons),
        overagePerTon: rule.overage_per_ton,
        notes: rule.public_notes,
      })
    }

    const sizes = Array.from(sizeMap.values())

    return NextResponse.json({
      ok: true,
      sizes,
      rules: rules || [],
    })

  } catch (error) {
    console.error('Pricing rules error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
