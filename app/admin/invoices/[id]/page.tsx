import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ id: string }>
}

interface LineItem {
  id: string
  label: string
  quantity: number
  unit_price: number
  amount: number
  line_type: string
}

interface InvoiceData {
  id: string
  invoice_number: string
  status: string
  issued_at: string | null
  subtotal: number
  total: number
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
  customer: { id: string; name: string; email: string; phone: string } | null
  booking: { id: string; status: string } | null
  booking_request: { id: string } | null
  line_items: LineItem[]
  payments: { id: string; amount: number; status: string; created_at: string; receipt_url: string | null }[]
}

async function getInvoice(id: string) {
  const adminClient = createAdminClient()

  const { data: invoice } = await adminClient
    .from('invoices')
    .select(`
      id,
      invoice_number,
      status,
      issued_at,
      subtotal,
      total,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      created_at,
      customer:customers(id, name, email, phone),
      booking:bookings(id, status),
      booking_request:booking_requests(id),
      line_items:invoice_line_items(id, label, quantity, unit_price, amount, line_type),
      payments(id, amount, status, created_at, receipt_url)
    `)
    .eq('id', id)
    .eq('business_id', DEFAULT_BUSINESS_ID)
    .single()

  return invoice as InvoiceData | null
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
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
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'void':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'refunded':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'partial':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    notFound()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/invoices"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
            <p className="text-sm text-gray-500">
              Created {formatDateTime(invoice.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/admin/invoices/${invoice.id}/pdf`}
            className="px-4 py-2 text-sm font-medium text-primary-green border border-primary-green rounded-lg hover:bg-primary-green/5 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
          <span className={`px-4 py-2 text-sm font-medium rounded-lg border ${getStatusBadgeClass(invoice.status)}`}>
            {invoice.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{invoice.customer?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{invoice.customer?.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{invoice.customer?.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Line Items</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-medium text-gray-500 pb-2">Description</th>
                  <th className="text-right text-sm font-medium text-gray-500 pb-2">Qty</th>
                  <th className="text-right text-sm font-medium text-gray-500 pb-2">Unit Price</th>
                  <th className="text-right text-sm font-medium text-gray-500 pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 text-sm">{item.label}</td>
                    <td className="py-3 text-sm text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-right">{formatCents(item.unit_price)}</td>
                    <td className="py-3 text-sm text-right font-medium">{formatCents(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2">
                  <td colSpan={3} className="py-3 text-right font-semibold">Total</td>
                  <td className="py-3 text-right text-lg font-bold text-accent-orange">
                    {formatCents(invoice.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payments */}
          {invoice.payments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Payments</h2>
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{formatCents(payment.amount)}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(payment.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                      {payment.receipt_url && (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-green hover:text-primary-dark-green"
                        >
                          Receipt
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCents(invoice.subtotal)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-accent-orange">
                    {formatCents(invoice.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Related</h2>
            <div className="space-y-3">
              {invoice.booking && (
                <Link
                  href={`/admin/bookings/${invoice.booking.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="text-sm font-medium">View Booking</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              {invoice.booking_request && (
                <Link
                  href={`/admin/requests/${invoice.booking_request.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="text-sm font-medium">View Request</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Stripe Info */}
          {(invoice.stripe_checkout_session_id || invoice.stripe_payment_intent_id) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Stripe</h2>
              <div className="space-y-2 text-sm">
                {invoice.stripe_payment_intent_id && (
                  <div>
                    <label className="text-gray-500">Payment Intent</label>
                    <p className="font-mono text-xs truncate">{invoice.stripe_payment_intent_id}</p>
                  </div>
                )}
                {invoice.stripe_checkout_session_id && (
                  <div>
                    <label className="text-gray-500">Checkout Session</label>
                    <p className="font-mono text-xs truncate">{invoice.stripe_checkout_session_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
