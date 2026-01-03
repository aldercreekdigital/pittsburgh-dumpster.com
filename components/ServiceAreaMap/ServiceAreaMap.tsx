'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { SERVICE_AREAS, PHONE_NUMBERS } from '@/lib/constants'

interface ServiceAreaMapProps {
  showFullDetails?: boolean
  height?: string
}

interface ServiceArea {
  id: string
  name: string
  polygon: {
    type: string
    coordinates: number[][][]
  }
}

export default function ServiceAreaMap({ showFullDetails = false, height = 'h-64 md:h-80' }: ServiceAreaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  // Fetch service areas from API
  useEffect(() => {
    async function fetchServiceAreas() {
      try {
        const response = await fetch('/api/service-area')
        if (response.ok) {
          const data = await response.json()
          console.log('Service areas fetched:', data)
          setServiceAreas(data.serviceAreas || [])
        } else {
          console.error('Service area API error:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch service areas:', error)
      }
    }
    fetchServiceAreas()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    console.log('Mapbox token available:', !!token)

    if (!token) {
      console.error('Mapbox token not found')
      setMapError(true)
      return
    }

    mapboxgl.accessToken = token

    try {
      console.log('Initializing Mapbox map...')
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-80.0, 40.4], // Pittsburgh area center
        zoom: 7,
        interactive: true,
        attributionControl: false,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully')
        setMapLoaded(true)
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setMapError(true)
      })
    } catch (error) {
      console.error('Failed to initialize map:', error)
      setMapError(true)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add polygon layers when map is loaded and service areas are fetched
  useEffect(() => {
    if (!map.current || !mapLoaded || serviceAreas.length === 0) return

    // Add service area polygons
    serviceAreas.forEach((area, index) => {
      const sourceId = `service-area-${index}`
      const fillLayerId = `service-area-fill-${index}`
      const lineLayerId = `service-area-line-${index}`

      // Check if source already exists
      if (map.current!.getSource(sourceId)) return

      // Add source
      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: area.name },
          geometry: area.polygon as GeoJSON.Polygon,
        },
      })

      // Add fill layer
      map.current!.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#2E7D32',
          'fill-opacity': 0.2,
        },
      })

      // Add outline layer
      map.current!.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#1C3B2A',
          'line-width': 2,
        },
      })
    })

    // Add marker for headquarters (Oakdale, PA)
    new mapboxgl.Marker({ color: '#E65100' })
      .setLngLat([-80.1848, 40.3985])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          '<strong>McCrackan Roll-Off Services</strong><br/>1555 Oakdale Road<br/>Oakdale, PA 15071'
        )
      )
      .addTo(map.current!)

    // Fit bounds to show all service areas
    if (serviceAreas.length > 0 && serviceAreas[0].polygon) {
      const coords = serviceAreas[0].polygon.coordinates[0]
      const bounds = coords.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
      )
      map.current!.fitBounds(bounds, { padding: 40 })
    }
  }, [mapLoaded, serviceAreas])

  return (
    <div className="card-industrial p-6 md:p-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Our Service Area</h3>

      {/* Map */}
      <div className={`relative w-full ${height} rounded-lg mb-6 overflow-hidden bg-gray-100`}>
        {mapError ? (
          // Fallback placeholder if map fails to load
          <div className="absolute inset-0 flex items-center justify-center bg-primary-green/5">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-primary-green opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-steel-gray">Serving 50+ Counties Across 3 States</p>
              <p className="text-sm text-gray-500 mt-1">Western PA | Northern WV | Eastern OH</p>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '256px' }} />
        )}

        {/* Loading state */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
          </div>
        )}

        {/* State legend */}
        <div className="absolute top-4 left-4 space-y-2 z-10">
          <div className="flex items-center bg-white/90 px-3 py-1 rounded-full text-sm shadow">
            <div className="w-3 h-3 bg-primary-green rounded-full mr-2"></div>
            <span>Service Area</span>
          </div>
          <div className="flex items-center bg-white/90 px-3 py-1 rounded-full text-sm shadow">
            <div className="w-3 h-3 bg-accent-orange rounded-full mr-2"></div>
            <span>Headquarters</span>
          </div>
        </div>
      </div>

      {/* Service Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pennsylvania */}
        <div className="space-y-3">
          <h4 className="font-bold text-primary-dark-green flex items-center">
            <div className="w-3 h-3 bg-primary-green rounded-full mr-2"></div>
            {SERVICE_AREAS.pennsylvania.name}
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            {(showFullDetails
              ? SERVICE_AREAS.pennsylvania.counties
              : SERVICE_AREAS.pennsylvania.counties.slice(0, 5)
            ).map((county) => (
              <li key={county}>{county}</li>
            ))}
            {!showFullDetails && SERVICE_AREAS.pennsylvania.counties.length > 5 && (
              <li className="text-primary-light">+ {SERVICE_AREAS.pennsylvania.counties.length - 5} more</li>
            )}
          </ul>
        </div>

        {/* West Virginia */}
        <div className="space-y-3">
          <h4 className="font-bold text-primary-dark-green flex items-center">
            <div className="w-3 h-3 bg-accent-orange rounded-full mr-2"></div>
            {SERVICE_AREAS.westVirginia.name}
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            {SERVICE_AREAS.westVirginia.counties.map((county) => (
              <li key={county}>{county}</li>
            ))}
          </ul>
        </div>

        {/* Ohio */}
        <div className="space-y-3">
          <h4 className="font-bold text-primary-dark-green flex items-center">
            <div className="w-3 h-3 bg-accent-blue rounded-full mr-2"></div>
            {SERVICE_AREAS.ohio.name}
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            {SERVICE_AREAS.ohio.counties.map((county) => (
              <li key={county}>{county}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Not Sure CTA */}
      <div className="mt-8 p-4 bg-primary-dark-green/5 rounded-lg">
        <p className="text-sm text-gray-700 text-center">
          <strong>Not sure if we serve your area?</strong> We cover 50+ counties across three states.{' '}
          <br className="hidden sm:block" />
          Call us at{' '}
          <a href={`tel:${PHONE_NUMBERS.tracked.website}`} className="text-accent-orange font-bold hover:underline">
            {PHONE_NUMBERS.display}
          </a>{' '}
          or{' '}
          <Link href="/contact" className="text-accent-orange font-bold hover:underline">
            contact us online
          </Link>{' '}
          to confirm service availability.
        </p>
      </div>
    </div>
  )
}
