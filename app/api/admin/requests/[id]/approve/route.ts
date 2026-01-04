import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { sendEmail, getBookingApprovedHtml } from '@/lib/email/send'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface PricingSnapshot {
  total: number
  subtotal: number
  base_price: number
  delivery_fee: number
  haul_fee: number
  extra_days: number
  extra_day_fee: number
  extended_service_fee: number
  taxable_amount: number
  tax_rate: number
  tax_amount: number
  processing_fee: number
  dumpster_size: number
  waste_type: string
  tax_exempt: boolean
}

interface LineItem {
  label: string
  amount: number
  sort_order: number
  line_type: string
}

interface BookingRequestData {
  id: string
  status: string
  customer_id: string
  quote: {
    id: string
    pricing_snapshot: PricingSnapshot | null
    dumpster_size: number
    waste_type: string
    dropoff_date: string
    pickup_date: string
    address: { full_address: string } | null
    line_items: LineItem[]
  } | null
  customer: { id: string; name: string; email: string } | null
}

/**
 * Approve a booking request.
 * Creates an invoice and sends a payment link to the customer.
 * The booking is created when payment succeeds (via webhook).
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
    const adminClient = createAdminClient()

    // 1. Load the booking request with related data
    const { data: bookingRequest, error: requestError } = await adminClient
      .from('booking_requests')
      .select(`
        id,
        status,
        customer_id,
        quote:quotes(
          id,
          pricing_snapshot,
          dumpster_size,
          waste_type,
          dropoff_date,
          pickup_date,
          address:addresses(full_address),
          line_items:quote_line_items(label, amount, sort_order, line_type)
        ),
        customer:customers(id, name, email)
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
        { ok: false, error: `Cannot approve a request with status: ${typedRequest.status}` },
        { status: 400 }
      )
    }

    const quote = typedRequest.quote
    const customer = typedRequest.customer

    if (!quote?.pricing_snapshot) {
      return NextResponse.json(
        { ok: false, error: 'Quote has no pricing snapshot' },
        { status: 400 }
      )
    }

    if (!customer) {
      return NextResponse.json(
        { ok: false, error: 'Customer not found' },
        { status: 400 }
      )
    }

    // 2. Generate next invoice number
    const { data: lastInvoice } = await adminClient
      .from('invoices')
      .select('invoice_number')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextInvoiceNumber = 1001 // Start from 1001
    if (lastInvoice) {
      const lastNumber = parseInt((lastInvoice as { invoice_number: string }).invoice_number, 10)
      if (!isNaN(lastNumber)) {
        nextInvoiceNumber = lastNumber + 1
      }
    }

    // 3. Create invoice (subtotal is before tax+processing, total includes everything)
    const { data: invoice, error: invoiceError } = await adminClient
      .from('invoices')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: customer.id,
        booking_request_id: requestId,
        invoice_number: nextInvoiceNumber.toString(),
        status: 'unpaid',
        issued_at: new Date().toISOString(),
        subtotal: quote.pricing_snapshot.subtotal || quote.pricing_snapshot.total,
        total: quote.pricing_snapshot.total,
      } as never)
      .select('id, invoice_number')
      .single()

    if (invoiceError || !invoice) {
      console.error('Error creating invoice:', invoiceError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    const invoiceRecord = invoice as { id: string; invoice_number: string }

    // 4. Create invoice line items (preserving line_type from quote)
    const lineItems = quote.line_items || []
    for (const item of lineItems) {
      const { error: lineItemError } = await adminClient
        .from('invoice_line_items')
        .insert({
          invoice_id: invoiceRecord.id,
          label: item.label,
          quantity: 1,
          unit_price: item.amount,
          amount: item.amount,
          line_type: item.line_type || 'base',
        } as never)

      if (lineItemError) {
        console.error('Error creating invoice line item:', lineItemError)
      }
    }

    // 5. Update booking request status
    const { error: updateError } = await adminClient
      .from('booking_requests')
      .update({ status: 'approved' } as never)
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating booking request:', updateError)
      // Don't fail the whole operation, invoice is already created
    }

    // 6. Update quote status to converted
    await adminClient
      .from('quotes')
      .update({ status: 'converted' } as never)
      .eq('id', quote.id)

    // 7. Generate payment URL (will be replaced with Stripe checkout URL)
    // For now, we'll create a placeholder that will be updated when Stripe is integrated
    const paymentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pay?invoice=${invoiceRecord.id}`

    // 8. Send email to customer
    try {
      await sendEmail({
        to: customer.email,
        subject: `Your Dumpster Rental is Approved - Invoice #${invoiceRecord.invoice_number}`,
        html: getBookingApprovedHtml({
          customerName: customer.name,
          invoiceNumber: invoiceRecord.invoice_number,
          dumpsterSize: quote.dumpster_size,
          dropoffDate: quote.dropoff_date,
          pickupDate: quote.pickup_date,
          address: quote.address?.full_address || '',
          total: quote.pricing_snapshot.total,
          paymentUrl,
        }),
      })
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Don't fail the operation if email fails
    }

    return NextResponse.json({
      ok: true,
      invoiceId: invoiceRecord.id,
      invoiceNumber: invoiceRecord.invoice_number,
    })

  } catch (error) {
    console.error('Approve request error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
