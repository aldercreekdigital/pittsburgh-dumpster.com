import { describe, it, expect } from 'vitest'
import {
  isPointInPolygon,
  isPointInGeoJsonPolygon,
  checkServiceability,
  isValidPolygon,
  type ServiceArea,
  type GeoJsonPolygon,
  type Point,
} from './serviceability'

// Simple square polygon for testing
// Square from (0,0) to (10,10)
const simpleSquare: Point[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
  [0, 0], // Closing point
]

// GeoJSON version of the square
const simpleSquareGeoJson: GeoJsonPolygon = {
  type: 'Polygon',
  coordinates: [simpleSquare],
}

// Pittsburgh area polygon (matching our seed data)
const pittsburghPolygon: GeoJsonPolygon = {
  type: 'Polygon',
  coordinates: [[
    [-80.9, 40.9],
    [-79.5, 40.9],
    [-79.3, 40.6],
    [-79.4, 40.1],
    [-79.8, 39.8],
    [-80.5, 39.7],
    [-80.9, 39.9],
    [-81.0, 40.3],
    [-80.9, 40.9],
  ]],
}

const pittsburghServiceArea: ServiceArea = {
  id: 'test-area-1',
  name: 'Greater Pittsburgh Area',
  polygon: pittsburghPolygon,
  active: true,
}

describe('isPointInPolygon', () => {
  it('should return true for point inside polygon', () => {
    const point: Point = [5, 5]
    expect(isPointInPolygon(point, simpleSquare)).toBe(true)
  })

  it('should return true for point on boundary', () => {
    const point: Point = [0, 5]
    expect(isPointInPolygon(point, simpleSquare)).toBe(true)
  })

  it('should return true for point on corner', () => {
    const point: Point = [0, 0]
    expect(isPointInPolygon(point, simpleSquare)).toBe(true)
  })

  it('should return false for point outside polygon', () => {
    const point: Point = [15, 15]
    expect(isPointInPolygon(point, simpleSquare)).toBe(false)
  })

  it('should return false for point just outside polygon', () => {
    const point: Point = [11, 5]
    expect(isPointInPolygon(point, simpleSquare)).toBe(false)
  })
})

describe('isPointInGeoJsonPolygon', () => {
  it('should return true for point inside GeoJSON polygon', () => {
    const point: Point = [5, 5]
    expect(isPointInGeoJsonPolygon(point, simpleSquareGeoJson)).toBe(true)
  })

  it('should return false for point outside GeoJSON polygon', () => {
    const point: Point = [15, 15]
    expect(isPointInGeoJsonPolygon(point, simpleSquareGeoJson)).toBe(false)
  })

  it('should handle polygon with holes', () => {
    // Square from (0,0) to (10,10) with a hole from (3,3) to (7,7)
    const polygonWithHole: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        // Exterior ring
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        // Hole (interior ring, wound opposite direction)
        [[3, 3], [3, 7], [7, 7], [7, 3], [3, 3]],
      ],
    }

    // Point in the solid part should be inside
    expect(isPointInGeoJsonPolygon([1, 1], polygonWithHole)).toBe(true)

    // Point in the hole should be outside
    expect(isPointInGeoJsonPolygon([5, 5], polygonWithHole)).toBe(false)

    // Point outside should be outside
    expect(isPointInGeoJsonPolygon([15, 15], polygonWithHole)).toBe(false)
  })
})

describe('checkServiceability - Pittsburgh Area', () => {
  const serviceAreas = [pittsburghServiceArea]

  it('should return serviceable for downtown Pittsburgh', () => {
    // Downtown Pittsburgh: 40.4406° N, 79.9959° W
    const result = checkServiceability(40.4406, -79.9959, serviceAreas)

    expect(result.isServiceable).toBe(true)
    expect(result.matchedAreaName).toBe('Greater Pittsburgh Area')
  })

  it('should return serviceable for Oakdale, PA (business location)', () => {
    // Oakdale, PA: 40.3985° N, 80.1848° W
    const result = checkServiceability(40.3985, -80.1848, serviceAreas)

    expect(result.isServiceable).toBe(true)
  })

  it('should return serviceable for Wheeling, WV', () => {
    // Wheeling, WV: 40.0640° N, 80.7209° W
    const result = checkServiceability(40.0640, -80.7209, serviceAreas)

    expect(result.isServiceable).toBe(true)
  })

  it('should return serviceable for Washington, PA', () => {
    // Washington, PA: 40.1740° N, 80.2462° W
    const result = checkServiceability(40.1740, -80.2462, serviceAreas)

    expect(result.isServiceable).toBe(true)
  })

  it('should return not serviceable for Philadelphia, PA (too far east)', () => {
    // Philadelphia, PA: 39.9526° N, 75.1652° W
    const result = checkServiceability(39.9526, -75.1652, serviceAreas)

    expect(result.isServiceable).toBe(false)
    expect(result.message).toContain('outside our service area')
  })

  it('should return not serviceable for Cleveland, OH (too far west)', () => {
    // Cleveland, OH: 41.4993° N, 81.6944° W
    const result = checkServiceability(41.4993, -81.6944, serviceAreas)

    expect(result.isServiceable).toBe(false)
  })

  it('should return not serviceable for Erie, PA (too far north)', () => {
    // Erie, PA: 42.1292° N, 80.0851° W
    const result = checkServiceability(42.1292, -80.0851, serviceAreas)

    expect(result.isServiceable).toBe(false)
  })
})

