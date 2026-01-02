import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { sendEmail, getBookingRequestNotificationHtml, getBookingRequestConfirmationHtml } from '@/lib/email/send'

interface CreateBookingRequestBody {
  cartId: string
  contactName: string
  contactPhone: string
  contactEmail: string
  instructions?: string
  gateInfo?: {
    hasGate: boolean
    gateCode?: string
  }
}

interface Quote {
  id: string
  address_id: string
  waste_type: string
  dumpster_size: number
  dropoff_date: string
  pickup_date: string
  pricing_snapshot: {
    total: number
    subtotal: number
  }
}

interface Address {
  full_address: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequestBody = await request.json()

    // Validate required fields
    if (!body.contactName || !body.contactPhone || !body.contactEmail) {
      return NextResponse.json(
        { ok: false, error: 'Missing required contact information' },
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

    // Get customer record
    const { data: customerData, error: customerError } = await adminClient
      .from('customers')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .single()

    const customer = customerData as { id: string } | null

    if (customerError || !customer) {
      return NextResponse.json(
        { ok: false, error: 'Customer record not found' },
        { status: 400 }
      )
    }

    // Update customer with contact info if different
    await adminClient
      .from('customers')
      .update({
        name: body.contactName,
        phone: body.contactPhone,
        email: body.contactEmail,
      } as never)
      .eq('id', customer.id)

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
      return NextResponse.json(
        { ok: false, error: 'Cart not found' },
        { status: 404 }
      )
    }

    // Get cart items with quotes
    interface CartItemWithQuote {
      id: string
      quote_id: string
      quotes: Quote
    }

    const { data: cartItemsData, error: itemsError } = await adminClient
      .from('cart_items')
      .select(`
        id,
        quote_id,
        quotes (
          id,
          address_id,
          waste_type,
          dumpster_size,
          dropoff_date,
          pickup_date,
          pricing_snapshot,
          status
        )
      `)
      .eq('cart_id', cart.id)

    const cartItems = cartItemsData as unknown as CartItemWithQuote[] | null

    if (itemsError || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // For V1, we only support single-item carts
    const cartItem = cartItems[0]
    const quote = cartItem.quotes

    if (!quote || !quote.pricing_snapshot) {
      return NextResponse.json(
        { ok: false, error: 'Quote has no pricing configured' },
        { status: 400 }
      )
    }

    // Create booking request
    const customerInputs = {
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      instructions: body.instructions || null,
      gateInfo: body.gateInfo || { hasGate: false },
    }

    const { data: bookingRequest, error: brError } = await adminClient
      .from('booking_requests')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: customer.id,
        quote_id: quote.id,
        status: 'pending',
        customer_inputs: customerInputs,
      } as never)
      .select('id')
      .single()

    if (brError || !bookingRequest) {
      console.error('Error creating booking request:', brError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create booking request' },
        { status: 500 }
      )
    }

    // Update quote status
    await adminClient
      .from('quotes')
      .update({ status: 'converted' } as never)
      .eq('id', quote.id)

    // Update cart status
    await adminClient
      .from('carts')
      .update({ status: 'converted' } as never)
      .eq('id', cart.id)

    // Get address for email
    const { data: address } = await adminClient
      .from('addresses')
      .select('full_address')
      .eq('id', quote.address_id)
      .single()

    const addressData = address as Address | null

    // Send notification email to business
    try {
      const notificationHtml = getBookingRequestNotificationHtml({
        customerName: body.contactName,
        customerEmail: body.contactEmail,
        customerPhone: body.contactPhone,
        address: addressData?.full_address || 'Unknown',
        dumpsterSize: quote.dumpster_size,
        wasteType: quote.waste_type,
        dropoffDate: quote.dropoff_date,
        pickupDate: quote.pickup_date,
        total: quote.pricing_snapshot.total,
        adminUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/requests/${(bookingRequest as { id: string }).id}`,
      })

      await sendEmail({
        to: process.env.BUSINESS_NOTIFICATION_EMAIL || 'gmurin@icloud.com',
        subject: `New Booking Request - ${quote.dumpster_size} Yard Dumpster`,
        html: notificationHtml,
      })
    } catch (emailError) {
      // Log but don't fail the request
      console.error('Failed to send notification email:', emailError)
    }

    // Send confirmation email to customer
    try {
      const confirmationHtml = getBookingRequestConfirmationHtml({
        customerName: body.contactName,
        address: addressData?.full_address || 'Unknown',
        dumpsterSize: quote.dumpster_size,
        wasteType: quote.waste_type === 'construction_debris' ? 'Construction Debris' : 'Household Trash',
        dropoffDate: quote.dropoff_date,
        pickupDate: quote.pickup_date,
        total: quote.pricing_snapshot.total,
      })

      await sendEmail({
        to: body.contactEmail,
        subject: 'Your Dumpster Rental Request - McCrackan Roll-Off Service',
        html: confirmationHtml,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      ok: true,
      bookingRequestId: (bookingRequest as { id: string }).id,
    })

  } catch (error) {
    console.error('Create booking request error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
