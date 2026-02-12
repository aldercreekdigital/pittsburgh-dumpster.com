import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../../helpers/mock-supabase'
import { createPostRequest, createRouteParams, parseResponse } from '../../helpers/request'
import { IDS } from '../../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST } = await import('@/app/api/admin/bookings/[id]/status/route')

describe('POST /api/admin/bookings/[id]/status', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when status is missing', async () => {
    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.booking }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/status.*required/i)
  })

  it('returns 404 when booking not found', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', { data: null, error: { code: 'PGRST116' } })
    const { status } = await parseResponse(
      await POST(
        createPostRequest({ status: 'scheduled' }),
        createRouteParams({ id: 'nonexistent' })
      )
    )
    expect(status).toBe(404)
  })

  it('returns 400 for invalid transition confirmed -> completed', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed' },
    })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'completed' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/cannot transition/i)
  })

  it('allows confirmed -> scheduled', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed' },
    })
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'scheduled' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.status).toBe('scheduled')
  })

  it('allows scheduled -> dropped', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'scheduled' },
    })
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'dropped' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(200)
    expect(body.status).toBe('dropped')
  })

  it('allows dropped -> picked_up', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'dropped' },
    })
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'picked_up' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(200)
    expect(body.status).toBe('picked_up')
  })

  it('allows picked_up -> completed and frees dumpster', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'picked_up' },
    })
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null })
    // Dumpster lookup
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { dumpster_id: IDS.dumpster },
    })
    // Free dumpster
    mockQuery(mockAdminClient, 'dumpsters', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'completed' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(200)
    expect(body.status).toBe('completed')
  })

  it('allows confirmed -> cancelled and frees dumpster', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed' },
    })
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null })
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { dumpster_id: IDS.dumpster },
    })
    mockQuery(mockAdminClient, 'dumpsters', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'cancelled' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(200)
    expect(body.status).toBe('cancelled')
  })

  it('returns 400 for transition from terminal state completed', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'completed' },
    })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'scheduled' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/cannot transition/i)
  })

  it('returns 500 when update fails', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', {
      data: { id: IDS.booking, status: 'confirmed' },
    })
    mockQuery(mockAdminClient, 'bookings', 'update', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(
      await POST(
        createPostRequest({ status: 'scheduled' }),
        createRouteParams({ id: IDS.booking })
      )
    )
    expect(status).toBe(500)
    expect(body.error).toMatch(/failed/i)
  })
})
