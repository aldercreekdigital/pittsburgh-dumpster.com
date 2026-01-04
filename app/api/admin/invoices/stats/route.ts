import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface InvoiceRow {
  status: string
  total: number
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Build query
    let query = adminClient
      .from('invoices')
      .select('status, total')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .gte('issued_at', `${startDate}T00:00:00`)
      .lte('issued_at', `${endDate}T23:59:59`)

    // Apply status filter for the actual count query
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: invoices, error } = await query

    if (error) {
      console.error('Error fetching invoice stats:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch invoice stats' },
        { status: 500 }
      )
    }

    const typedInvoices = (invoices || []) as InvoiceRow[]

    // Calculate stats
    const stats = {
      totalInvoices: typedInvoices.length,
      totalRevenue: typedInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0),
      paidCount: typedInvoices.filter(inv => inv.status === 'paid').length,
      unpaidCount: typedInvoices.filter(inv => inv.status === 'unpaid').length,
      voidCount: typedInvoices.filter(inv => inv.status === 'void').length,
      refundedCount: typedInvoices.filter(inv => inv.status === 'refunded').length,
    }

    return NextResponse.json({ ok: true, stats })
  } catch (error) {
    console.error('Invoice stats error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch invoice stats' },
      { status: 500 }
    )
  }
}
