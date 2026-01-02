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

function CartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteToAdd = searchParams.get('quote')

  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check auth and load cart
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login with return URL
        const returnUrl = quoteToAdd ? `/cart?quote=${quoteToAdd}` : '/cart'
        router.push(`/login?next=${encodeURIComponent(returnUrl)}`)
        return
      }

      setIsAuthenticated(true)

      // Ensure customer exists
      await fetch('/api/customer/ensure', { method: 'POST' })

      // If we have a quote to add, add it first
      if (quoteToAdd) {
        try {
          const addResponse = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quoteId: quoteToAdd }),
          })
          const addData = await addResponse.json()
          if (!addData.ok) {
            setError(addData.error || 'Failed to add item to cart')
          }
        } catch (err) {
          console.error('Error adding to cart:', err)
        }

        // Remove quote param from URL
        router.replace('/cart')
      }

      // Load cart
      await loadCart()
    }

    init()
  }, [supabase, router, quoteToAdd])

  const loadCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()

      if (data.ok) {
        setItems(data.items || [])
        setCartId(data.cartId || null)
      } else {
        setError(data.error || 'Failed to load cart')
      }
    } catch (err) {
      console.error('Error loading cart:', err)
      setError('Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      const data = await response.json()

      if (data.ok) {
        setItems(items.filter(item => item.id !== itemId))
      } else {
        setError(data.error || 'Failed to remove item')
      }
    } catch (err) {
      console.error('Error removing item:', err)
    }
  }

  const total = items.reduce((sum, item) => sum + item.total, 0)

  if (!isAuthenticated && !isLoading) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white py-12">
        <div className="container-wide">
          <h1 className="text-white mb-2">Your Cart</h1>
          <p className="text-gray-300">
            Review your dumpster rental and proceed to checkout
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="section-padding bg-off-white">
        <div className="container-wide max-w-4xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="card-industrial p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Start by getting a quote for your dumpster rental</p>
              <Link href="/booking" className="btn-primary">
                Get a Quote
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              {items.map((item) => (
                <div key={item.id} className="card-industrial p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-primary-green text-white px-3 py-1 rounded-full text-sm font-bold">
                          {item.dumpsterSize} Yard
                        </span>
                        <span className="text-gray-600 text-sm">
                          {WASTE_TYPE_LABELS[item.wasteType] || item.wasteType}
                        </span>
                      </div>

                      <p className="text-gray-900 font-medium mb-1">{item.address}</p>

                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Delivery: {formatDate(item.dropoffDate)}</span>
                        <span>Pickup: {formatDate(item.pickupDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent-orange">
                          {formatCents(item.total)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        title="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="card-industrial p-6 bg-gray-50">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>

                <div className="flex justify-between items-center text-lg mb-4">
                  <span>Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span>
                  <span className="font-bold">{formatCents(total)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total Due Today</span>
                    <span className="text-2xl font-bold text-accent-orange">{formatCents(total)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Payment collected after booking approval
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking" className="btn-secondary text-center flex-1">
                  Add Another Dumpster
                </Link>
                <Link
                  href={`/checkout?cart=${cartId}`}
                  className="btn-primary text-center flex-1 text-lg py-4"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function CartLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your cart...</p>
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartContent />
    </Suspense>
  )
}
