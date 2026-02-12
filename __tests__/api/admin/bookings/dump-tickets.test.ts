import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../../helpers/mock-supabase'
import { createPostRequest, createGetRequest, createRouteParams, parseResponse } from '../../helpers/request'
import { IDS } from '../../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST, GET } = await import('@/app/api/admin/bookings/[id]/dump-tickets/route')

const validTicket = {
  facility: 'Central Landfill',
  ticket_number: 'TK-001',
  net_tons: 1.5,
  ticket_datetime: '2025-07-10T10:00:00Z',
}

describe('POST /api/admin/bookings/[id]/dump-tickets', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when required fields are missing', async () => {
    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.booking }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/required/i)
  })

  it('returns 404 when booking not found', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', { data: null, error: { code: 'PGRST116' } })
    const { status } = await parseResponse(
      await POST(createPostRequest(validTicket), createRouteParams({ id: 'nonexistent' }))
    )
    expect(status).toBe(404)
  })

  it('creates dump ticket successfully', async () => {
    mockQuery(mockAdminClient, 'bookings', 'select', { data: { id: IDS.booking, status: 'dropped' } })
    mockQuery(mockAdminClient, 'dump_tickets', 'insert', { data: { id: IDS.dumpTicket } })

    const { status, body } = await parseResponse(
      await POST(createPostRequest(validTicket), createRouteParams({ id: IDS.booking }))
    )
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.id).toBe(IDS.dumpTicket)
  })
})

describe('GET /api/admin/bookings/[id]/dump-tickets', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns tickets for a booking', async () => {
    const tickets = [
      { id: IDS.dumpTicket, facility: 'Central Landfill', ticket_number: 'TK-001', net_tons: 1.5, ticket_datetime: '2025-07-10T10:00:00Z', created_at: '2025-07-10T10:00:00Z' },
    ]
    mockQuery(mockAdminClient, 'dump_tickets', 'select', { data: tickets })

    const { status, body } = await parseResponse(
      await GET(createGetRequest(), createRouteParams({ id: IDS.booking }))
    )
    expect(status).toBe(200)
    expect(body.tickets).toHaveLength(1)
    expect(body.tickets[0].facility).toBe('Central Landfill')
  })
})
