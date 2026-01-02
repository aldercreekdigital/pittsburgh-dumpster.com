import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface BookingData {
  id: string
  status: string
  dumpster_id: string | null
  pricing_snapshot: { dumpster_size?: number } | null
}

interface DumpsterData {
  id: string
  status: string
  size: number
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { dumpsterId } = await request.json()

    if (!dumpsterId) {
      return NextResponse.json(
        { error: 'Dumpster ID is required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Get current booking
    const { data, error: fetchError } = await adminClient
      .from('bookings')
      .select('id, status, dumpster_id, pricing_snapshot')
      .eq('id', id)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (fetchError || !data) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const booking = data as BookingData

    // Can't assign if booking is completed or cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Cannot assign dumpster to a completed or cancelled booking' },
        { status: 400 }
      )
    }

    // Verify dumpster exists and is available
    const { data: dumpsterData, error: dumpsterError } = await adminClient
      .from('dumpsters')
      .select('id, status, size')
      .eq('id', dumpsterId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (dumpsterError || !dumpsterData) {
      return NextResponse.json(
        { error: 'Dumpster not found' },
        { status: 404 }
      )
    }

    const dumpster = dumpsterData as DumpsterData

    if (dumpster.status !== 'available') {
      return NextResponse.json(
        { error: 'Dumpster is not available' },
        { status: 400 }
      )
    }

    // Verify dumpster size matches booking
    if (booking.pricing_snapshot?.dumpster_size && dumpster.size !== booking.pricing_snapshot.dumpster_size) {
      return NextResponse.json(
        { error: `Dumpster size (${dumpster.size}) doesn't match booking (${booking.pricing_snapshot.dumpster_size})` },
        { status: 400 }
      )
    }

    // If there was a previous dumpster assigned, mark it as available
    if (booking.dumpster_id && booking.dumpster_id !== dumpsterId) {
      await adminClient
        .from('dumpsters')
        .update({ status: 'available' } as never)
        .eq('id', booking.dumpster_id)
    }

    // Update booking with new dumpster
    const { error: updateError } = await adminClient
      .from('bookings')
      .update({ dumpster_id: dumpsterId } as never)
      .eq('id', id)

    if (updateError) {
      console.error('Error assigning dumpster:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign dumpster' },
        { status: 500 }
      )
    }

    // Mark dumpster as reserved
    await adminClient
      .from('dumpsters')
      .update({ status: 'reserved' } as never)
      .eq('id', dumpsterId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in assign dumpster:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
