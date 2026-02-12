import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery, mockAuthUser } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
import { IDS, MOCK_USER, SERVICE_AREA_ROW, POINT_INSIDE, POINT_OUTSIDE } from '../helpers/fixtures'

const mockAuthClient = createMockSupabaseClient()
const mockAdminClient = createMockSupabaseClient()

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockAuthClient,
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST } = await import('@/app/api/quote/start/route')

const validBody = {
  fullAddress: '123 Main St, Pittsburgh, PA 15213',
  ...POINT_INSIDE,
}

describe('POST /api/quote/start', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when required fields are missing', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({})))
    expect(status).toBe(400)
    expect(body.error).toMatch(/fullAddress, lat, lng/)
  })

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(mockAuthClient, null)
    const { status } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(401)
  })

  it('returns not serviceable for out-of-area address', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    // Existing customer
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    // Service areas
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: [SERVICE_AREA_ROW] })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ fullAddress: '123 Far Away', ...POINT_OUTSIDE }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(false)
    expect(body.reason).toBe('not_serviceable')
  })

  it('creates customer, address, and quote on success', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    // No existing customer
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    // Create customer
    mockQuery(mockAdminClient, 'customers', 'insert', { data: { id: IDS.customer } })
    // Service areas
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: [SERVICE_AREA_ROW] })
    // Create address
    mockQuery(mockAdminClient, 'addresses', 'insert', { data: { id: IDS.address } })
    // Create quote
    mockQuery(mockAdminClient, 'quotes', 'insert', { data: { id: IDS.quote } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.quoteId).toBe(IDS.quote)
    expect(body.addressId).toBe(IDS.address)
    expect(body.serviceArea).toBe('Greater Pittsburgh')
  })

  it('uses existing customer when found', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: [SERVICE_AREA_ROW] })
    mockQuery(mockAdminClient, 'addresses', 'insert', { data: { id: IDS.address } })
    mockQuery(mockAdminClient, 'quotes', 'insert', { data: { id: IDS.quote } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('returns 500 when service area query fails', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })

  it('returns 500 when address creation fails', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: [SERVICE_AREA_ROW] })
    mockQuery(mockAdminClient, 'addresses', 'insert', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(500)
    expect(body.error).toMatch(/address/i)
  })

  it('returns 500 when quote creation fails', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'service_areas', 'select', { data: [SERVICE_AREA_ROW] })
    mockQuery(mockAdminClient, 'addresses', 'insert', { data: { id: IDS.address } })
    mockQuery(mockAdminClient, 'quotes', 'insert', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(500)
    expect(body.error).toMatch(/quote/i)
  })
})
