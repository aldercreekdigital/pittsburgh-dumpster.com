import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery, mockAuthUser } from '../helpers/mock-supabase'
import { createGetRequest, parseResponse } from '../helpers/request'
import { IDS, MOCK_USER, CART_ITEM_WITH_QUOTE } from '../helpers/fixtures'

const mockAuthClient = createMockSupabaseClient()
const mockAdminClient = createMockSupabaseClient()

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockAuthClient,
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { GET } = await import('@/app/api/cart/route')

describe('GET /api/cart', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(mockAuthClient, null)
    const { status, body } = await parseResponse(await GET())
    expect(status).toBe(401)
    expect(body.ok).toBe(false)
  })

  it('returns empty cart when none exists', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'carts', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(await GET())
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.cart).toBeNull()
    expect(body.items).toEqual([])
  })

  it('returns cart with items', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: [CART_ITEM_WITH_QUOTE] })

    const { status, body } = await parseResponse(await GET())
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.cartId).toBe(IDS.cart)
    expect(body.items).toHaveLength(1)
    expect(body.items[0].dumpsterSize).toBe(10)
  })

  it('returns 500 when cart items query fails', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(await GET())
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
