import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Get invoice details for payment page
 * Public endpoint - anyone with the invoice ID can view it
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: invoiceId } = await params
    const adminClient = createAdminClient()

    const { data: invoice, error } = await adminClient
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        total,
        subtotal,
        customer:customers(id, name, email),
        booking_request:booking_requests(
          id,
          quote:quotes(
            dumpster_size,
            waste_type,
            dropoff_date,
            pickup_date,
            address:addresses(full_address)
          )
        ),
        line_items:invoice_line_items(id, label, amount, line_type)
      `)
      .eq('id', invoiceId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
