import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface RemoveFromCartRequest {
  itemId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RemoveFromCartRequest = await request.json()

    if (!body.itemId) {
      return NextResponse.json(
        { ok: false, error: 'Missing itemId' },
        { status: 400 }
      )
    }

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

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Get user's active cart
    const { data: cartData } = await adminClient
      .from('carts')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const cart = cartData as { id: string } | null

    if (!cart) {
      return NextResponse.json(
        { ok: false, error: 'Cart not found' },
        { status: 404 }
      )
    }

    // Remove item (only if it belongs to user's cart)
    const { error: deleteError } = await adminClient
      .from('cart_items')
      .delete()
      .eq('id', body.itemId)
      .eq('cart_id', cart.id)

    if (deleteError) {
      console.error('Error removing cart item:', deleteError)
      return NextResponse.json(
        { ok: false, error: 'Failed to remove item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
