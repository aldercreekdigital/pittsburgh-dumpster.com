import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../helpers/mock-supabase'
import { createGetRequest, createRouteParams, parseResponse } from '../helpers/request'
import { IDS, INVOICE_ROW } from '../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { GET } = await import('@/app/api/invoices/[id]/route')

describe('GET /api/invoices/[id]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns invoice data', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    const { status, body } = await parseResponse(
      await GET(createGetRequest(), createRouteParams({ id: IDS.invoice }))
    )
    expect(status).toBe(200)
    expect(body.invoice.id).toBe(IDS.invoice)
    expect(body.invoice.invoice_number).toBe('1001')
  })

  it('returns 404 when invoice not found', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: null, error: { code: 'PGRST116' } })
    const { status, body } = await parseResponse(
      await GET(createGetRequest(), createRouteParams({ id: 'nonexistent' }))
    )
    expect(status).toBe(404)
    expect(body.error).toMatch(/not found/i)
  })
})
