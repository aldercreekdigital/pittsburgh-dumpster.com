import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { unit_number, size, type, notes } = await request.json()

    if (!unit_number || !size) {
      return NextResponse.json(
        { error: 'Unit number and size are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check for duplicate unit number
    const { data: existing } = await adminClient
      .from('dumpsters')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('unit_number', unit_number)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A dumpster with this unit number already exists' },
        { status: 400 }
      )
    }

    // Create dumpster
    const { data, error } = await adminClient
      .from('dumpsters')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        unit_number,
        size,
        type: type || null,
        notes: notes || null,
        status: 'available',
      } as never)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating dumpster:', error)
      return NextResponse.json(
        { error: 'Failed to create dumpster' },
        { status: 500 }
      )
    }

    const dumpster = data as { id: string } | null
    return NextResponse.json({ success: true, id: dumpster?.id })
  } catch (error) {
    console.error('Error in create dumpster:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
