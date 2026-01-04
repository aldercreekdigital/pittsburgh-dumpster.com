import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin/auth'

export async function PUT(request: NextRequest) {
  // Verify admin access
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { polygon } = body

    // Validate polygon structure
    if (!polygon || polygon.type !== 'Polygon' || !Array.isArray(polygon.coordinates)) {
      return NextResponse.json(
        { error: 'Invalid polygon format. Expected GeoJSON Polygon.' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (polygon.coordinates.length === 0 || polygon.coordinates[0].length < 4) {
      return NextResponse.json(
        { error: 'Polygon must have at least 4 coordinate points (including closing point).' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if service area exists
    const { data: existingAreas } = await supabase
      .from('service_areas')
      .select('id')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('active', true)
      .limit(1)

    if (existingAreas && existingAreas.length > 0) {
      // Update existing service area
      const { error } = await supabase
        .from('service_areas')
        .update({
          polygon,
        } as never)
        .eq('id', (existingAreas[0] as { id: string }).id)

      if (error) {
        console.error('Error updating service area:', error)
        return NextResponse.json(
          { error: 'Failed to update service area' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        ok: true,
        message: 'Service area updated successfully',
        id: (existingAreas[0] as { id: string }).id,
      })
    } else {
      // Create new service area
      const { data, error } = await supabase
        .from('service_areas')
        .insert({
          business_id: DEFAULT_BUSINESS_ID,
          name: 'Service Area',
          polygon,
          active: true,
        } as never)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating service area:', error)
        return NextResponse.json(
          { error: 'Failed to create service area' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        ok: true,
        message: 'Service area created successfully',
        id: (data as { id: string }).id,
      })
    }
  } catch (error) {
    console.error('Service area update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
