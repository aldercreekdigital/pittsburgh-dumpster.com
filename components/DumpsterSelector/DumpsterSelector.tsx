'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { calculatePricing, parseDate, type PricingRule as PricingRuleEngine, type PricingResult } from '@/lib/pricing/engine'
import { encodeBookingData, type StashedAddress, type StashedBookingData } from '@/lib/booking/stash'

interface PricingRule {
  id: string
  waste_type: string
  dumpster_size: number
  base_price: number
  delivery_fee: number
  haul_fee: number
  included_days: number
  extra_day_fee: number
  included_tons: number
  overage_per_ton: number
  public_notes: string | null
}

interface DumpsterSelectorProps {
  stashedAddress: StashedAddress
}

const WASTE_TYPES = [
  { value: 'household_trash', label: 'Household Trash', description: 'Home cleanouts, furniture, general debris' },
  { value: 'construction_debris', label: 'Construction Debris', description: 'Renovation waste, drywall, wood, roofing' },
]

const SIZE_DESCRIPTIONS: Record<number, { name: string; capacity: string; dimensions: string }> = {
  10: { name: '10 Yard', capacity: '~3 pickup truck loads', dimensions: "12' L × 8' W × 4' H" },
  15: { name: '15 Yard', capacity: '~4-5 pickup truck loads', dimensions: "16' L × 8' W × 4' H" },
  20: { name: '20 Yard', capacity: '~6-7 pickup truck loads', dimensions: "22' L × 8' W × 4' H" },
  30: { name: '30 Yard', capacity: '~9-10 pickup truck loads', dimensions: "22' L × 8' W × 6' H" },
  40: { name: '40 Yard', capacity: '~12-14 pickup truck loads', dimensions: "22' L × 8' W × 8' H" },
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function getTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

function getDefaultPickupDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 4) // 3 days rental + 1 for tomorrow
  return date.toISOString().split('T')[0]
}

