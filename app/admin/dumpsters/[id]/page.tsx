import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { DumpsterEditForm } from './DumpsterEditForm'

interface PageProps {
  params: Promise<{ id: string }>
}

interface DumpsterData {
  id: string
  unit_number: string
  size: number
  type: string | null
  status: string
  notes: string | null
  created_at: string
}

interface BookingHistory {
  id: string
  status: string
  dropoff_scheduled_at: string | null
  pickup_due_at: string | null
  customer: { name: string } | null
}

async function getDumpster(id: string) {
  const adminClient = createAdminClient()

  const { data: dumpster } = await adminClient
    .from('dumpsters')
    .select('id, unit_number, size, type, status, notes, created_at')
    .eq('id', id)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .single()

  return dumpster as DumpsterData | null
}

async function getBookingHistory(dumpsterId: string) {
  const adminClient = createAdminClient()

  const { data: bookings } = await adminClient
    .from('bookings')
    .select('id, status, dropoff_scheduled_at, pickup_due_at, customer:customers(name)')
    .eq('dumpster_id', dumpsterId)
    .order('created_at', { ascending: false })
    .limit(10)

  return (bookings || []) as BookingHistory[]
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
    case 'available':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'reserved':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'dropped':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'maintenance':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'retired':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

function getBookingStatusBadgeClass(status: string): string {
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

const SIZE_OPTIONS = [10, 15, 20, 30, 40]
const STATUS_OPTIONS = ['available', 'reserved', 'dropped', 'maintenance', 'retired']

export default async function DumpsterDetailPage({ params }: PageProps) {
  const { id } = await params
  const dumpster = await getDumpster(id)

  if (!dumpster) {
    notFound()
  }

  const bookingHistory = await getBookingHistory(id)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dumpsters"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-green/10 rounded-lg flex items-center justify-center">
              <span className="text-primary-green font-bold text-xl">{dumpster.size}Y</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Unit #{dumpster.unit_number}</h1>
              <p className="text-sm text-gray-500">{dumpster.size} Yard Dumpster</p>
            </div>
          </div>
        </div>
        <span className={`px-4 py-2 text-sm font-medium rounded-lg border ${getStatusBadgeClass(dumpster.status)}`}>
          {dumpster.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2">
          <DumpsterEditForm
            dumpster={dumpster}
            sizes={SIZE_OPTIONS}
            statuses={STATUS_OPTIONS}
          />
        </div>

        {/* Sidebar - Booking History */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
            {bookingHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No booking history</p>
            ) : (
              <div className="space-y-3">
                {bookingHistory.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {booking.customer?.name || 'Unknown'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBookingStatusBadgeClass(booking.status)}`}>
                        {booking.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(booking.dropoff_scheduled_at)} - {formatDate(booking.pickup_due_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
