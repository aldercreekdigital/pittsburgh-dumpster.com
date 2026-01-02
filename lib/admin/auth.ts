import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

export interface AdminUser {
  id: string
  email: string
  role: string
}

/**
 * Get the current admin user from the session.
 * Returns null if the user is not authenticated or not an admin.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
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

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Check if user is a business user
  const adminClient = createAdminClient()
  const { data: businessUser } = await adminClient
    .from('business_users')
    .select('role')
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .eq('user_id', user.id)
    .single()

  if (!businessUser) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
    role: (businessUser as { role: string }).role,
  }
}

/**
 * Require admin authentication for an API route.
 * Returns the admin user or throws an error response.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    throw new Error('Unauthorized')
  }

  return adminUser
}
