import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface BookingData {
  id: string
  status: string
}

interface BookingWithDumpster {
  dumpster_id: string | null
}

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  confirmed: ['scheduled', 'cancelled'],
  scheduled: ['dropped', 'cancelled'],
  dropped: ['picked_up'],
  picked_up: ['completed'],
  completed: [],
  cancelled: [],
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { status: newStatus } = await request.json()

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Get current booking
    const { data, error: fetchError } = await adminClient
      .from('bookings')
      .select('id, status')
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

    // Validate transition
    const allowedTransitions = VALID_TRANSITIONS[booking.status] || []
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${booking.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Build update payload
    const updateData: Record<string, unknown> = {
      status: newStatus,
    }

    // Set timestamps based on status
    if (newStatus === 'dropped') {
      updateData.dropped_at = new Date().toISOString()
    } else if (newStatus === 'picked_up') {
      updateData.picked_up_at = new Date().toISOString()
    }

    // Update booking
    const { error: updateError } = await adminClient
      .from('bookings')
      .update(updateData as never)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating booking status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      )
    }

    // If cancelled or completed, free up the dumpster if one was assigned
    if (newStatus === 'cancelled' || newStatus === 'completed') {
      const { data: dumpsterData } = await adminClient
        .from('bookings')
        .select('dumpster_id')
        .eq('id', id)
        .single()

      const bookingWithDumpster = dumpsterData as BookingWithDumpster | null
      if (bookingWithDumpster?.dumpster_id) {
        await adminClient
          .from('dumpsters')
          .update({ status: 'available' } as never)
          .eq('id', bookingWithDumpster.dumpster_id)
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error('Error in booking status update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
