import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { RequestActions } from './RequestActions'

interface PageProps {
  params: Promise<{ id: string }>
}

interface PricingSnapshot {
  base_price: number
  delivery_fee: number
  haul_fee: number
  included_days: number
  extra_day_fee: number
  included_tons: number
  overage_per_ton: number
  rental_days: number
  extra_days: number
  extended_service_fee: number
  subtotal: number
  taxable_amount: number
  tax_rate: number
  tax_amount: number
  processing_fee: number
  total: number
  dumpster_size: number
  waste_type: string
  tax_exempt: boolean
}

interface LineItem {
  id: string
  label: string
  amount: number
  sort_order: number
}

async function getBookingRequest(id: string) {
  const adminClient = createAdminClient()

  const { data: request } = await adminClient
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
        address:addresses(id, full_address, street, city, state, zip, lat, lng),
        line_items:quote_line_items(id, label, amount, sort_order)
      )
    `)
    .eq('id', id)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .single()

  return request
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'declined':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'modified_awaiting_customer':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  household_trash: 'Household Trash',
  construction_debris: 'Construction Debris',
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const request = await getBookingRequest(id)

  if (!request) {
    notFound()
  }

  // Type assertion for the request object
  const typedRequest = request as {
    id: string
    status: string
    customer_inputs: unknown
    created_at: string
    customer: { id: string; name: string; email: string; phone: string } | null
    quote: {
      id: string
      dumpster_size: number
      waste_type: string
      dropoff_date: string
      pickup_date: string
      pricing_snapshot: PricingSnapshot | null
      address: { id: string; full_address: string; street: string; city: string; state: string; zip: string; lat: number; lng: number } | null
      line_items: LineItem[]
    } | null
  }

  const customer = typedRequest.customer
  const quote = typedRequest.quote
  const customerInputs = typedRequest.customer_inputs as {
    contactName?: string
    contactPhone?: string
    contactEmail?: string
    instructions?: string
    gateInfo?: { hasGate: boolean; gateCode?: string }
  } | null

  const lineItems = quote?.line_items?.sort((a, b) => a.sort_order - b.sort_order) || []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/requests"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Booking Request</h1>
            <p className="text-sm text-gray-500">
              Received {formatDateTime(typedRequest.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {quote && (
            <a
              href={`/api/admin/quotes/${quote.id}/pdf`}
              className="px-4 py-2 text-sm font-medium text-primary-green border border-primary-green rounded-lg hover:bg-primary-green/5 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Quote PDF
            </a>
          )}
          <span className={`px-4 py-2 text-sm font-medium rounded-lg border ${getStatusBadgeClass(typedRequest.status)}`}>
            {typedRequest.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{customer?.name || customerInputs?.contactName || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{customer?.email || customerInputs?.contactEmail || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{customer?.phone || customerInputs?.contactPhone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <p className="font-medium text-lg">{quote?.address?.full_address || '-'}</p>
            {quote?.address && (
              <div className="mt-2 text-sm text-gray-500">
                {quote.address.street && <span>{quote.address.street}, </span>}
                {quote.address.city}, {quote.address.state} {quote.address.zip}
              </div>
            )}
          </div>

          {/* Rental Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Rental Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Dumpster Size</label>
                <p className="font-medium text-lg">{quote?.dumpster_size} Yard</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Waste Type</label>
                <p className="font-medium">{quote?.waste_type ? WASTE_TYPE_LABELS[quote.waste_type] : '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Delivery Date</label>
                <p className="font-medium">{quote?.dropoff_date ? formatDate(quote.dropoff_date) : '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Pickup Date</label>
                <p className="font-medium">{quote?.pickup_date ? formatDate(quote.pickup_date) : '-'}</p>
              </div>
              {quote?.pricing_snapshot && (
                <>
                  <div>
                    <label className="text-sm text-gray-500">Rental Days</label>
                    <p className="font-medium">{quote.pricing_snapshot.rental_days} days</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Included Weight</label>
                    <p className="font-medium">{quote.pricing_snapshot.included_tons} ton(s)</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          {(customerInputs?.instructions || customerInputs?.gateInfo?.hasGate) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Special Instructions</h2>
              {customerInputs.instructions && (
                <div className="mb-4">
                  <label className="text-sm text-gray-500">Delivery Instructions</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{customerInputs.instructions}</p>
                </div>
              )}
              {customerInputs.gateInfo?.hasGate && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800">Gate/Restricted Access</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Code: {customerInputs.gateInfo.gateCode || 'Not provided'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Pricing & Actions */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing Summary</h2>
            <div className="space-y-2">
              {lineItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{formatCents(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-accent-orange">
                  {quote?.pricing_snapshot?.total
                    ? formatCents(quote.pricing_snapshot.total)
                    : '-'}
                </span>
              </div>
            </div>
            {quote?.pricing_snapshot && (
              <p className="text-xs text-gray-500 mt-2">
                Overage rate: {formatCents(quote.pricing_snapshot.overage_per_ton)}/ton
              </p>
            )}
          </div>

          {/* Actions */}
          {typedRequest.status === 'pending' && (
            <RequestActions
              requestId={typedRequest.id}
              quoteId={quote?.id || ''}
              customerId={customer?.id || ''}
            />
          )}

          {typedRequest.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Request Approved</p>
              <p className="text-sm text-green-700 mt-1">
                Payment link has been sent to the customer.
              </p>
            </div>
          )}

          {typedRequest.status === 'declined' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Request Declined</p>
              <p className="text-sm text-red-700 mt-1">
                The customer has been notified.
              </p>
            </div>
          )}

          {typedRequest.status === 'modified_awaiting_customer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Awaiting Customer</p>
              <p className="text-sm text-blue-700 mt-1">
                Waiting for customer to accept the modifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
