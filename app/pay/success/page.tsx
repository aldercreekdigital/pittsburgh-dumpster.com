'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

interface InvoiceData {
  id: string
  invoice_number: string
  total: number
  booking_request: {
    quote: {
      dumpster_size: number
      dropoff_date: string
      pickup_date: string
      address: {
        full_address: string
      }
    }
  }
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

function SuccessContent() {
  const searchParams = useSearchParams()
  const invoiceId = searchParams.get('invoice')

  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false)
      return
    }

    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`)
        if (res.ok) {
          const data = await res.json()
          setInvoice(data.invoice)
        }
      } catch {
        // Ignore errors - we'll show a generic success message
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin" />
      </div>
    )
  }

  const quote = invoice?.booking_request?.quote

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Thank you for your order. Your dumpster rental is now confirmed.</p>
      </div>

      {invoice && (
        <div className="card-industrial p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Booking Confirmation</h2>
          <p className="text-sm text-gray-500 mb-4">Invoice #{invoice.invoice_number}</p>

          {quote && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Dumpster Size</span>
                <span className="font-medium">{quote.dumpster_size} Yard</span>
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
                <span className="text-gray-600">Delivery Address</span>
                <span className="font-medium text-right">{quote.address?.full_address}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Amount Paid</span>
                  <span className="font-bold text-accent-orange">{formatCents(invoice.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card-industrial p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
        <ul className="text-blue-800 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>You&apos;ll receive a confirmation email with your booking details</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Our team will deliver your dumpster on the scheduled date</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Questions? Call us at <strong>412-965-2791</strong></span>
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  )
}

export default function PaySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
