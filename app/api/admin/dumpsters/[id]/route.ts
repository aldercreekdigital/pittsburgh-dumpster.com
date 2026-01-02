import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface DumpsterData {
  id: string
  unit_number: string
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { unit_number, size, type, status, notes } = await request.json()

    if (!unit_number || !size) {
      return NextResponse.json(
        { error: 'Unit number and size are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Get current dumpster
    const { data, error: fetchError } = await adminClient
      .from('dumpsters')
      .select('id, unit_number')
      .eq('id', id)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (fetchError || !data) {
      return NextResponse.json(
        { error: 'Dumpster not found' },
        { status: 404 }
      )
    }

    const currentDumpster = data as DumpsterData

    // Check for duplicate unit number if changing
    if (unit_number !== currentDumpster.unit_number) {
      const { data: existing } = await adminClient
        .from('dumpsters')
        .select('id')
        .eq('business_id', DEFAULT_BUSINESS_ID)
        .eq('unit_number', unit_number)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'A dumpster with this unit number already exists' },
          { status: 400 }
        )
      }
    }

    // Update dumpster
    const { error: updateError } = await adminClient
      .from('dumpsters')
      .update({
        unit_number,
        size,
        type: type || null,
        status,
        notes: notes || null,
      } as never)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating dumpster:', updateError)
      return NextResponse.json(
        { error: 'Failed to update dumpster' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in update dumpster:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const adminClient = createAdminClient()

    // Check if dumpster is assigned to any active booking
    const { data: activeBooking } = await adminClient
      .from('bookings')
      .select('id')
      .eq('dumpster_id', id)
      .not('status', 'in', '("completed","cancelled")')
      .single()

    if (activeBooking) {
      return NextResponse.json(
        { error: 'Cannot delete a dumpster that is assigned to an active booking' },
        { status: 400 }
      )
    }

    // Delete dumpster
    const { error: deleteError } = await adminClient
      .from('dumpsters')
      .delete()
      .eq('id', id)
      .eq('business_id', DEFAULT_BUSINESS_ID)

    if (deleteError) {
      console.error('Error deleting dumpster:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete dumpster' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete dumpster:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
