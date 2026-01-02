import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { generateInvoicePdf } from '@/lib/pdf/invoice'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface InvoiceData {
  id: string
  invoice_number: string
  status: string
  issued_at: string | null
  subtotal: number
  total: number
  created_at: string
  customer: { name: string; email: string; phone: string } | null
  booking: {
    address: { full_address: string } | null
  } | null
  line_items: {
    label: string
    quantity: number
    unit_price: number
    amount: number
  }[]
  payments: { created_at: string }[]
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        issued_at,
        subtotal,
        total,
        created_at,
        customer:customers(name, email, phone),
        booking:bookings(
          address:addresses(full_address)
        ),
        line_items:invoice_line_items(label, quantity, unit_price, amount),
        payments(created_at)
      `)
      .eq('id', id)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoice = data as InvoiceData
    const paidPayment = invoice.payments.find((p) => p.created_at)

    const pdfBuffer = generateInvoicePdf({
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      issuedAt: invoice.issued_at || invoice.created_at,
      customerName: invoice.customer?.name || 'Unknown',
      customerEmail: invoice.customer?.email || '',
      customerPhone: invoice.customer?.phone || '',
      address: invoice.booking?.address?.full_address || 'N/A',
      lineItems: invoice.line_items,
      subtotal: invoice.subtotal,
      total: invoice.total,
      paidAt: paidPayment?.created_at,
    })

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
