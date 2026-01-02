import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface AddToCartRequest {
  quoteId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AddToCartRequest = await request.json()

    if (!body.quoteId) {
      return NextResponse.json(
        { ok: false, error: 'Missing quoteId' },
        { status: 400 }
      )
    }

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

    // Verify quote exists and has pricing
    const { data: quoteData, error: quoteError } = await adminClient
      .from('quotes')
      .select('id, status, pricing_snapshot, business_id')
      .eq('id', body.quoteId)
      .single()

    const quote = quoteData as { id: string; status: string; pricing_snapshot: unknown; business_id: string } | null

    if (quoteError || !quote) {
      return NextResponse.json(
        { ok: false, error: 'Quote not found' },
        { status: 404 }
      )
    }

    if (!quote.pricing_snapshot) {
      return NextResponse.json(
        { ok: false, error: 'Quote has no pricing configured' },
        { status: 400 }
      )
    }

    // Get or create active cart for user (handle race conditions)
    const { data: existingCarts } = await adminClient
      .from('carts')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)

    let cartId: string

    if (existingCarts && existingCarts.length > 0) {
      cartId = (existingCarts[0] as { id: string }).id
    } else {
      const { data: newCart, error: cartError } = await adminClient
        .from('carts')
        .insert({
          business_id: DEFAULT_BUSINESS_ID,
          user_id: user.id,
          status: 'active',
        } as never)
        .select('id')
        .single()

      if (cartError || !newCart) {
        console.error('Error creating cart:', cartError)
        return NextResponse.json(
          { ok: false, error: 'Failed to create cart' },
          { status: 500 }
        )
      }

      cartId = (newCart as { id: string }).id
    }

    // Check if quote is already in cart
    const { data: existingItem } = await adminClient
      .from('cart_items')
      .select('id')
      .eq('cart_id', cartId)
      .eq('quote_id', body.quoteId)
      .single()

    if (existingItem) {
      return NextResponse.json({
        ok: true,
        cartId,
        message: 'Quote already in cart',
      })
    }

    // Add quote to cart
    const { error: itemError } = await adminClient
      .from('cart_items')
      .insert({
        cart_id: cartId,
        quote_id: body.quoteId,
      } as never)

    if (itemError) {
      console.error('Error adding to cart:', itemError)
      return NextResponse.json(
        { ok: false, error: 'Failed to add to cart' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      cartId,
    })

  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
