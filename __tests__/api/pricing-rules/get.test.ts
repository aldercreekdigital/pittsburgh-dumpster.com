import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../helpers/mock-supabase'
import { createGetRequest, parseResponse } from '../helpers/request'
import { PRICING_RULE } from '../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { GET } = await import('@/app/api/pricing-rules/route')

describe('GET /api/pricing-rules', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns grouped pricing rules by size', async () => {
    mockQuery(mockAdminClient, 'pricing_rules', 'select', {
      data: [PRICING_RULE, { ...PRICING_RULE, waste_type: 'household_trash', base_price: 25000 }],
    })
    const { status, body } = await parseResponse(await GET())
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.sizes).toHaveLength(1)
    expect(body.sizes[0].wasteTypes).toHaveLength(2)
    expect(body.rules).toHaveLength(2)
  })

  it('returns 500 when query fails', async () => {
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: null, error: { message: 'fail' } })
    const { status, body } = await parseResponse(await GET())
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
