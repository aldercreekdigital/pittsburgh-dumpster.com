import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { AdminMobileNav } from './AdminMobileNav'
import { NAV_ITEMS, NavIcon } from './nav-config'

interface BusinessUser {
  role: string
}

async function getAdminUser() {
  const supabase = await createClient()
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
    email: user.email,
    role: (businessUser as BusinessUser).role,
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    redirect('/login?next=/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-primary-dark-green text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <AdminMobileNav navItems={NAV_ITEMS} />
            <Link href="/admin" className="text-lg md:text-xl font-bold">
              McCrackan Admin
            </Link>
            <span className="hidden sm:inline text-xs bg-white/20 px-2 py-1 rounded">
              {adminUser.role.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden md:inline text-sm text-gray-300">{adminUser.email}</span>
            <Link
              href="/"
              className="text-sm bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition"
            >
              View Site
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden md:block w-64 bg-white shadow-md min-h-[calc(100vh-56px)]">
          <nav className="p-4">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    <NavIcon icon={item.icon} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
