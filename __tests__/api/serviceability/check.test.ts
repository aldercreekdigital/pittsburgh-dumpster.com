import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
import { SERVICE_AREA_ROW, POINT_INSIDE, POINT_OUTSIDE } from '../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST } = await import('@/app/api/serviceability/check/route')

describe('POST /api/serviceability/check', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when lat/lng are missing', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({})))
    expect(status).toBe(400)
    expect(body.error).toMatch(/lat, lng/)
  })

  it('returns serviceable for a point inside the area', async () => {
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: [SERVICE_AREA_ROW] })
    const { status, body } = await parseResponse(
      await POST(createPostRequest(POINT_INSIDE))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.serviceArea).toBe('Greater Pittsburgh')
  })

  it('returns not serviceable for a point outside the area', async () => {
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: [SERVICE_AREA_ROW] })
    const { status, body } = await parseResponse(
      await POST(createPostRequest(POINT_OUTSIDE))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(false)
    expect(body.reason).toBe('not_serviceable')
  })

  it('returns 500 when service areas query fails', async () => {
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: null, error: { message: 'db error' } })
    const { status, body } = await parseResponse(
      await POST(createPostRequest(POINT_INSIDE))
    )
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
