'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface CartItem {
  id: string
  quoteId: string
  wasteType: string
  dumpsterSize: number
  dropoffDate: string
  pickupDate: string
  total: number
  address: string
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  household_trash: 'Household Trash',
  construction_debris: 'Construction Debris',
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

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cartIdParam = searchParams.get('cart')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [instructions, setInstructions] = useState('')
  const [hasGate, setHasGate] = useState(false)
  const [gateCode, setGateCode] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?next=/cart')
        return
      }

      // Pre-fill email from auth
      setContactEmail(user.email || '')
      setContactName(user.user_metadata?.full_name || '')
      setContactPhone(user.user_metadata?.phone || '')

      // Load cart
      const response = await fetch('/api/cart')
      const data = await response.json()

      if (data.ok && data.items?.length > 0) {
        setItems(data.items)
      } else {
        // No items, redirect to cart
        router.push('/cart')
        return
      }

      setIsLoading(false)
    }

    init()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/booking-request/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cartIdParam,
          contactName,
          contactPhone,
          contactEmail,
          instructions,
          gateInfo: hasGate ? { hasGate: true, gateCode } : { hasGate: false },
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        setError(data.error || 'Failed to submit booking request')
        return
      }

      // Redirect to success page
      router.push(`/booking-request/success?id=${data.bookingRequestId}`)

    } catch (err) {
      console.error('Checkout error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.total, 0)

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white py-12">
        <div className="container-wide">
          <h1 className="text-white mb-2">Checkout</h1>
          <p className="text-gray-300">
            Complete your booking request
          </p>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="card-industrial p-6">
                  <h2 className="text-xl font-bold mb-6">Contact Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="contactName"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                      />
                    </div>

                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        id="contactPhone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Instructions */}
                <div className="card-industrial p-6">
                  <h2 className="text-xl font-bold mb-6">Delivery Instructions</h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions (optional)
                      </label>
                      <textarea
                        id="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={3}
                        placeholder="E.g., Place dumpster in driveway on left side of house..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasGate}
                          onChange={(e) => setHasGate(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                        />
                        <span className="text-gray-700">Property has a gate or restricted access</span>
                      </label>

                      {hasGate && (
                        <div className="mt-4 ml-8">
                          <label htmlFor="gateCode" className="block text-sm font-medium text-gray-700 mb-2">
                            Gate Code or Access Instructions *
                          </label>
                          <input
                            id="gateCode"
                            type="text"
                            value={gateCode}
                            onChange={(e) => setGateCode(e.target.value)}
                            required={hasGate}
                            placeholder="Enter gate code or call instructions"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="card-industrial p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-green focus:ring-primary-green"
                    />
                    <span className="text-gray-700 text-sm">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary-green underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-green underline">
                        Privacy Policy
                      </Link>
                      . I understand that payment will be collected after my booking is approved.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !acceptedTerms}
                  className={`w-full btn-primary text-lg py-4 ${
                    (isSubmitting || !acceptedTerms) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Booking Request'
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  You won&apos;t be charged until your booking is approved
                </p>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-industrial p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="border-b pb-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{item.dumpsterSize} Yard Dumpster</span>
                        <span className="font-bold">{formatCents(item.total)}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {WASTE_TYPE_LABELS[item.wasteType]}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(item.dropoffDate)} - {formatDate(item.pickupDate)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 truncate" title={item.address}>
                        {item.address}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-accent-orange">
                      {formatCents(total)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>What happens next?</strong>
                  </p>
                  <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>We&apos;ll review your request</li>
                    <li>You&apos;ll receive an email to confirm & pay</li>
                    <li>We&apos;ll deliver on your scheduled date</li>
                  </ol>
                </div>

                <Link href="/cart" className="block mt-4 text-center text-primary-green text-sm hover:underline">
                  &larr; Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function CheckoutLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}