export function DumpsterSelector({ stashedAddress }: DumpsterSelectorProps) {
  const router = useRouter()
  const [rules, setRules] = useState<PricingRule[]>([])
  const [isLoadingRules, setIsLoadingRules] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [wasteType, setWasteType] = useState<string>('household_trash')
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [dropoffDate, setDropoffDate] = useState<string>(getTomorrowDate())
  const [pickupDate, setPickupDate] = useState<string>(getDefaultPickupDate())

  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [supabase.auth])

  // Fetch pricing rules
  useEffect(() => {
    async function fetchRules() {
      try {
        const response = await fetch('/api/pricing-rules')
        const data = await response.json()
        if (data.ok) {
          setRules(data.rules)
          // Auto-select first available size
          if (data.rules.length > 0) {
            const sizeSet = new Set<number>(data.rules.map((r: PricingRule) => r.dumpster_size))
            const sizes = Array.from(sizeSet).sort((a, b) => a - b)
            if (sizes.length > 0) {
              setSelectedSize(sizes[0])
            }
          }
        }
      } catch (err) {
        console.error('Error fetching pricing rules:', err)
        setError('Unable to load pricing. Please refresh the page.')
      } finally {
        setIsLoadingRules(false)
      }
    }
    fetchRules()
  }, [])

  // Get current rule
  const currentRule = useMemo(() => {
    return rules.find(r => r.waste_type === wasteType && r.dumpster_size === selectedSize)
  }, [rules, wasteType, selectedSize])

  // Calculate pricing client-side
  const pricing = useMemo((): PricingResult | null => {
    if (!currentRule || !dropoffDate || !pickupDate) return null

    try {
      const engineRule: PricingRuleEngine = {
        base_price: currentRule.base_price,
        delivery_fee: currentRule.delivery_fee,
        haul_fee: currentRule.haul_fee,
        included_days: currentRule.included_days,
        extra_day_fee: currentRule.extra_day_fee,
        included_tons: currentRule.included_tons,
        overage_per_ton: currentRule.overage_per_ton,
        dumpster_size: currentRule.dumpster_size,
        waste_type: currentRule.waste_type,
        public_notes: currentRule.public_notes,
      }

      return calculatePricing(
        engineRule,
        parseDate(dropoffDate),
        parseDate(pickupDate)
      )
    } catch (err) {
      console.error('Error calculating pricing:', err)
      return null
    }
  }, [currentRule, dropoffDate, pickupDate])

  // Get available sizes for selected waste type
  const availableSizes = rules
    .filter(r => r.waste_type === wasteType)
    .map(r => r.dumpster_size)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b)

  const handleAddToCart = useCallback(async () => {
    if (!pricing || !selectedSize) return

    setIsAddingToCart(true)
    setError(null)

    // Build complete booking data
    const bookingData: StashedBookingData = {
      address: stashedAddress,
      quote: {
        wasteType,
        dumpsterSize: selectedSize,
        dropoffDate,
        pickupDate,
      },
    }

    if (isLoggedIn) {
      // User is logged in - create everything in the database
      try {
        const response = await fetch('/api/booking/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        })

        const data = await response.json()

        if (!data.ok) {
          setError(data.error || 'Failed to add to cart')
          return
        }

        // Redirect to cart
        router.push('/cart')
      } catch (err) {
        console.error('Error adding to cart:', err)
        setError('Unable to add to cart. Please try again.')
      } finally {
        setIsAddingToCart(false)
      }
    } else {
      // User not logged in - encode data and redirect to login
      const encoded = encodeBookingData(bookingData)
      router.push(`/login?next=/complete-booking&data=${encoded}`)
    }
  }, [pricing, selectedSize, stashedAddress, wasteType, dropoffDate, pickupDate, isLoggedIn, router])

  if (isLoadingRules) {
    return (
      <div className="card-industrial p-8 text-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading pricing options...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Address Confirmation */}
      <div className="card-industrial p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl mb-0">Delivery Address</h2>
            <p className="text-gray-600">{stashedAddress.fullAddress}</p>
          </div>
        </div>
      </div>

      {/* Step 2: Waste Type */}
      <div className="card-industrial p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <div>
            <h2 className="text-xl mb-0">What type of waste?</h2>
            <p className="text-gray-600 text-sm">Select the type of material you&apos;ll be disposing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WASTE_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setWasteType(type.value)}
              className={`p-4 rounded-lg border-2 text-left transition ${
                wasteType === type.value
                  ? 'border-primary-green bg-primary-green/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Dumpster Size */}
      <div className="card-industrial p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center text-white font-bold">
            3
          </div>
          <div>
            <h2 className="text-xl mb-0">Choose your dumpster size</h2>
            <p className="text-gray-600 text-sm">Select the size that fits your project</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableSizes.map(size => {
            const rule = rules.find(r => r.waste_type === wasteType && r.dumpster_size === size)
            const sizeInfo = SIZE_DESCRIPTIONS[size]
            if (!rule || !sizeInfo) return null

            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  selectedSize === size
                    ? 'border-primary-green bg-primary-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-2xl text-primary-dark-green mb-1">
                  {sizeInfo.name}
                </div>
                <div className="text-sm text-gray-500 mb-2">{sizeInfo.dimensions}</div>
                <div className="text-sm text-gray-600 mb-3">{sizeInfo.capacity}</div>
                <div className="text-lg font-bold text-accent-orange">
                  {formatCents(rule.base_price)}
                </div>
                <div className="text-xs text-gray-500">
                  {rule.included_days} days included • {rule.included_tons} ton{rule.included_tons > 1 ? 's' : ''} included
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 4: Dates */}
      <div className="card-industrial p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center text-white font-bold">
            4
          </div>
          <div>
            <h2 className="text-xl mb-0">Select your dates</h2>
            <p className="text-gray-600 text-sm">When do you need the dumpster?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Date
            </label>
            <input
              type="date"
              value={dropoffDate}
              min={getTomorrowDate()}
              onChange={e => setDropoffDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              min={dropoffDate}
              onChange={e => setPickupDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
            />
          </div>
        </div>

        {currentRule && pricing && pricing.snapshot.extra_days > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your rental is {pricing.snapshot.rental_days} days.
              {currentRule.included_days} days are included, so you&apos;ll have {pricing.snapshot.extra_days} extra day{pricing.snapshot.extra_days > 1 ? 's' : ''} at {formatCents(currentRule.extra_day_fee)}/day.
            </p>
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      {pricing && (
        <div className="card-industrial p-6 bg-gray-50">
          <h3 className="text-lg font-bold mb-4">Price Summary</h3>

          <div className="space-y-2 mb-4">
            {pricing.lineItems.map((item, index) => (
              <div key={index} className="flex justify-between text-gray-700">
                <span>{item.label}</span>
                <span>{formatCents(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-xl font-bold">Total</span>
            <span className="text-2xl font-bold text-accent-orange">
              {formatCents(pricing.snapshot.total)}
            </span>
          </div>

          {currentRule && (
            <p className="text-xs text-gray-500 mt-2">
              Includes {currentRule.included_tons} ton{currentRule.included_tons > 1 ? 's' : ''} of disposal.
              Additional weight: {formatCents(currentRule.overage_per_ton)}/ton
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleAddToCart}
          disabled={!pricing || isAddingToCart}
          className={`
            flex-1 btn-primary text-lg py-4
            ${(!pricing || isAddingToCart) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding to cart...
            </span>
          ) : pricing ? (
            isLoggedIn === false ? (
              `Sign in to Add to Cart - ${formatCents(pricing.snapshot.total)}`
            ) : (
              `Add to Cart - ${formatCents(pricing.snapshot.total)}`
            )
          ) : (
            'Select options to continue'
          )}
        </button>
      </div>
    </div>
  )
}
