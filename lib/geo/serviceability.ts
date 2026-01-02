/**
 * Geo Serviceability Check
 *
 * Determines if a given point (lat/lng) is within any of the service area polygons.
 * Uses the robust-point-in-polygon library for accurate point-in-polygon testing.
 */

import robustPointInPolygon from 'robust-point-in-polygon'

/**
 * GeoJSON Polygon type
 * coordinates: [[[lng, lat], [lng, lat], ...]] - first ring is exterior, rest are holes
 */
export interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

/**
 * Service area from database
 */
export interface ServiceArea {
  id: string
  name: string
  polygon: GeoJsonPolygon
  active: boolean
}

/**
 * Point as [lng, lat] tuple (GeoJSON order)
 */
export type Point = [number, number]

/**
 * Result of checking a point against the service area
 */
export interface ServiceabilityResult {
  isServiceable: boolean
  matchedAreaId?: string
  matchedAreaName?: string
  message: string
}

/**
 * Check if a point is inside a polygon using robust-point-in-polygon.
 *
 * The robust-point-in-polygon library returns:
 * - -1: point is inside the polygon
 * - 0: point is on the boundary
 * - 1: point is outside the polygon
 *
 * @param point - [lng, lat] coordinates
 * @param polygon - Array of [lng, lat] coordinates forming the polygon ring
 * @returns true if point is inside or on boundary, false if outside
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  const result = robustPointInPolygon(polygon, point)
  // -1 = inside, 0 = on boundary, 1 = outside
  return result <= 0
}

/**
 * Check if a point is inside a GeoJSON polygon (with potential holes)
 *
 * @param point - [lng, lat] coordinates
 * @param geoJsonPolygon - GeoJSON Polygon object
 * @returns true if point is inside the polygon (accounting for holes)
 */
export function isPointInGeoJsonPolygon(
  point: Point,
  geoJsonPolygon: GeoJsonPolygon
): boolean {
  const rings = geoJsonPolygon.coordinates

  if (rings.length === 0) {
    return false
  }

  // First ring is the exterior boundary
  const exteriorRing = rings[0] as Point[]
  if (!isPointInPolygon(point, exteriorRing)) {
    return false
  }

  // Subsequent rings are holes - if point is in any hole, it's not in the polygon
  for (let i = 1; i < rings.length; i++) {
    const hole = rings[i] as Point[]
    if (isPointInPolygon(point, hole)) {
      return false
    }
  }

  return true
}

/**
 * Check if a location is serviceable by checking against all active service areas.
 *
 * @param lat - Latitude of the point
 * @param lng - Longitude of the point
 * @param serviceAreas - Array of service areas to check against
 * @returns ServiceabilityResult indicating if the location is serviceable
 */
export function checkServiceability(
  lat: number,
  lng: number,
  serviceAreas: ServiceArea[]
): ServiceabilityResult {
  // GeoJSON uses [lng, lat] order
  const point: Point = [lng, lat]

  // Only check active service areas
  const activeAreas = serviceAreas.filter(area => area.active)

  if (activeAreas.length === 0) {
    return {
      isServiceable: false,
      message: 'No active service areas configured',
    }
  }

  for (const area of activeAreas) {
    if (isPointInGeoJsonPolygon(point, area.polygon)) {
      return {
        isServiceable: true,
        matchedAreaId: area.id,
        matchedAreaName: area.name,
        message: `Location is within the ${area.name} service area`,
      }
    }
  }

  return {
    isServiceable: false,
    message: 'Sorry, this location is outside our service area. We currently serve the Greater Pittsburgh area including parts of Western PA, Northern WV, and Eastern OH.',
  }
}

/**
 * Validate that a polygon is properly formatted
 *
 * @param polygon - GeoJSON polygon to validate
 * @returns true if valid, false otherwise
 */
export function isValidPolygon(polygon: unknown): polygon is GeoJsonPolygon {
  if (!polygon || typeof polygon !== 'object') {
    return false
  }

  const p = polygon as Record<string, unknown>

  if (p.type !== 'Polygon') {
    return false
  }

  if (!Array.isArray(p.coordinates)) {
    return false
  }

  // Must have at least one ring (exterior)
  if (p.coordinates.length === 0) {
    return false
  }

  // Each ring must have at least 4 points (3 + closing point)
  for (const ring of p.coordinates) {
    if (!Array.isArray(ring) || ring.length < 4) {
      return false
    }

    // Each point must be [lng, lat]
    for (const point of ring) {
      if (!Array.isArray(point) || point.length < 2) {
        return false
      }
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        return false
      }
    }
  }

  return true
}
