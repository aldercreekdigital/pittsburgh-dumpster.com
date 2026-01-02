'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AddressAutocomplete, type AddressSuggestion } from '@/components/AddressAutocomplete'
import { encodeBookingData, type StashedAddress } from '@/lib/booking/stash'

export default function BookingPage() {
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddressSelect = (address: AddressSuggestion) => {
    setSelectedAddress(address)
    setError(null)
  }

  const handleContinue = async () => {
    if (!selectedAddress) {
      setError('Please select an address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check serviceability (stateless - no DB write)
      const response = await fetch('/api/serviceability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        if (data.reason === 'not_serviceable') {
          setError(data.message)
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }

      // Build stashed address data
      const stashedAddress: StashedAddress = {
        fullAddress: selectedAddress.fullAddress,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
        lat: selectedAddress.lat,
        lng: selectedAddress.lng,
        placeId: selectedAddress.placeId,
      }

      // Encode and redirect to dumpster sizes page
      const encoded = encodeBookingData({ address: stashedAddress })
      router.push(`/dumpster-sizes?data=${encoded}`)
    } catch (err) {
      console.error('Error checking serviceability:', err)
      setError('Unable to connect. Please check your internet connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-4">Book Your Dumpster</h1>
            <p className="text-xl text-gray-300 mb-2">
              Fast, easy online booking. Enter your address to get started.
            </p>
            <p className="text-gray-400">
              We serve Western PA, Northern WV, and Eastern OH.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="section-padding bg-off-white">
        <div className="container-wide max-w-2xl">
          <div className="card-industrial p-8">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-xl mb-0">Where do you need the dumpster?</h2>
                  <p className="text-gray-600 text-sm">
                    Enter the delivery address for your dumpster
                  </p>
                </div>
              </div>

              <AddressAutocomplete
                onSelect={handleAddressSelect}
                placeholder="Start typing your address..."
                error={error || undefined}
                disabled={isLoading}
              />

              {selectedAddress && !error && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">Address Selected</p>
                      <p className="text-sm text-green-700">{selectedAddress.fullAddress}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleContinue}
                disabled={!selectedAddress || isLoading}
                className={`
                  flex-1 btn-primary text-lg py-4
                  ${(!selectedAddress || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  'Continue to Select Size'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-800">Unable to service this location</p>
                    <p className="text-sm text-red-700">{error}</p>
                    <p className="text-sm text-red-600 mt-2">
                      Questions? Call us at{' '}
                      <a href="tel:+14129652791" className="underline font-medium">
                        412-965-2791
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="card-industrial p-4 text-center">
              <div className="w-10 h-10 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1">Quick Delivery</h3>
              <p className="text-xs text-gray-600">Same-day delivery available</p>
            </div>

            <div className="card-industrial p-4 text-center">
              <div className="w-10 h-10 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1">Licensed & Insured</h3>
              <p className="text-xs text-gray-600">Fully covered for your protection</p>
            </div>

            <div className="card-industrial p-4 text-center">
              <div className="w-10 h-10 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1">No Hidden Fees</h3>
              <p className="text-xs text-gray-600">Transparent pricing always</p>
            </div>
          </div>

          {/* Already have a quote */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already know what you need?{' '}
              <Link href="/dumpster-sizes" className="text-accent-orange font-medium hover:underline">
                View our dumpster sizes
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
