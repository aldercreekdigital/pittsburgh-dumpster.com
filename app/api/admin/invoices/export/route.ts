import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

interface InvoiceRow {
  id: string
  invoice_number: string
  status: string
  issued_at: string | null
  subtotal: number
  total: number
  created_at: string
  customer: {
    name: string
    email: string
    phone: string | null
  } | null
  booking: {
    address: {
      full_address: string
    } | null
    pricing_snapshot: {
      tax_amount?: number
      processing_fee?: number
      dumpster_size?: number
      waste_type?: string
    } | null
  } | null
  payments: {
    created_at: string
    status: string
  }[]
}

function formatCents(cents: number): number {
  return cents / 100
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status') // 'all', 'paid', 'unpaid', etc.

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Build query
    let query = adminClient
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
          address:addresses(full_address),
          pricing_snapshot
        ),
        payments(created_at, status)
      `)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .gte('issued_at', `${startDate}T00:00:00`)
      .lte('issued_at', `${endDate}T23:59:59`)
      .order('issued_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: invoices, error } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    const typedInvoices = (invoices || []) as InvoiceRow[]

    // Transform data for Excel
    const excelData = typedInvoices.map((invoice) => {
      const paidPayment = invoice.payments.find(p => p.status === 'succeeded')
      const taxAmount = invoice.booking?.pricing_snapshot?.tax_amount || 0
      const processingFee = invoice.booking?.pricing_snapshot?.processing_fee || 0

      return {
        'Invoice #': invoice.invoice_number,
        'Status': invoice.status.toUpperCase(),
        'Customer Name': invoice.customer?.name || '',
        'Customer Email': invoice.customer?.email || '',
        'Customer Phone': invoice.customer?.phone || '',
        'Service Address': invoice.booking?.address?.full_address || '',
        'Dumpster Size': invoice.booking?.pricing_snapshot?.dumpster_size
          ? `${invoice.booking.pricing_snapshot.dumpster_size} Yard`
          : '',
        'Waste Type': invoice.booking?.pricing_snapshot?.waste_type
          ? invoice.booking.pricing_snapshot.waste_type.replace('_', ' ').toUpperCase()
          : '',
        'Issued Date': formatDate(invoice.issued_at),
        'Subtotal': formatCents(invoice.subtotal),
        'Tax': formatCents(taxAmount),
        'Processing Fee': formatCents(processingFee),
        'Total': formatCents(invoice.total),
        'Paid Date': paidPayment ? formatDate(paidPayment.created_at) : '',
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Invoice #
      { wch: 10 }, // Status
      { wch: 25 }, // Customer Name
      { wch: 30 }, // Customer Email
      { wch: 15 }, // Customer Phone
      { wch: 40 }, // Service Address
      { wch: 12 }, // Dumpster Size
      { wch: 20 }, // Waste Type
      { wch: 12 }, // Issued Date
      { wch: 12 }, // Subtotal
      { wch: 10 }, // Tax
      { wch: 14 }, // Processing Fee
      { wch: 12 }, // Total
      { wch: 12 }, // Paid Date
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename with date range
    const filename = `invoices_${startDate}_to_${endDate}.xlsx`

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Invoice export error:', error)
    return NextResponse.json(
      { error: 'Failed to export invoices' },
      { status: 500 }
    )
  }
}
