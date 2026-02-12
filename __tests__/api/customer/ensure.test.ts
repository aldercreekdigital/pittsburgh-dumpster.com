import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery, mockAuthUser } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
import { IDS, MOCK_USER } from '../helpers/fixtures'

const mockAuthClient = createMockSupabaseClient()
const mockAdminClient = createMockSupabaseClient()

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockAuthClient,
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST } = await import('@/app/api/customer/ensure/route')

describe('POST /api/customer/ensure', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(mockAuthClient, null)
    const { status, body } = await parseResponse(await POST())
    expect(status).toBe(401)
    expect(body.ok).toBe(false)
  })

  it('returns existing customer by user_id', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })

    const { status, body } = await parseResponse(await POST())
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.customerId).toBe(IDS.customer)
    expect(body.created).toBe(false)
  })

  it('links existing customer by email when no user_id', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    // First query (by user_id) returns nothing
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    // Second query (by email) returns customer without user_id
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer, user_id: null } })
    // Update call
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })

    const { status, body } = await parseResponse(await POST())
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.customerId).toBe(IDS.customer)
    expect(body.created).toBe(false)
  })

  it('creates a new customer when none exists', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'customers', 'insert', { data: { id: 'new-customer-id' } })

    const { status, body } = await parseResponse(await POST())
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.customerId).toBe('new-customer-id')
    expect(body.created).toBe(true)
  })

  it('returns 500 when customer creation fails', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'customers', 'insert', { data: null, error: { message: 'insert failed' } })

    const { status, body } = await parseResponse(await POST())
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
