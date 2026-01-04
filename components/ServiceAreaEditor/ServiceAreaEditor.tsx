'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

interface ServiceArea {
  id: string
  name: string
  polygon: GeoJSON.Polygon
}

interface ServiceAreaEditorProps {
  onSave?: () => void
}

export default function ServiceAreaEditor({ onSave }: ServiceAreaEditorProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const draw = useRef<MapboxDraw | null>(null)

  const [serviceArea, setServiceArea] = useState<ServiceArea | null>(null)
  const [originalPolygon, setOriginalPolygon] = useState<GeoJSON.Polygon | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch existing service area
  useEffect(() => {
    async function fetchServiceArea() {
      try {
        const response = await fetch('/api/service-area')
        if (response.ok) {
          const data = await response.json()
          if (data.serviceAreas && data.serviceAreas.length > 0) {
            const area = data.serviceAreas[0]
            setServiceArea(area)
            setOriginalPolygon(area.polygon)
          }
        }
      } catch (err) {
        console.error('Failed to fetch service area:', err)
      }
    }
    fetchServiceArea()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) {
      console.log('ServiceAreaEditor: No map container ref')
      return
    }

    if (map.current) {
      console.log('ServiceAreaEditor: Map already initialized')
      return
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    console.log('ServiceAreaEditor: Token exists:', !!token)

    if (!token) {
      setError('Mapbox token not configured')
      return
    }

    mapboxgl.accessToken = token

    try {
      console.log('ServiceAreaEditor: Creating map...')
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-80.0, 40.4],
        zoom: 7,
      })

      // Initialize draw controls
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'simple_select',
      })

      map.current.addControl(draw.current, 'top-left')
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.current.on('load', () => {
        console.log('ServiceAreaEditor: Map loaded')
        setMapLoaded(true)
      })

      map.current.on('error', (e) => {
        console.error('ServiceAreaEditor: Map error:', e)
        setError('Map failed to load')
      })

      // Listen for draw events
      const onDrawChange = () => {
        setHasChanges(true)
        setError(null)
        setSuccess(null)
      }

      map.current.on('draw.create', onDrawChange)
      map.current.on('draw.update', onDrawChange)
      map.current.on('draw.delete', onDrawChange)
    } catch (err) {
      console.error('ServiceAreaEditor: Failed to create map:', err)
      setError('Failed to initialize map')
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Load existing polygon into draw when map is ready
  useEffect(() => {
    if (!mapLoaded || !draw.current || !serviceArea?.polygon) return

    // Clear existing features
    draw.current.deleteAll()

    // Add the existing polygon
    const feature: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: serviceArea.polygon,
    }
    draw.current.add(feature)

    // Fit bounds to the polygon
    if (serviceArea.polygon.coordinates[0]) {
      const coords = serviceArea.polygon.coordinates[0]
      const bounds = coords.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
      )
      map.current?.fitBounds(bounds, { padding: 50 })
    }
  }, [mapLoaded, serviceArea])


  const getCurrentPolygon = (): GeoJSON.Polygon | null => {
    if (!draw.current) return null

    const data = draw.current.getAll()
    if (data.features.length === 0) return null

    // Get the first polygon feature
    const polygonFeature = data.features.find(f => f.geometry.type === 'Polygon')
    if (!polygonFeature) return null

    return polygonFeature.geometry as GeoJSON.Polygon
  }

  const handleSave = async () => {
    const polygon = getCurrentPolygon()

    if (!polygon) {
      setError('Please draw a service area polygon first')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/service-area', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ polygon }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save service area')
      }

      setSuccess('Service area saved successfully!')
      setOriginalPolygon(polygon)
      setHasChanges(false)
      onSave?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service area')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!draw.current || !originalPolygon) return

    // Clear and restore original
    draw.current.deleteAll()

    const feature: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: originalPolygon,
    }
    draw.current.add(feature)

    setHasChanges(false)
    setError(null)
    setSuccess(null)
  }

  const handleClear = () => {
    if (!draw.current) return
    draw.current.deleteAll()
    setHasChanges(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Service Area</h3>
          <p className="text-sm text-gray-500">
            Draw or edit your service area on the map. Use the polygon tool to create a new area.
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '400px' }} />

        {/* Map init error overlay */}
        {(error === 'Mapbox token not configured' || error === 'Failed to initialize map' || error === 'Map failed to load') && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <div className="text-center text-red-600">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-2">Check console for details</p>
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
          </div>
        )}

        {/* Instructions overlay - only show after map loads */}
        {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 text-sm max-w-xs shadow z-10 pointer-events-none">
          <p className="font-medium mb-1">Drawing Tools:</p>
          <ul className="text-gray-600 space-y-1">
            <li>• Click the polygon icon to start drawing</li>
            <li>• Click points to create vertices</li>
            <li>• Double-click to complete the polygon</li>
            <li>• Click a polygon to select and edit it</li>
          </ul>
        </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="px-4 py-2 bg-primary-green text-white rounded-lg font-medium hover:bg-primary-dark-green disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? 'Saving...' : 'Save Service Area'}
        </button>

        <button
          onClick={handleReset}
          disabled={!hasChanges || !originalPolygon}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Reset to Original
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Clear All
        </button>

        {hasChanges && (
          <span className="text-sm text-amber-600 ml-2">
            • Unsaved changes
          </span>
        )}
      </div>
    </div>
  )
}
