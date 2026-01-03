import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SECRET_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const DEFAULT_BUSINESS_ID = '00000000-0000-0000-0000-000000000001'

export async function GET() {
  try {
    const { data: serviceAreas, error } = await supabase
      .from('service_areas')
      .select('id, name, polygon')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('active', true)

    if (error) {
      console.error('Error fetching service areas:', error)
      return NextResponse.json({ error: 'Failed to fetch service areas' }, { status: 500 })
    }

    return NextResponse.json({ serviceAreas: serviceAreas || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
