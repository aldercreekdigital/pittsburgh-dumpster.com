import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface Booking {
  id: string
  status: string
  dropoff_scheduled_at: string | null
  pickup_due_at: string | null
  dropped_at: string | null
  picked_up_at: string | null
  created_at: string
  customer: { name: string; email: string } | null
  address: { full_address: string } | null
  dumpster: { unit_number: string; size: number } | null
  pricing_snapshot: { dumpster_size: number } | null
}

async function getBookings(status?: string) {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('bookings')
    .select(`
      id,
      status,
      dropoff_scheduled_at,
      pickup_due_at,
      dropped_at,
      picked_up_at,
      created_at,
      pricing_snapshot,
      customer:customers(name, email),
      address:addresses(full_address),
      dumpster:dumpsters(unit_number, size)
    `)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: bookings } = await query

  return (bookings || []) as Booking[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'scheduled':
      return 'bg-purple-100 text-purple-800'
    case 'dropped':
      return 'bg-yellow-100 text-yellow-800'
    case 'picked_up':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const currentStatus = status || 'all'
  const bookings = await getBookings(currentStatus)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/bookings${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              currentStatus === filter.value
                ? 'bg-primary-dark-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dumpster
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drop-off
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pick-up
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.customer?.name || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.customer?.email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {booking.address?.full_address || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.pricing_snapshot?.dumpster_size || '-'} Yard
                    </div>
                    {booking.dumpster && (
                      <div className="text-sm text-gray-500">
                        #{booking.dumpster.unit_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.dropoff_scheduled_at)}
                    </div>
                    {booking.dropped_at && (
                      <div className="text-xs text-green-600">
                        Dropped {formatDate(booking.dropped_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.pickup_due_at)}
                    </div>
                    {booking.picked_up_at && (
                      <div className="text-xs text-green-600">
                        Picked up {formatDate(booking.picked_up_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-primary-green hover:text-primary-dark-green font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
