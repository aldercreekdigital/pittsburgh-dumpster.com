import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { sendEmail, getBookingDeclinedHtml } from '@/lib/email/send'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface DeclineBody {
  reason?: string
}

interface BookingRequestData {
  id: string
  status: string
  quote: {
    id: string
    dumpster_size: number
    dropoff_date: string
    address: { full_address: string } | null
  } | null
  customer: { id: string; name: string; email: string } | null
}

/**
 * Decline a booking request.
 * Updates the status and sends an email to the customer.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: requestId } = await params
    const body: DeclineBody = await request.json()
    const adminClient = createAdminClient()

    // 1. Load the booking request with related data
    const { data: bookingRequest, error: requestError } = await adminClient
      .from('booking_requests')
      .select(`
        id,
        status,
        customer:customers(id, name, email),
        quote:quotes(
          id,
          dumpster_size,
          dropoff_date,
          address:addresses(full_address)
        )
      `)
      .eq('id', requestId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (requestError || !bookingRequest) {
      return NextResponse.json(
        { ok: false, error: 'Booking request not found' },
        { status: 404 }
      )
    }

    // Type assertion for the booking request
    const typedRequest = bookingRequest as BookingRequestData

    if (typedRequest.status !== 'pending') {
      return NextResponse.json(
        { ok: false, error: `Cannot decline a request with status: ${typedRequest.status}` },
        { status: 400 }
      )
    }

    const quote = typedRequest.quote
    const customer = typedRequest.customer

    // 2. Update booking request status
    const { error: updateError } = await adminClient
      .from('booking_requests')
      .update({ status: 'declined' } as never)
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating booking request:', updateError)
      return NextResponse.json(
        { ok: false, error: 'Failed to update request status' },
        { status: 500 }
      )
    }

    // 3. Update quote status to expired
    if (quote) {
      await adminClient
        .from('quotes')
        .update({ status: 'expired' } as never)
        .eq('id', quote.id)
    }

    // 4. Send email to customer
    if (customer && quote) {
      try {
        await sendEmail({
          to: customer.email,
          subject: 'Update on Your Dumpster Rental Request',
          html: getBookingDeclinedHtml({
            customerName: customer.name,
            reason: body.reason,
            dumpsterSize: quote.dumpster_size,
            dropoffDate: quote.dropoff_date,
            address: quote.address?.full_address || '',
          }),
        })
      } catch (emailError) {
        console.error('Error sending decline email:', emailError)
        // Don't fail the operation if email fails
      }
    }

    return NextResponse.json({
      ok: true,
    })

  } catch (error) {
    console.error('Decline request error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
