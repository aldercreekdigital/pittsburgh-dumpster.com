import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email || email.length < 3) {
      return NextResponse.json(
        { ok: false, error: 'Email must be at least 3 characters' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Search for customers by email (case-insensitive partial match)
    const { data: customers, error } = await adminClient
      .from('customers')
      .select('id, name, email, phone, user_id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .ilike('email', `%${email}%`)
      .limit(10)

    if (error) {
      console.error('Error searching customers:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to search customers' },
        { status: 500 }
      )
    }

    // Map results with hasAccount flag
    const results = (customers || []).map((c: { id: string; name: string; email: string; phone: string | null; user_id: string | null }) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      hasAccount: !!c.user_id,
    }))

    return NextResponse.json({
      ok: true,
      customers: results,
    })

  } catch (error) {
    console.error('Customer search error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
