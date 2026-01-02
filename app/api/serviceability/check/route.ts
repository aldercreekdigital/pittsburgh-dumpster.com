import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { checkServiceability, type ServiceArea, type GeoJsonPolygon } from '@/lib/geo/serviceability'

interface CheckRequest {
  lat: number
  lng: number
}

interface ServiceAreaRow {
  id: string
  name: string
  polygon: unknown
  active: boolean
}

/**
 * Check if a location is within our service area
 * This is a stateless check - no database writes
 */
export async function POST(request: NextRequest) {
  try {
    const body: CheckRequest = await request.json()

    if (typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: lat, lng' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

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
    const result = checkServiceability(body.lat, body.lng, serviceAreas)

    if (!result.isServiceable) {
      return NextResponse.json({
        ok: false,
        reason: 'not_serviceable',
        message: result.message,
      })
    }

    return NextResponse.json({
      ok: true,
      serviceArea: result.matchedAreaName,
    })

  } catch (error) {
    console.error('Serviceability check error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
