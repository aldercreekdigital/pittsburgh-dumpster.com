import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface Invoice {
  id: string
  invoice_number: string
  status: string
  issued_at: string | null
  subtotal: number
  total: number
  created_at: string
  customer: { name: string; email: string } | null
  booking: { id: string; status: string } | null
}

async function getInvoices(status?: string) {
  const adminClient = createAdminClient()

  let query = adminClient
    .from('invoices')
    .select(`
      id,
      invoice_number,
      status,
      issued_at,
      subtotal,
      total,
      created_at,
      customer:customers(name, email),
      booking:bookings(id, status)
    `)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: invoices } = await query

  return (invoices || []) as Invoice[]
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
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
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-800'
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'void':
      return 'bg-gray-100 text-gray-800'
    case 'refunded':
      return 'bg-red-100 text-red-800'
    case 'partial':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
  { value: 'refunded', label: 'Refunded' },
]

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const currentStatus = status || 'all'
  const invoices = await getInvoices(currentStatus)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Invoices</h1>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/invoices${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              currentStatus === filter.value
                ? 'bg-primary-dark-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No invoices found
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/admin/invoices/${invoice.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        #{invoice.invoice_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.customer?.name || '-'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {formatDate(invoice.issued_at || invoice.created_at)}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCents(invoice.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking
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
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{invoice.invoice_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customer?.name || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.customer?.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCents(invoice.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatDate(invoice.issued_at || invoice.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.booking ? (
                          <Link
                            href={`/admin/bookings/${invoice.booking.id}`}
                            className="text-sm text-primary-green hover:text-primary-dark-green"
                          >
                            View Booking
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="text-primary-green hover:text-primary-dark-green font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
