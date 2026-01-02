import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface CountResult {
  count: number
}

async function getDashboardStats() {
  const adminClient = createAdminClient()

  // Get counts for various entities
  const [
    pendingRequests,
    activeBookings,
    unpaidInvoices,
    availableDumpsters,
  ] = await Promise.all([
    adminClient
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('status', 'pending'),
    adminClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .in('status', ['confirmed', 'scheduled', 'dropped']),
    adminClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('status', 'unpaid'),
    adminClient
      .from('dumpsters')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('status', 'available'),
  ])

  return {
    pendingRequests: pendingRequests.count || 0,
    activeBookings: activeBookings.count || 0,
    unpaidInvoices: unpaidInvoices.count || 0,
    availableDumpsters: availableDumpsters.count || 0,
  }
}

async function getRecentRequests() {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('booking_requests')
    .select(`
      id,
      status,
      created_at,
      customer:customers(name, email),
      quote:quotes(
        dumpster_size,
        dropoff_date,
        pricing_snapshot
      )
    `)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'declined':
      return 'bg-red-100 text-red-800'
    case 'modified_awaiting_customer':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function AdminDashboard() {
  const [stats, recentRequests] = await Promise.all([
    getDashboardStats(),
    getRecentRequests(),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          href="/admin/requests?status=pending"
          color="yellow"
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings}
          href="/admin/bookings"
          color="green"
        />
        <StatCard
          title="Unpaid Invoices"
          value={stats.unpaidInvoices}
          href="/admin/invoices?status=unpaid"
          color="red"
        />
        <StatCard
          title="Available Dumpsters"
          value={stats.availableDumpsters}
          href="/admin/dumpsters"
          color="blue"
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Booking Requests</h2>
          <Link
            href="/admin/requests"
            className="text-sm text-primary-green hover:underline"
          >
            View all
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No booking requests yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dropoff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentRequests.map((request: any) => {
                  const customer = request.customer as { name: string; email: string } | null
                  const quote = request.quote as { dumpster_size: number; dropoff_date: string; pricing_snapshot: { total: number } | null } | null

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote?.dumpster_size} Yard
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote?.dropoff_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quote?.pricing_snapshot?.total
                          ? formatCents(quote.pricing_snapshot.total)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(request.status)}`}>
                          {request.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/admin/requests/${request.id}`}
                          className="text-primary-green hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  href,
  color,
}: {
  title: string
  value: number
  href: string
  color: 'yellow' | 'green' | 'red' | 'blue'
}) {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
  }

  const valueColorClasses = {
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }

  return (
    <Link
      href={href}
      className={`block p-6 rounded-lg border-2 ${colorClasses[color]} hover:shadow-md transition`}
    >
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${valueColorClasses[color]}`}>
        {value}
      </div>
    </Link>
  )
}
