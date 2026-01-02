import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface InviteSignupRequest {
  token: string
  password: string
  name?: string
}

// GET: Validate token and return customer info
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Find customer by invite token
    const { data: customer, error } = await adminClient
      .from('customers')
      .select('id, name, email, phone, invite_token_expires_at, user_id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('invite_token', token)
      .single()

    if (error || !customer) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired invite token' },
        { status: 400 }
      )
    }

    const customerData = customer as {
      id: string
      name: string
      email: string
      phone: string | null
      invite_token_expires_at: string | null
      user_id: string | null
    }

    // Check if already has account
    if (customerData.user_id) {
      return NextResponse.json(
        { ok: false, error: 'Account already exists. Please log in instead.' },
        { status: 400 }
      )
    }

    // Check if token expired
    if (customerData.invite_token_expires_at) {
      const expiresAt = new Date(customerData.invite_token_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { ok: false, error: 'Invite token has expired. Please contact us for a new invite.' },
          { status: 400 }
        )
      }
    }

    // Get pending invoice for this customer
    const { data: pendingInvoice } = await adminClient
      .from('invoices')
      .select('id, invoice_number, total')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('customer_id', customerData.id)
      .eq('status', 'unpaid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      ok: true,
      customer: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      },
      pendingInvoice: pendingInvoice ? {
        id: (pendingInvoice as { id: string }).id,
        invoiceNumber: (pendingInvoice as { invoice_number: string }).invoice_number,
        total: (pendingInvoice as { total: number }).total,
      } : null,
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create account and link customer
export async function POST(request: NextRequest) {
  try {
    const body: InviteSignupRequest = await request.json()

    if (!body.token || !body.password) {
      return NextResponse.json(
        { ok: false, error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Find customer by invite token
    const { data: customer, error: customerError } = await adminClient
      .from('customers')
      .select('id, name, email, phone, invite_token_expires_at, user_id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('invite_token', body.token)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired invite token' },
        { status: 400 }
      )
    }

    const customerData = customer as {
      id: string
      name: string
      email: string
      phone: string | null
      invite_token_expires_at: string | null
      user_id: string | null
    }

    // Check if already has account
    if (customerData.user_id) {
      return NextResponse.json(
        { ok: false, error: 'Account already exists. Please log in instead.' },
        { status: 400 }
      )
    }

    // Check if token expired
    if (customerData.invite_token_expires_at) {
      const expiresAt = new Date(customerData.invite_token_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { ok: false, error: 'Invite token has expired. Please contact us for a new invite.' },
          { status: 400 }
        )
      }
    }

    // Create auth user using admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: customerData.email,
      password: body.password,
      email_confirm: true, // Auto-confirm since we sent them the invite
      user_metadata: {
        full_name: body.name || customerData.name,
        phone: customerData.phone,
      },
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError)

      // Check if user already exists
      if (authError?.message?.includes('already registered')) {
        return NextResponse.json(
          { ok: false, error: 'An account with this email already exists. Please log in instead.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { ok: false, error: authError?.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    // Link customer to the new user and clear invite token
    const { error: updateError } = await adminClient
      .from('customers')
      .update({
        user_id: authData.user.id,
        name: body.name || customerData.name,
        invite_token: null,
        invite_token_expires_at: null,
      } as never)
      .eq('id', customerData.id)

    if (updateError) {
      console.error('Error linking customer:', updateError)
      // Don't fail - user is created, just not linked properly
    }

    // Get pending invoice for redirect
    const { data: pendingInvoice } = await adminClient
      .from('invoices')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('customer_id', customerData.id)
      .eq('status', 'unpaid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Sign in the user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: customerData.email,
      password: body.password,
    })

    if (signInError) {
      console.error('Error signing in:', signInError)
      // User is created but couldn't auto sign in - they can sign in manually
    }

    return NextResponse.json({
      ok: true,
      message: 'Account created successfully',
      pendingInvoiceId: pendingInvoice ? (pendingInvoice as { id: string }).id : null,
    })

  } catch (error) {
    console.error('Invite signup error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
