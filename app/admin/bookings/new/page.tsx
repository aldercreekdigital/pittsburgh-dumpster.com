'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AddressAutocomplete, type AddressSuggestion } from '@/components/AddressAutocomplete'
import { calculatePricing, parseDate, type PricingRule as PricingRuleEngine, type PricingResult } from '@/lib/pricing/engine'

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

interface CustomerSearchResult {
  id: string
  name: string
  email: string
  phone: string | null
  user_id: string | null
}

const WASTE_TYPES = [
  { value: 'household_trash', label: 'Household Trash' },
  { value: 'construction_debris', label: 'Construction Debris' },
]

const SIZE_DESCRIPTIONS: Record<number, { name: string; capacity: string }> = {
  10: { name: '10 Yard', capacity: '~3 pickup truck loads' },
  15: { name: '15 Yard', capacity: '~4-5 pickup truck loads' },
  20: { name: '20 Yard', capacity: '~6-7 pickup truck loads' },
  30: { name: '30 Yard', capacity: '~9-10 pickup truck loads' },
  40: { name: '40 Yard', capacity: '~12-14 pickup truck loads' },
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
  date.setDate(date.getDate() + 4)
  return date.toISOString().split('T')[0]
}

export default function AdminNewBookingPage() {
  const router = useRouter()

  // Wizard state
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ invoiceNumber: string; customerHasAccount: boolean } | null>(null)

  // Step 1: Address
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null)
  const [isCheckingServiceability, setIsCheckingServiceability] = useState(false)
  const [isServiceable, setIsServiceable] = useState(false)

  // Step 2: Dumpster config
  const [rules, setRules] = useState<PricingRule[]>([])
  const [isLoadingRules, setIsLoadingRules] = useState(true)
  const [wasteType, setWasteType] = useState('household_trash')
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [dropoffDate, setDropoffDate] = useState(getTomorrowDate())
  const [pickupDate, setPickupDate] = useState(getDefaultPickupDate())

  // Step 3: Customer info
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [existingCustomer, setExistingCustomer] = useState<CustomerSearchResult | null>(null)
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)

  // Step 4: Notes
  const [notes, setNotes] = useState('')

  // Fetch pricing rules
  useEffect(() => {
    async function fetchRules() {
      try {
        const response = await fetch('/api/pricing-rules')
        const data = await response.json()
        if (data.ok) {
          setRules(data.rules)
          if (data.rules.length > 0) {
            const sizes = [...new Set(data.rules.map((r: PricingRule) => r.dumpster_size))].sort((a, b) => (a as number) - (b as number))
            if (sizes.length > 0) {
              setSelectedSize(sizes[0] as number)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching pricing rules:', err)
      } finally {
        setIsLoadingRules(false)
      }
    }
    fetchRules()
  }, [])

  // Get current rule and pricing
  const currentRule = useMemo(() => {
    return rules.find(r => r.waste_type === wasteType && r.dumpster_size === selectedSize)
  }, [rules, wasteType, selectedSize])

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

      return calculatePricing(engineRule, parseDate(dropoffDate), parseDate(pickupDate))
    } catch {
      return null
    }
  }, [currentRule, dropoffDate, pickupDate])

  const availableSizes = rules
    .filter(r => r.waste_type === wasteType)
    .map(r => r.dumpster_size)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b)

  // Handle address selection
  const handleAddressSelect = async (address: AddressSuggestion) => {
    setSelectedAddress(address)
    setIsServiceable(false)
    setError(null)
    setIsCheckingServiceability(true)

    try {
      const response = await fetch('/api/serviceability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: address.lat, lng: address.lng }),
      })

      const data = await response.json()

      if (data.ok) {
        setIsServiceable(true)
      } else {
        setError(data.message || 'Address is outside service area')
      }
    } catch (err) {
      console.error('Error checking serviceability:', err)
      setError('Failed to check serviceability')
    } finally {
      setIsCheckingServiceability(false)
    }
  }

  // Search for existing customer
  const handleCustomerEmailBlur = async () => {
    if (!customerEmail || !customerEmail.includes('@')) return

    setIsSearchingCustomer(true)
    setExistingCustomer(null)

    try {
      const response = await fetch(`/api/admin/customers/search?email=${encodeURIComponent(customerEmail)}`)
      const data = await response.json()

      if (data.ok && data.customer) {
        setExistingCustomer(data.customer)
        setCustomerName(data.customer.name || '')
        setCustomerPhone(data.customer.phone || '')
      }
    } catch (err) {
      console.error('Error searching customer:', err)
    } finally {
      setIsSearchingCustomer(false)
    }
  }

  // Submit booking
  const handleSubmit = async () => {
    if (!selectedAddress || !pricing || !customerEmail || !customerName) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            full_address: selectedAddress.fullAddress,
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zip: selectedAddress.zip,
            lat: selectedAddress.lat,
            lng: selectedAddress.lng,
            place_id: selectedAddress.placeId,
          },
          dumpster_size: selectedSize,
          waste_type: wasteType,
          dropoff_date: dropoffDate,
          pickup_date: pickupDate,
          customer: {
            name: customerName,
            email: customerEmail.toLowerCase(),
            phone: customerPhone,
          },
          notes,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setSuccess({
          invoiceNumber: data.invoiceNumber,
          customerHasAccount: data.customerHasAccount,
        })
      } else {
        setError(data.error || 'Failed to create booking')
      }
    } catch (err) {
      console.error('Error creating booking:', err)
      setError('Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Created!</h2>
          <p className="text-gray-600 mb-4">Invoice #{success.invoiceNumber}</p>

          {success.customerHasAccount ? (
            <p className="text-sm text-gray-500 mb-6">
              Payment link has been sent to the customer.
            </p>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              Registration invite has been sent to the customer. They will be able to complete payment after creating their account.
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <Link
              href="/admin/bookings"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              View All Bookings
            </Link>
            <button
              onClick={() => {
                setSuccess(null)
                setStep(1)
                setSelectedAddress(null)
                setIsServiceable(false)
                setCustomerEmail('')
                setCustomerName('')
                setCustomerPhone('')
                setExistingCustomer(null)
                setNotes('')
              }}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-dark-green transition"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Booking</h1>
        <Link
          href="/admin/bookings"
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s < step
                  ? 'bg-green-500 text-white'
                  : s === step
                  ? 'bg-primary-green text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s < step ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </div>
            {s < 4 && (
              <div className={`w-16 md:w-24 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Step 1: Delivery Address</h2>

          <AddressAutocomplete
            onSelect={handleAddressSelect}
            placeholder="Enter delivery address..."
            disabled={isCheckingServiceability}
          />

          {isCheckingServiceability && (
            <div className="mt-4 flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-green rounded-full animate-spin" />
              Checking serviceability...
            </div>
          )}

          {selectedAddress && isServiceable && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Address is serviceable</span>
              </div>
              <p className="text-sm text-green-600 mt-1">{selectedAddress.fullAddress}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!isServiceable}
              className={`px-6 py-2 bg-primary-green text-white rounded-lg transition ${
                !isServiceable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark-green'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Dumpster Config */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Step 2: Dumpster Details</h2>

          {isLoadingRules ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Waste Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {WASTE_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setWasteType(type.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                        wasteType === type.value
                          ? 'border-primary-green bg-primary-green/5 text-primary-green'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dumpster Size</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSizes.map(size => {
                    const rule = rules.find(r => r.waste_type === wasteType && r.dumpster_size === size)
                    const sizeInfo = SIZE_DESCRIPTIONS[size]
                    if (!rule || !sizeInfo) return null

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-lg border-2 text-left transition ${
                          selectedSize === size
                            ? 'border-primary-green bg-primary-green/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold">{sizeInfo.name}</div>
                        <div className="text-sm text-gray-500">{sizeInfo.capacity}</div>
                        <div className="text-sm font-bold text-accent-orange mt-1">
                          {formatCents(rule.base_price)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off Date</label>
                  <input
                    type="date"
                    value={dropoffDate}
                    min={getTomorrowDate()}
                    onChange={e => setDropoffDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pick-up Date</label>
                  <input
                    type="date"
                    value={pickupDate}
                    min={dropoffDate}
                    onChange={e => setPickupDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
              </div>

              {/* Pricing Preview */}
              {pricing && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Price Preview</h3>
                  <div className="space-y-1 text-sm">
                    {pricing.lineItems.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{item.label}</span>
                        <span>{formatCents(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-accent-orange">{formatCents(pricing.snapshot.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!pricing}
              className={`px-6 py-2 bg-primary-green text-white rounded-lg transition ${
                !pricing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark-green'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Customer Info */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Step 3: Customer Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => {
                  setCustomerEmail(e.target.value)
                  setExistingCustomer(null)
                }}
                onBlur={handleCustomerEmailBlur}
                placeholder="customer@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              />
              {isSearchingCustomer && (
                <p className="text-sm text-gray-500 mt-1">Searching for existing customer...</p>
              )}
              {existingCustomer && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Existing customer found!</strong>
                    {existingCustomer.user_id ? (
                      <span className="ml-2 text-green-600">(Has account)</span>
                    ) : (
                      <span className="ml-2 text-orange-600">(No account yet)</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="(412) 555-1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!customerEmail || !customerName}
              className={`px-6 py-2 bg-primary-green text-white rounded-lg transition ${
                !customerEmail || !customerName ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark-green'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Step 4: Review & Create</h2>

          <div className="space-y-4">
            {/* Address */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Delivery Address</h3>
              <p className="font-medium">{selectedAddress?.fullAddress}</p>
            </div>

            {/* Dumpster */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Dumpster</h3>
              <p className="font-medium">
                {SIZE_DESCRIPTIONS[selectedSize || 0]?.name} - {WASTE_TYPES.find(t => t.value === wasteType)?.label}
              </p>
              <p className="text-sm text-gray-600">
                {dropoffDate} to {pickupDate}
              </p>
            </div>

            {/* Customer */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
              <p className="font-medium">{customerName}</p>
              <p className="text-sm text-gray-600">{customerEmail}</p>
              {customerPhone && <p className="text-sm text-gray-600">{customerPhone}</p>}
              {existingCustomer?.user_id ? (
                <p className="text-xs text-green-600 mt-1">Has account - payment link will be sent</p>
              ) : (
                <p className="text-xs text-orange-600 mt-1">No account - registration invite will be sent</p>
              )}
            </div>

            {/* Pricing */}
            {pricing && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pricing</h3>
                <div className="space-y-1 text-sm">
                  {pricing.lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600">{item.label}</span>
                      <span>{formatCents(item.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-accent-orange">{formatCents(pricing.snapshot.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 bg-primary-green text-white rounded-lg transition ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark-green'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Booking & Send Email'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
