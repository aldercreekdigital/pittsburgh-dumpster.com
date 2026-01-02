import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { sendEmail, getPaymentConfirmationHtml } from '@/lib/email/send'

interface MockPayBody {
  invoiceId: string
}

interface BookingRequestData {
  id: string
  customer_id: string
  quote: {
    id: string
    address_id: string
    dumpster_size: number
    dropoff_date: string
    pickup_date: string
    pricing_snapshot: unknown
    address: { full_address: string } | null
  } | null
  customer: { id: string; name: string; email: string } | null
}

interface InvoiceData {
  id: string
  invoice_number: string
  status: string
  total: number
  customer_id: string
  booking_request_id: string
  booking_request: BookingRequestData | null
}

/**
 * Mock payment endpoint for testing.
 * In production, this would be replaced by Stripe webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const body: MockPayBody = await request.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // 1. Load the invoice with related data
    const { data: invoice, error: invoiceError } = await adminClient
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        total,
        customer_id,
        booking_request_id,
        booking_request:booking_requests(
          id,
          customer_id,
          quote:quotes(
            id,
            address_id,
            dumpster_size,
            dropoff_date,
            pickup_date,
            pricing_snapshot,
            address:addresses(full_address)
          ),
          customer:customers(id, name, email)
        )
      `)
      .eq('id', invoiceId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Type assertion for the invoice
    const typedInvoice = invoice as InvoiceData

    if (typedInvoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice already paid' },
        { status: 400 }
      )
    }

    const bookingRequest = typedInvoice.booking_request
    const quote = bookingRequest?.quote
    const customer = bookingRequest?.customer

    if (!quote || !customer) {
      return NextResponse.json(
        { error: 'Invalid invoice - missing booking request or quote' },
        { status: 400 }
      )
    }

    // 2. Mark invoice as paid
    const { error: updateInvoiceError } = await adminClient
      .from('invoices')
      .update({
        status: 'paid',
        stripe_payment_intent_id: `mock_${Date.now()}`, // Mock payment ID
      } as never)
      .eq('id', invoiceId)

    if (updateInvoiceError) {
      console.error('Error updating invoice:', updateInvoiceError)
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      )
    }

    // 3. Create a payment record
    await adminClient
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        stripe_payment_intent_id: `mock_${Date.now()}`,
        amount: typedInvoice.total,
        status: 'succeeded',
      } as never)

    // 4. Create the booking
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        booking_request_id: bookingRequest.id,
        customer_id: customer.id,
        address_id: quote.address_id,
        status: 'confirmed',
        dropoff_scheduled_at: quote.dropoff_date,
        pickup_due_at: quote.pickup_date,
        pricing_snapshot: quote.pricing_snapshot,
      } as never)
      .select('id')
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      // Don't fail - invoice is already paid
    }

    // 5. Link booking to invoice
    const bookingRecord = booking as { id: string } | null
    if (bookingRecord) {
      await adminClient
        .from('invoices')
        .update({ booking_id: bookingRecord.id } as never)
        .eq('id', invoiceId)
    }

    // 6. Send confirmation email
    try {
      await sendEmail({
        to: customer.email,
        subject: `Payment Confirmed - Invoice #${typedInvoice.invoice_number}`,
        html: getPaymentConfirmationHtml({
          customerName: customer.name,
          invoiceNumber: typedInvoice.invoice_number,
          total: typedInvoice.total,
          dumpsterSize: quote.dumpster_size,
          address: quote.address?.full_address || '',
          dropoffDate: quote.dropoff_date,
          pickupDate: quote.pickup_date,
        }),
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
    }

    return NextResponse.json({
      ok: true,
      bookingId: bookingRecord?.id,
    })
  } catch (error) {
    console.error('Mock payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
