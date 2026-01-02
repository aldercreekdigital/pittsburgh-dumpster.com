import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { checkServiceability, type ServiceArea, type GeoJsonPolygon } from '@/lib/geo/serviceability'

interface StartQuoteRequest {
  fullAddress: string
  street?: string
  city?: string
  state?: string
  zip?: string
  lat: number
  lng: number
  placeId?: string
}

interface ServiceAreaRow {
  id: string
  name: string
  polygon: unknown
  active: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: StartQuoteRequest = await request.json()

    // Validate required fields
    if (!body.fullAddress || typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: fullAddress, lat, lng' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    // Get the current user from the session - authentication required
    const authClient = createServerClient(
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

    const { data: { user }, error: userError } = await authClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get or create customer for this user
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('user_id', user.id)
      .single()

    let customerId: string

    if (existingCustomer) {
      customerId = (existingCustomer as { id: string }).id
    } else {
      // Create customer record
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          business_id: DEFAULT_BUSINESS_ID,
          user_id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email || '',
          phone: user.user_metadata?.phone || '',
        } as never)
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError)
        return NextResponse.json(
          { ok: false, error: 'Failed to create customer record' },
          { status: 500 }
        )
      }

      customerId = (newCustomer as { id: string }).id
    }

    // Fetch active service areas for the business
    const { data: serviceAreasData, error: serviceAreasError } = await supabase
      .from('service_areas')
      .select('id, name, polygon, active')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('active', true)

    if (serviceAreasError) {
      console.error('Error fetching service areas:', serviceAreasError)
      return NextResponse.json(
        { ok: false, error: 'Failed to check service area' },
        { status: 500 }
      )
    }

    // Transform to ServiceArea type
    const serviceAreas: ServiceArea[] = ((serviceAreasData || []) as ServiceAreaRow[]).map(area => ({
      id: area.id,
      name: area.name,
      polygon: area.polygon as GeoJsonPolygon,
      active: area.active,
    }))

    // Check serviceability
    const serviceabilityResult = checkServiceability(body.lat, body.lng, serviceAreas)

    if (!serviceabilityResult.isServiceable) {
      return NextResponse.json({
        ok: false,
        reason: 'not_serviceable',
        message: serviceabilityResult.message,
      })
    }

    // Create address record linked to customer
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: customerId,
        full_address: body.fullAddress,
        street: body.street || null,
        city: body.city || null,
        state: body.state || null,
        zip: body.zip || null,
        lat: body.lat,
        lng: body.lng,
        place_id: body.placeId || null,
      } as never)
      .select('id')
      .single()

    const address = addressData as { id: string } | null

    if (addressError || !address) {
      console.error('Error creating address:', addressError)
      return NextResponse.json(
        { ok: false, error: 'Failed to save address' },
        { status: 500 }
      )
    }

    // Create draft quote linked to customer
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        address_id: address.id,
        customer_id: customerId,
        status: 'draft',
      } as never)
      .select('id')
      .single()

    const quote = quoteData as { id: string } | null

    if (quoteError || !quote) {
      console.error('Error creating quote:', quoteError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create quote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      quoteId: quote.id,
      addressId: address.id,
      serviceArea: serviceabilityResult.matchedAreaName,
    })

  } catch (error) {
    console.error('Quote start error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
