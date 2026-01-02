'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface InvoiceData {
  id: string
  invoice_number: string
  status: string
  total: number
  customer: {
    name: string
    email: string
  }
  booking_request: {
    quote: {
      dumpster_size: number
      waste_type: string
      dropoff_date: string
      pickup_date: string
      address: {
        full_address: string
      }
    }
  }
  line_items: {
    id: string
    label: string
    amount: number
  }[]
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

const WASTE_TYPE_LABELS: Record<string, string> = {
  household_trash: 'Household Trash',
  construction_debris: 'Construction Debris',
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const invoiceId = searchParams.get('invoice')

  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!invoiceId) {
      setError('No invoice specified')
      setLoading(false)
      return
    }

    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Invoice not found')
        }
        const data = await res.json()
        setInvoice(data.invoice)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  const handlePayment = async () => {
    if (!invoice) return

    setProcessing(true)
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const data = await res.json()

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">The invoice you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  if (invoice.status === 'paid') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Paid</h1>
          <p className="text-gray-600">This invoice has already been paid. Thank you!</p>
        </div>
      </div>
    )
  }

  const quote = invoice.booking_request?.quote

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
        <p className="text-gray-600 mt-2">Invoice #{invoice.invoice_number}</p>
      </div>

      <div className="card-industrial p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        {quote && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Service</span>
              <span className="font-medium">{quote.dumpster_size} Yard Dumpster</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Waste Type</span>
              <span className="font-medium">{WASTE_TYPE_LABELS[quote.waste_type] || quote.waste_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Date</span>
              <span className="font-medium">{formatDate(quote.dropoff_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup Date</span>
              <span className="font-medium">{formatDate(quote.pickup_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address</span>
              <span className="font-medium text-right">{quote.address?.full_address}</span>
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          {invoice.line_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium">{formatCents(item.amount)}</span>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total Due</span>
            <span className="text-3xl font-bold text-accent-orange">{formatCents(invoice.total)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={processing}
        className={`w-full btn-primary py-4 text-lg ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          `Pay ${formatCents(invoice.total)}`
        )}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Secure payment processing. Your card will be charged immediately.
      </p>
    </div>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