describe('checkServiceability - Edge Cases', () => {
  it('should return not serviceable when no service areas exist', () => {
    const result = checkServiceability(40.4406, -79.9959, [])

    expect(result.isServiceable).toBe(false)
    expect(result.message).toContain('No active service areas')
  })

  it('should skip inactive service areas', () => {
    const inactiveArea: ServiceArea = {
      ...pittsburghServiceArea,
      active: false,
    }

    const result = checkServiceability(40.4406, -79.9959, [inactiveArea])

    expect(result.isServiceable).toBe(false)
    expect(result.message).toContain('No active service areas')
  })

  it('should check multiple service areas and return first match', () => {
    const westArea: ServiceArea = {
      id: 'west-area',
      name: 'Western Extension',
      polygon: {
        type: 'Polygon',
        coordinates: [[
          [-82.0, 40.0],
          [-81.0, 40.0],
          [-81.0, 41.0],
          [-82.0, 41.0],
          [-82.0, 40.0],
        ]],
      },
      active: true,
    }

    const result = checkServiceability(40.4406, -79.9959, [pittsburghServiceArea, westArea])

    expect(result.isServiceable).toBe(true)
    expect(result.matchedAreaName).toBe('Greater Pittsburgh Area')
  })
})

describe('isValidPolygon', () => {
  it('should return true for valid polygon', () => {
    expect(isValidPolygon(simpleSquareGeoJson)).toBe(true)
  })

  it('should return true for polygon with holes', () => {
    const polygonWithHole: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[3, 3], [3, 7], [7, 7], [7, 3], [3, 3]],
      ],
    }
    expect(isValidPolygon(polygonWithHole)).toBe(true)
  })

  it('should return false for null', () => {
    expect(isValidPolygon(null)).toBe(false)
  })

  it('should return false for wrong type', () => {
    expect(isValidPolygon({ type: 'Point', coordinates: [0, 0] })).toBe(false)
  })

  it('should return false for empty coordinates', () => {
    expect(isValidPolygon({ type: 'Polygon', coordinates: [] })).toBe(false)
  })

  it('should return false for ring with too few points', () => {
    expect(isValidPolygon({
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 1], [0, 0]]],
    })).toBe(false)
  })

  it('should return false for invalid point format', () => {
    expect(isValidPolygon({
      type: 'Polygon',
      coordinates: [[['a', 'b'], [1, 1], [2, 2], [0, 0]]],
    })).toBe(false)
  })
})

describe('Real-world address tests', () => {
  const serviceAreas = [pittsburghServiceArea]

  // These are approximate coordinates for testing
  const testAddresses = [
    { name: 'Carnegie, PA', lat: 40.4087, lng: -80.0837, expected: true },
    { name: 'Canonsburg, PA', lat: 40.2626, lng: -80.1867, expected: true },
    { name: 'Greensburg, PA', lat: 40.3015, lng: -79.5389, expected: true },
    { name: 'Butler, PA', lat: 40.8612, lng: -79.8953, expected: true },
    { name: 'Steubenville, OH', lat: 40.3698, lng: -80.6339, expected: true },
    { name: 'New York, NY', lat: 40.7128, lng: -74.0060, expected: false },
    { name: 'Columbus, OH', lat: 39.9612, lng: -82.9988, expected: false },
  ]

  for (const addr of testAddresses) {
    it(`should return ${addr.expected ? 'serviceable' : 'not serviceable'} for ${addr.name}`, () => {
      const result = checkServiceability(addr.lat, addr.lng, serviceAreas)
      expect(result.isServiceable).toBe(addr.expected)
    })
  }
})
