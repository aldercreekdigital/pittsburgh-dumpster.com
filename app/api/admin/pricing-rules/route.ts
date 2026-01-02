import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface PricingRule {
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
  active: boolean
}

export async function GET() {
  try {
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('pricing_rules')
      .select('id, waste_type, dumpster_size, base_price, delivery_fee, haul_fee, included_days, extra_day_fee, included_tons, overage_per_ton, active')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .order('waste_type')
      .order('dumpster_size')

    if (error) {
      throw error
    }

    return NextResponse.json(data as PricingRule[])
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing rules' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    // Only allow updating specific fields
    const allowedFields = [
      'base_price',
      'delivery_fee',
      'haul_fee',
      'included_days',
      'extra_day_fee',
      'included_tons',
      'overage_per_ton',
      'active',
    ]

    const filteredUpdates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field]
      }
    }

    const { data, error } = await (adminClient
      .from('pricing_rules') as ReturnType<typeof adminClient.from>)
      .update(filteredUpdates)
      .eq('id', id)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .select('id, waste_type, dumpster_size, base_price, delivery_fee, haul_fee, included_days, extra_day_fee, included_tons, overage_per_ton, active')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data as PricingRule)
  } catch (error) {
    console.error('Error updating pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing rule' },
      { status: 500 }
    )
  }
}
