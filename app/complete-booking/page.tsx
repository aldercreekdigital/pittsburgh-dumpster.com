'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { decodeBookingData } from '@/lib/booking/stash'

function CompleteBookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const hasStarted = useRef(false) // Prevent duplicate calls from Strict Mode

  useEffect(() => {
    async function completeBooking() {
      // Prevent duplicate execution (React Strict Mode runs effects twice)
      if (hasStarted.current) return
      hasStarted.current = true

      const encodedData = searchParams.get('data')

      if (!encodedData) {
        setError('No booking data found. Please start your booking again.')
        setIsProcessing(false)
        return
      }

      const bookingData = decodeBookingData(encodedData)

      if (!bookingData || !bookingData.address || !bookingData.quote) {
        setError('Invalid booking data. Please start your booking again.')
        setIsProcessing(false)
        return
      }

      try {
        const response = await fetch('/api/booking/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        })

        const data = await response.json()

        if (!data.ok) {
          if (response.status === 401) {
            // Not authenticated - redirect to login with data preserved
            router.push(`/login?next=/complete-booking&data=${encodedData}`)
            return
          }
          setError(data.error || 'Failed to complete booking')
          setIsProcessing(false)
          return
        }

        // Success - redirect to cart
        router.push('/cart')
      } catch (err) {
        console.error('Error completing booking:', err)
        setError('Unable to complete booking. Please try again.')
        setIsProcessing(false)
      }
    }

    completeBooking()
  }, [searchParams, router])

  if (isProcessing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Completing Your Booking</h1>
          <p className="text-gray-600">Please wait while we add your dumpster to the cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/booking" className="btn-primary">
            Start New Booking
          </Link>
        </div>
      </div>
    )
  }

  return null
}

function CompleteBookingLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin" />
    </div>
  )
}

export default function CompleteBookingPage() {
  return (
    <Suspense fallback={<CompleteBookingLoading />}>
      <CompleteBookingContent />
    </Suspense>
  )
}
