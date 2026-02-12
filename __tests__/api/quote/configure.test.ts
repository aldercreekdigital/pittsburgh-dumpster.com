import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
import { IDS, PRICING_RULE } from '../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST } = await import('@/app/api/quote/configure/route')

// Use future dates to avoid "past date" validation
const futureDate = new Date()
futureDate.setDate(futureDate.getDate() + 7)
const dropoff = futureDate.toISOString().split('T')[0]
const pickupDate = new Date(futureDate)
pickupDate.setDate(pickupDate.getDate() + 7)
const pickup = pickupDate.toISOString().split('T')[0]

const validBody = {
  quoteId: IDS.quote,
  wasteType: 'construction_debris',
  dumpsterSize: 10,
  dropoffDate: dropoff,
  pickupDate: pickup,
}

describe('POST /api/quote/configure', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when required fields are missing', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({})))
    expect(status).toBe(400)
    expect(body.error).toMatch(/missing required/i)
  })

  it('returns 400 when pickup is before dropoff', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({
      ...validBody,
      pickupDate: '2020-01-01',
      dropoffDate: '2020-01-10',
    })))
    expect(status).toBe(400)
    expect(body.error).toMatch(/pickup.*after/i)
  })

  it('returns 400 when dropoff is in the past', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({
      ...validBody,
      dropoffDate: '2020-01-01',
      pickupDate: '2020-01-08',
    })))
    expect(status).toBe(400)
    expect(body.error).toMatch(/past/i)
  })

  it('returns 404 when quote not found', async () => {
    mockQuery(mockAdminClient, 'quotes', 'select', { data: null, error: { code: 'PGRST116' } })
    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(404)
    expect(body.error).toMatch(/not found/i)
  })

  it('returns 400 when quote is not in draft status', async () => {
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'converted', business_id: IDS.business },
    })
    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(400)
    expect(body.error).toMatch(/no longer editable/i)
  })

  it('returns 400 when pricing rule not found', async () => {
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'draft', business_id: IDS.business },
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(400)
    expect(body.error).toMatch(/pricing not available/i)
  })

  it('configures quote with pricing on success', async () => {
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'draft', business_id: IDS.business },
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: PRICING_RULE })
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'delete', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.quoteId).toBe(IDS.quote)
    expect(body.pricing.total).toBeGreaterThan(0)
    expect(body.pricing.lineItems).toBeDefined()
    expect(body.pricing.lineItems.length).toBeGreaterThan(0)
  })

  it('returns 500 when quote update fails', async () => {
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'draft', business_id: IDS.business },
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: PRICING_RULE })
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null, error: { message: 'update failed' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
