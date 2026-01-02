import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { DumpsterForm } from './DumpsterForm'

interface BaseDumpster {
  id: string
  unit_number: string
  size: number
  type: string | null
  status: string
  notes: string | null
  created_at: string
}

interface Dumpster extends BaseDumpster {
  current_booking: { id: string; customer: { name: string } | null } | null
}

async function getDumpsters(status?: string): Promise<Dumpster[]> {
  const adminClient = createAdminClient()

  const baseQuery = adminClient
    .from('dumpsters')
    .select(`
      id,
      unit_number,
      size,
      type,
      status,
      notes,
      created_at
    `)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .order('unit_number', { ascending: true })

  const { data } = status && status !== 'all'
    ? await baseQuery.eq('status', status)
    : await baseQuery

  const dumpsters = (data || []) as BaseDumpster[]

  if (dumpsters.length === 0) {
    return []
  }

  // Get current bookings for each dumpster
  const dumpsterIds = dumpsters.map((d) => d.id)
  const { data: bookings } = await adminClient
    .from('bookings')
    .select('id, dumpster_id, customer:customers(name)')
    .in('dumpster_id', dumpsterIds)
    .not('status', 'in', '("completed","cancelled")')

  const bookingsByDumpster = (bookings || []).reduce(
    (acc, b) => {
      const booking = b as { id: string; dumpster_id: string | null; customer: { name: string } | null }
      if (booking.dumpster_id) {
        acc[booking.dumpster_id] = { id: booking.id, customer: booking.customer }
      }
      return acc
    },
    {} as Record<string, { id: string; customer: { name: string } | null }>
  )

  return dumpsters.map((d) => ({
    ...d,
    current_booking: bookingsByDumpster[d.id] || null,
  }))
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'reserved':
      return 'bg-blue-100 text-blue-800'
    case 'dropped':
      return 'bg-yellow-100 text-yellow-800'
    case 'maintenance':
      return 'bg-orange-100 text-orange-800'
    case 'retired':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
]

const SIZE_OPTIONS = [10, 15, 20, 30, 40]

export default async function DumpstersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const currentStatus = status || 'all'
  const dumpsters = await getDumpsters(currentStatus)

  // Count by status
  const allDumpsters = await getDumpsters()
  const statusCounts = allDumpsters.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dumpsters</h1>
        <DumpsterForm sizes={SIZE_OPTIONS} />
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{statusCounts['available'] || 0}</div>
          <div className="text-sm text-gray-500">Available</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{statusCounts['reserved'] || 0}</div>
          <div className="text-sm text-gray-500">Reserved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts['dropped'] || 0}</div>
          <div className="text-sm text-gray-500">Dropped</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{statusCounts['maintenance'] || 0}</div>
          <div className="text-sm text-gray-500">Maintenance</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-600">{statusCounts['retired'] || 0}</div>
          <div className="text-sm text-gray-500">Retired</div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/dumpsters${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
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

      {/* Dumpsters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dumpsters.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No dumpsters found
          </div>
        ) : (
          dumpsters.map((dumpster) => (
            <div key={dumpster.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary-green font-bold">{dumpster.size}Y</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Unit #{dumpster.unit_number}</h3>
                    <p className="text-sm text-gray-500">{dumpster.size} Yard</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(dumpster.status)}`}>
                  {dumpster.status.toUpperCase()}
                </span>
              </div>

              {dumpster.current_booking && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Assigned to: {dumpster.current_booking.customer?.name || 'Unknown'}
                  </p>
                  <Link
                    href={`/admin/bookings/${dumpster.current_booking.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View Booking
                  </Link>
                </div>
              )}

              {dumpster.notes && (
                <p className="text-sm text-gray-600 mb-4">{dumpster.notes}</p>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/admin/dumpsters/${dumpster.id}`}
                  className="flex-1 text-center py-2 text-sm font-medium text-primary-green hover:text-primary-dark-green border border-primary-green rounded-lg hover:bg-primary-green/5 transition"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
