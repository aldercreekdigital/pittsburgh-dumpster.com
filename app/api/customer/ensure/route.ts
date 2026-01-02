import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Get the current user from the session
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Check if customer already exists for this user (by user_id)
    const { data: existingByUserId } = await adminClient
      .from('customers')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .single()

    if (existingByUserId) {
      return NextResponse.json({
        ok: true,
        customerId: (existingByUserId as { id: string }).id,
        created: false,
      })
    }

    // Check if customer exists by email (created before signup, needs linking)
    const { data: existingByEmail } = await adminClient
      .from('customers')
      .select('id, user_id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('email', user.email || '')
      .single()

    if (existingByEmail) {
      const existing = existingByEmail as { id: string; user_id: string | null }

      // Link the existing customer to this user if not already linked
      if (!existing.user_id) {
        await adminClient
          .from('customers')
          .update({ user_id: user.id } as never)
          .eq('id', existing.id)
      }

      return NextResponse.json({
        ok: true,
        customerId: existing.id,
        created: false,
      })
    }

    // Create new customer record
    const { data: newCustomerData, error: createError } = await adminClient
      .from('customers')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        user_id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        phone: user.user_metadata?.phone || null,
      } as never)
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating customer:', createError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create customer record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      customerId: (newCustomerData as { id: string })?.id,
      created: true,
    })

  } catch (error) {
    console.error('Customer ensure error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
