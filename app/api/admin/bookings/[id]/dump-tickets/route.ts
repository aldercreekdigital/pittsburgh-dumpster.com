import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: bookingId } = await context.params
    const { facility, ticket_number, net_tons, ticket_datetime } = await request.json()

    if (!facility || !ticket_number || net_tons === undefined || !ticket_datetime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Verify booking exists
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('id, status')
      .eq('id', bookingId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Create dump ticket
    const { data, error } = await adminClient
      .from('dump_tickets')
      .insert({
        booking_id: bookingId,
        facility,
        ticket_number,
        net_tons,
        ticket_datetime,
      } as never)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating dump ticket:', error)
      return NextResponse.json(
        { error: 'Failed to create dump ticket' },
        { status: 500 }
      )
    }

    const ticket = data as { id: string } | null
    return NextResponse.json({ success: true, id: ticket?.id })
  } catch (error) {
    console.error('Error in create dump ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: bookingId } = await context.params
    const adminClient = createAdminClient()

    const { data: tickets, error } = await adminClient
      .from('dump_tickets')
      .select('id, facility, ticket_number, net_tons, ticket_datetime, created_at')
      .eq('booking_id', bookingId)
      .order('ticket_datetime', { ascending: false })

    if (error) {
      console.error('Error fetching dump tickets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dump tickets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error in get dump tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
