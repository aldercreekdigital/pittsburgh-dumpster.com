import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

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

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'home' },
  { href: '/admin/requests', label: 'Booking Requests', icon: 'inbox' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
  { href: '/admin/invoices', label: 'Invoices', icon: 'receipt' },
  { href: '/admin/dumpsters', label: 'Dumpsters', icon: 'truck' },
]

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
            <Link href="/admin" className="text-xl font-bold">
              McCrackan Admin
            </Link>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {adminUser.role.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{adminUser.email}</span>
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
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-56px)]">
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
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    inbox: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    calendar: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    receipt: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    truck: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  }

  return icons[icon] || null
}
