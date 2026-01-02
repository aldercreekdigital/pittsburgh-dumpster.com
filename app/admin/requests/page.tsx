import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

async function getBookingRequests(statusFilter?: string) {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('booking_requests')
    .select(`
      id,
      status,
      customer_inputs,
      created_at,
      customer:customers(id, name, email, phone),
      quote:quotes(
        id,
        dumpster_size,
        waste_type,
        dropoff_date,
        pickup_date,
        pricing_snapshot,
        address:addresses(full_address)
      )
    `)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data } = await query

  return data || []
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
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

const WASTE_TYPE_LABELS: Record<string, string> = {
  household_trash: 'Household',
  construction_debris: 'Construction',
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'modified_awaiting_customer', label: 'Awaiting' },
]

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = params.status || 'all'
  const requests = await getBookingRequests(statusFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Booking Requests</h1>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow mb-4 md:mb-6">
        <div className="px-3 md:px-4 py-3 flex gap-2 overflow-x-auto">
          {STATUS_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/admin/requests${option.value !== 'all' ? `?status=${option.value}` : ''}`}
              className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                statusFilter === option.value
                  ? 'bg-primary-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Requests */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No booking requests found
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {requests.map((request: any) => {
                const customer = request.customer as { id: string; name: string; email: string; phone: string } | null
                const quote = request.quote as {
                  id: string
                  dumpster_size: number
                  waste_type: string
                  dropoff_date: string
                  pickup_date: string
                  pricing_snapshot: { total: number } | null
                  address: { full_address: string } | null
                } | null

                return (
                  <Link
                    key={request.id}
                    href={`/admin/requests/${request.id}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {customer?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {quote?.address?.full_address || '-'}
                        </div>
                      </div>
                      <span className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(request.status)}`}>
                        {request.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>{quote?.dumpster_size} Yard</span>
                      <span>{quote?.waste_type ? WASTE_TYPE_LABELS[quote.waste_type] : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {quote?.dropoff_date ? formatDate(quote.dropoff_date) : '-'}
                      </span>
                      <span className="font-bold text-gray-900">
                        {quote?.pricing_snapshot?.total
                          ? formatCents(quote.pricing_snapshot.total)
                          : '-'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
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
                      Dates
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
                  {requests.map((request: any) => {
                    const customer = request.customer as { id: string; name: string; email: string; phone: string } | null
                    const quote = request.quote as {
                      id: string
                      dumpster_size: number
                      waste_type: string
                      dropoff_date: string
                      pickup_date: string
                      pricing_snapshot: { total: number } | null
                      address: { full_address: string } | null
                    } | null

                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer?.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer?.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={quote?.address?.full_address}>
                            {quote?.address?.full_address || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quote?.dumpster_size} Yard
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote?.waste_type ? WASTE_TYPE_LABELS[quote.waste_type] : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quote?.dropoff_date ? formatDate(quote.dropoff_date) : '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {quote?.pickup_date ? formatDate(quote.pickup_date) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {quote?.pricing_snapshot?.total
                              ? formatCents(quote.pricing_snapshot.total)
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(request.status)}`}>
                            {request.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(request.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/admin/requests/${request.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-primary-green text-primary-green rounded-lg text-sm font-medium hover:bg-primary-green hover:text-white transition"
                          >
                            {request.status === 'pending' ? 'Review' : 'View'}
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
