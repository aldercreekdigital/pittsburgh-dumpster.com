/**
 * Utilities for stashing and retrieving booking data in query params
 * This allows users to configure quotes before signing up
 */

export interface StashedAddress {
  fullAddress: string
  street?: string
  city?: string
  state?: string
  zip?: string
  lat: number
  lng: number
  placeId?: string
}

export interface StashedQuoteConfig {
  wasteType: string
  dumpsterSize: number
  dropoffDate: string // YYYY-MM-DD
  pickupDate: string // YYYY-MM-DD
}

export interface StashedBookingData {
  address: StashedAddress
  quote?: StashedQuoteConfig
}

/**
 * Encode booking data to a URL-safe string
 */
export function encodeBookingData(data: StashedBookingData): string {
  const json = JSON.stringify(data)
  // Use base64url encoding (URL-safe)
  if (typeof window !== 'undefined') {
    return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return Buffer.from(json).toString('base64url')
}

/**
 * Decode booking data from a URL-safe string
 */
export function decodeBookingData(encoded: string): StashedBookingData | null {
  try {
    let json: string
    if (typeof window !== 'undefined') {
      // Restore base64 padding and characters
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const padding = base64.length % 4
      const padded = padding ? base64 + '='.repeat(4 - padding) : base64
      json = atob(padded)
    } else {
      json = Buffer.from(encoded, 'base64url').toString('utf-8')
    }
    return JSON.parse(json) as StashedBookingData
  } catch (e) {
    console.error('Failed to decode booking data:', e)
    return null
  }
}

/**
 * Build URL with stashed booking data
 */
export function buildStashedUrl(basePath: string, data: StashedBookingData): string {
  const encoded = encodeBookingData(data)
  return `${basePath}?data=${encoded}`
}

/**
 * Extract stashed booking data from URL search params
 */
export function getStashedData(searchParams: URLSearchParams): StashedBookingData | null {
  const encoded = searchParams.get('data')
  if (!encoded) return null
  return decodeBookingData(encoded)
}
