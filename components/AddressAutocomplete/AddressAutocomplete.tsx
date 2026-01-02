'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface AddressSuggestion {
  id: string
  fullAddress: string
  street?: string
  city?: string
  state?: string
  zip?: string
  lat: number
  lng: number
  placeId: string
}

interface AddressAutocompleteProps {
  onSelect: (address: AddressSuggestion) => void
  placeholder?: string
  className?: string
  error?: string
  disabled?: boolean
}

interface MapboxFeature {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
  context?: Array<{
    id: string
    text: string
    short_code?: string
  }>
  address?: string
  text?: string
  properties?: {
    address?: string
  }
}

interface MapboxResponse {
  features: MapboxFeature[]
}

export function AddressAutocomplete({
  onSelect,
  placeholder = 'Enter your address',
  className = '',
  error,
  disabled = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Mapbox Search API
  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      // Bias results towards Pittsburgh area
      const proximity = '-80.0,40.4' // Pittsburgh coordinates
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&country=us&types=address&proximity=${proximity}&limit=5`

      const response = await fetch(url)
      const data: MapboxResponse = await response.json()

      const results: AddressSuggestion[] = data.features.map((feature) => {
        // Parse context for city, state, zip
        let city = ''
        let state = ''
        let zip = ''

        if (feature.context) {
          for (const ctx of feature.context) {
            if (ctx.id.startsWith('place')) {
              city = ctx.text
            } else if (ctx.id.startsWith('region')) {
              state = ctx.short_code?.replace('US-', '') || ctx.text
            } else if (ctx.id.startsWith('postcode')) {
              zip = ctx.text
            }
          }
        }

        // Get street address
        const streetNumber = feature.address || ''
        const streetName = feature.text || ''
        const street = streetNumber ? `${streetNumber} ${streetName}` : streetName

        return {
          id: feature.id,
          fullAddress: feature.place_name,
          street,
          city,
          state,
          zip,
          lat: feature.center[1], // Mapbox returns [lng, lat]
          lng: feature.center[0],
          placeId: feature.id,
        }
      })

      setSuggestions(results)
      setIsOpen(results.length > 0)
    } catch (err) {
      console.error('Address search error:', err)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  const handleInputChange = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(-1)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 300)
  }, [searchAddresses])

  // Handle selection
  const handleSelect = useCallback((suggestion: AddressSuggestion) => {
    setQuery(suggestion.fullAddress)
    setSuggestions([])
    setIsOpen(false)
    onSelect(suggestion)
  }, [onSelect])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }, [isOpen, suggestions, selectedIndex, handleSelect])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-lg border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          `}
          aria-label="Address"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="address-suggestions"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-green rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          id="address-suggestions"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`
                px-4 py-3 cursor-pointer
                ${index === selectedIndex ? 'bg-primary-green/10' : 'hover:bg-gray-50'}
                ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="font-medium text-gray-900">
                {suggestion.street || suggestion.fullAddress.split(',')[0]}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.city}{suggestion.city && suggestion.state ? ', ' : ''}{suggestion.state} {suggestion.zip}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export type { AddressSuggestion }
