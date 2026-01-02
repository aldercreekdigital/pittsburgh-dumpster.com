import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface BusinessSettings {
  quote_expiration_days: number
  notification_emails: string[]
  terms_text: string
  default_included_days: number
}

const DEFAULT_SETTINGS: BusinessSettings = {
  quote_expiration_days: 7,
  notification_emails: [],
  terms_text: '',
  default_included_days: 3,
}

interface SettingsRow {
  settings: BusinessSettings
}

export async function GET() {
  try {
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('business_settings')
      .select('settings')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json(DEFAULT_SETTINGS)
      }
      throw error
    }

    const row = data as SettingsRow
    return NextResponse.json(row.settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const updates = await request.json()

    // Validate the updates
    const allowedKeys = ['quote_expiration_days', 'notification_emails', 'terms_text', 'default_included_days']
    const filteredUpdates: Partial<BusinessSettings> = {}

    for (const key of allowedKeys) {
      if (key in updates) {
        filteredUpdates[key as keyof BusinessSettings] = updates[key]
      }
    }

    // Get current settings
    const { data: current } = await adminClient
      .from('business_settings')
      .select('settings')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    const currentRow = current as SettingsRow | null
    const currentSettings = currentRow?.settings || DEFAULT_SETTINGS
    const newSettings = { ...currentSettings, ...filteredUpdates }

    // Upsert settings - use type assertion since business_settings may not have generated types
    const { data, error } = await (adminClient
      .from('business_settings') as ReturnType<typeof adminClient.from>)
      .upsert({
        business_id: DEFAULT_BUSINESS_ID,
        settings: newSettings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'business_id',
      })
      .select('settings')
      .single()

    if (error) {
      throw error
    }

    const row = data as SettingsRow
    return NextResponse.json(row.settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
