import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../../helpers/mock-supabase'
import { createPostRequest, createRouteParams, parseResponse } from '../../helpers/request'
import { IDS, PRICING_SNAPSHOT } from '../../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST } = await import('@/app/api/admin/bookings/[id]/assign-dumpster/route')

describe('POST /api/admin/bookings/[id]/assign-dumpster', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when dumpsterId is missing', async () => {
    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.booking }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/dumpster id/i)
  })

  it('returns 404 when booking not found', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', { data: null, error: { code: 'PGRST116' } })
    const { status } = await parseResponse(
      await POST(
        createPostRequest({ dumpsterId: IDS.dumpster }),
        createRouteParams({ id: 'nonexistent' })
      )
    )
    expect(status).toBe(404)
  })

  it('returns 400 when booking is completed', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'completed', dumpster_id: null, pricing_snapshot: PRICING_SNAPSHOT },
    })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ dumpsterId: IDS.dumpster }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/completed or cancelled/i)
  })

  it('returns 404 when dumpster not found', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed', dumpster_id: null, pricing_snapshot: PRICING_SNAPSHOT },
    })
    mockQuery(mockAdminClient, 'dumpsters', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status } = await parseResponse(
      await POST(
        createPostRequest({ dumpsterId: 'bad-id' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(404)
  })

  it('returns 400 when dumpster is not available', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed', dumpster_id: null, pricing_snapshot: PRICING_SNAPSHOT },
    })
    mockQuery(mockAdminClient, 'dumpsters', 'select', {
      data: { id: IDS.dumpster, status: 'reserved', size: 10 },
    })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ dumpsterId: IDS.dumpster }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/not available/i)
  })

  it('returns 400 when dumpster size does not match', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed', dumpster_id: null, pricing_snapshot: PRICING_SNAPSHOT },
    })
    mockQuery(mockAdminClient, 'dumpsters', 'select', {
      data: { id: IDS.dumpster, status: 'available', size: 20 },
    })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ dumpsterId: IDS.dumpster }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/size.*doesn't match/i)
  })

  it('assigns dumpster and marks it reserved', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed', dumpster_id: null, pricing_snapshot: PRICING_SNAPSHOT },
    })
    mockQuery(mockAdminClient, 'dumpsters', 'select', {
      data: { id: IDS.dumpster, status: 'available', size: 10 },
    })
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null })
    mockQuery(mockAdminClient, 'dumpsters', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ dumpsterId: IDS.dumpster }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('frees previous dumpster when reassigning', async () => {
    const oldDumpsterId = 'old-dumpster-id'
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed', dumpster_id: oldDumpsterId, pricing_snapshot: PRICING_SNAPSHOT },
    })
    mockQuery(mockAdminClient, 'dumpsters', 'select', {
      data: { id: IDS.dumpster, status: 'available', size: 10 },
    })
    // Free old dumpster
    mockQuery(mockAdminClient, 'dumpsters', 'update', { data: null })
    // Update booking
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null })
    // Reserve new dumpster
    mockQuery(mockAdminClient, 'dumpsters', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ dumpsterId: IDS.dumpster }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })
})
