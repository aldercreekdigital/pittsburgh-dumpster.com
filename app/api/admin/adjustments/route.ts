import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, customerId, kind, amount, notes } = await request.json()

    if (!bookingId || !customerId || !kind || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['tonnage_overage', 'late_fee', 'other'].includes(kind)) {
      return NextResponse.json(
        { error: 'Invalid adjustment kind' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Verify booking exists and belongs to the customer
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('id, customer_id')
      .eq('id', bookingId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const bookingData = booking as { id: string; customer_id: string }
    if (bookingData.customer_id !== customerId) {
      return NextResponse.json(
        { error: 'Customer ID does not match booking' },
        { status: 400 }
      )
    }

    // Create adjustment
    const { data, error } = await adminClient
      .from('adjustments')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        booking_id: bookingId,
        customer_id: customerId,
        kind,
        amount,
        status: 'pending',
        notes: notes || null,
      } as never)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating adjustment:', error)
      return NextResponse.json(
        { error: 'Failed to create adjustment' },
        { status: 500 }
      )
    }

    const adjustment = data as { id: string } | null
    return NextResponse.json({ success: true, id: adjustment?.id })
  } catch (error) {
    console.error('Error in create adjustment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
