import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { BookingActions } from './BookingActions'
import { DumpTickets } from './DumpTickets'

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

interface BookingData {
  id: string
  status: string
  dropoff_scheduled_at: string | null
  pickup_due_at: string | null
  dropped_at: string | null
  picked_up_at: string | null
  created_at: string
  pricing_snapshot: PricingSnapshot | null
  customer: { id: string; name: string; email: string; phone: string } | null
  address: { full_address: string; street: string; city: string; state: string; zip: string } | null
  dumpster: { id: string; unit_number: string; size: number } | null
  booking_request: {
    id: string
    customer_inputs: {
      instructions?: string
      gateInfo?: { hasGate: boolean; gateCode?: string }
    } | null
  } | null
}

interface DumpTicket {
  id: string
  facility: string
  ticket_number: string
  net_tons: number
  ticket_datetime: string
  created_at: string
}

interface Adjustment {
  id: string
  kind: string
  amount: number
  status: string
  notes: string | null
  created_at: string
}

async function getBooking(id: string) {
  const adminClient = createAdminClient()

  const { data: booking } = await adminClient
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
      customer:customers(id, name, email, phone),
      address:addresses(full_address, street, city, state, zip),
      dumpster:dumpsters(id, unit_number, size),
      booking_request:booking_requests(id, customer_inputs)
    `)
    .eq('id', id)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .single()

  return booking as BookingData | null
}

async function getAvailableDumpsters(size: number) {
  const adminClient = createAdminClient()

  const { data: dumpsters } = await adminClient
    .from('dumpsters')
    .select('id, unit_number, size')
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .eq('size', size)
    .eq('status', 'available')

  return dumpsters || []
}

async function getDumpTickets(bookingId: string): Promise<DumpTicket[]> {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('dump_tickets')
    .select('id, facility, ticket_number, net_tons, ticket_datetime, created_at')
    .eq('booking_id', bookingId)
    .order('ticket_datetime', { ascending: false })

  return (data || []) as DumpTicket[]
}

async function getAdjustments(bookingId: string): Promise<Adjustment[]> {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('adjustments')
    .select('id, kind, amount, status, notes, created_at')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })

  return (data || []) as Adjustment[]
}

async function hasPaymentMethod(customerId: string): Promise<boolean> {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('stripe_customers')
    .select('default_payment_method_id')
    .eq('customer_id', customerId)
    .single()

  const stripeCustomer = data as { default_payment_method_id: string | null } | null
  return !!stripeCustomer?.default_payment_method_id
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-US', {
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
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'scheduled':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'dropped':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'picked_up':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  household_trash: 'Household Trash',
  construction_debris: 'Construction Debris',
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params
  const booking = await getBooking(id)

  if (!booking) {
    notFound()
  }

  const availableDumpsters = booking.pricing_snapshot
    ? await getAvailableDumpsters(booking.pricing_snapshot.dumpster_size)
    : []

  const dumpTickets = await getDumpTickets(id)
  const adjustments = await getAdjustments(id)
  const customerHasPaymentMethod = booking.customer?.id
    ? await hasPaymentMethod(booking.customer.id)
    : false

  const customerInputs = booking.booking_request?.customer_inputs

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bookings"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <p className="text-sm text-gray-500">
              Created {formatDateTime(booking.created_at)}
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 text-sm font-medium rounded-lg border ${getStatusBadgeClass(booking.status)}`}>
          {booking.status.replace(/_/g, ' ').toUpperCase()}
        </span>
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
                <p className="font-medium">{booking.customer?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{booking.customer?.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{booking.customer?.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <p className="font-medium text-lg">{booking.address?.full_address || '-'}</p>
            {booking.address && (
              <div className="mt-2 text-sm text-gray-500">
                {booking.address.street && <span>{booking.address.street}, </span>}
                {booking.address.city}, {booking.address.state} {booking.address.zip}
              </div>
            )}
          </div>

          {/* Rental Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Rental Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Dumpster Size</label>
                <p className="font-medium text-lg">{booking.pricing_snapshot?.dumpster_size} Yard</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Waste Type</label>
                <p className="font-medium">
                  {booking.pricing_snapshot?.waste_type
                    ? WASTE_TYPE_LABELS[booking.pricing_snapshot.waste_type]
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Scheduled Drop-off</label>
                <p className="font-medium">{formatDate(booking.dropoff_scheduled_at)}</p>
                {booking.dropped_at && (
                  <p className="text-sm text-green-600">
                    Dropped: {formatDateTime(booking.dropped_at)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Scheduled Pick-up</label>
                <p className="font-medium">{formatDate(booking.pickup_due_at)}</p>
                {booking.picked_up_at && (
                  <p className="text-sm text-green-600">
                    Picked up: {formatDateTime(booking.picked_up_at)}
                  </p>
                )}
              </div>
              {booking.pricing_snapshot && (
                <>
                  <div>
                    <label className="text-sm text-gray-500">Rental Days</label>
                    <p className="font-medium">{booking.pricing_snapshot.rental_days} days</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Included Weight</label>
                    <p className="font-medium">{booking.pricing_snapshot.included_tons} ton(s)</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Assigned Dumpster */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Assigned Dumpster</h2>
            {booking.dumpster ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary-green font-bold">{booking.dumpster.size}Y</span>
                </div>
                <div>
                  <p className="font-medium">Unit #{booking.dumpster.unit_number}</p>
                  <p className="text-sm text-gray-500">{booking.dumpster.size} Yard Dumpster</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No dumpster assigned yet</p>
            )}
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

          {/* Dump Tickets & Adjustments - Show for picked_up or completed bookings */}
          {['picked_up', 'completed'].includes(booking.status) && booking.pricing_snapshot && booking.customer && (
            <DumpTickets
              bookingId={booking.id}
              customerId={booking.customer.id}
              includedTons={booking.pricing_snapshot.included_tons}
              overagePerTon={booking.pricing_snapshot.overage_per_ton}
              dumpTickets={dumpTickets}
              adjustments={adjustments}
              hasPaymentMethod={customerHasPaymentMethod}
            />
          )}
        </div>

        {/* Sidebar - Pricing & Actions */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing Summary</h2>
            {booking.pricing_snapshot && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Dumpster Rental ({booking.pricing_snapshot.included_days} days)</span>
                    <span className="font-medium">{formatCents(booking.pricing_snapshot.base_price)}</span>
                  </div>
                  {booking.pricing_snapshot.delivery_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">{formatCents(booking.pricing_snapshot.delivery_fee)}</span>
                    </div>
                  )}
                  {booking.pricing_snapshot.haul_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Disposal Fee</span>
                      <span className="font-medium">{formatCents(booking.pricing_snapshot.haul_fee)}</span>
                    </div>
                  )}
                  {booking.pricing_snapshot.extra_days > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Extended Service Days ({booking.pricing_snapshot.extra_days})</span>
                      <span className="font-medium">
                        {formatCents(booking.pricing_snapshot.extended_service_fee || booking.pricing_snapshot.extra_days * booking.pricing_snapshot.extra_day_fee)}
                      </span>
                    </div>
                  )}
                  {booking.pricing_snapshot.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">PA Sales Tax (7%)</span>
                      <span className="font-medium">{formatCents(booking.pricing_snapshot.tax_amount)}</span>
                    </div>
                  )}
                  {booking.pricing_snapshot.processing_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Card Processing Fee</span>
                      <span className="font-medium">{formatCents(booking.pricing_snapshot.processing_fee)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total Paid</span>
                    <span className="text-2xl font-bold text-accent-orange">
                      {formatCents(booking.pricing_snapshot.total)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Overage rate: {formatCents(booking.pricing_snapshot.overage_per_ton)}/ton
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <BookingActions
            bookingId={booking.id}
            currentStatus={booking.status}
            currentDumpsterId={booking.dumpster?.id}
            availableDumpsters={availableDumpsters}
          />
        </div>
      </div>
    </div>
  )
}
