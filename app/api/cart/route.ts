import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface CartQuote {
  id: string
  waste_type: string
  dumpster_size: number
  dropoff_date: string
  pickup_date: string
  pricing_snapshot: {
    total: number
    subtotal: number
    rental_days: number
    included_tons: number
  }
  addresses: {
    full_address: string
  }
}

export async function GET() {
  try {
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

    // Get active cart with items
    const { data: cartData } = await adminClient
      .from('carts')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const cart = cartData as { id: string } | null

    if (!cart) {
      return NextResponse.json({
        ok: true,
        cart: null,
        items: [],
      })
    }

    // Get cart items with quote details
    interface CartItemRow {
      id: string
      quote_id: string
      quotes: CartQuote
    }

    const { data: cartItemsData, error: itemsError } = await adminClient
      .from('cart_items')
      .select(`
        id,
        quote_id,
        quotes (
          id,
          waste_type,
          dumpster_size,
          dropoff_date,
          pickup_date,
          pricing_snapshot,
          addresses (
            full_address
          )
        )
      `)
      .eq('cart_id', cart.id)

    const cartItems = cartItemsData as unknown as CartItemRow[] | null

    if (itemsError) {
      console.error('Error fetching cart items:', itemsError)
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch cart' },
        { status: 500 }
      )
    }

    // Transform the data
    const items = (cartItems || []).map(item => {
      const quote = item.quotes
      return {
        id: item.id,
        quoteId: item.quote_id,
        wasteType: quote?.waste_type,
        dumpsterSize: quote?.dumpster_size,
        dropoffDate: quote?.dropoff_date,
        pickupDate: quote?.pickup_date,
        total: quote?.pricing_snapshot?.total || 0,
        address: quote?.addresses?.full_address || '',
      }
    })

    return NextResponse.json({
      ok: true,
      cartId: cart.id,
      items,
    })

  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
