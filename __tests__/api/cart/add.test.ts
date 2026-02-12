import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery, mockAuthUser } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
import { IDS, MOCK_USER, PRICING_SNAPSHOT } from '../helpers/fixtures'

const mockAuthClient = createMockSupabaseClient()
const mockAdminClient = createMockSupabaseClient()

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockAuthClient,
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const { POST } = await import('@/app/api/cart/add/route')

describe('POST /api/cart/add', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when quoteId is missing', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({})))
    expect(status).toBe(400)
    expect(body.error).toMatch(/quoteId/)
  })

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(mockAuthClient, null)
    const { status, body } = await parseResponse(
      await POST(createPostRequest({ quoteId: IDS.quote }))
    )
    expect(status).toBe(401)
  })

  it('returns 404 when quote not found', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'quotes', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ quoteId: IDS.quote }))
    )
    expect(status).toBe(404)
    expect(body.error).toMatch(/not found/i)
  })

  it('returns 400 when quote has no pricing', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'draft', pricing_snapshot: null, business_id: IDS.business },
    })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ quoteId: IDS.quote }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/no pricing/i)
  })

  it('adds quote to existing cart', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'draft', pricing_snapshot: PRICING_SNAPSHOT, business_id: IDS.business },
    })
    // Existing cart found
    mockQuery(mockAdminClient, 'carts', 'select', { data: [{ id: IDS.cart }] })
    // No existing cart item
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: null, error: { code: 'PGRST116' } })
    // Insert succeeds
    mockQuery(mockAdminClient, 'cart_items', 'insert', { data: null })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ quoteId: IDS.quote }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.cartId).toBe(IDS.cart)
  })

  it('creates a new cart when none exists', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'draft', pricing_snapshot: PRICING_SNAPSHOT, business_id: IDS.business },
    })
    // No existing cart
    mockQuery(mockAdminClient, 'carts', 'select', { data: [] })
    // Create cart
    mockQuery(mockAdminClient, 'carts', 'insert', { data: { id: 'new-cart' } })
    // No existing cart item
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: null, error: { code: 'PGRST116' } })
    // Insert succeeds
    mockQuery(mockAdminClient, 'cart_items', 'insert', { data: null })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ quoteId: IDS.quote }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.cartId).toBe('new-cart')
  })

  it('returns ok when quote already in cart', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'quotes', 'select', {
      data: { id: IDS.quote, status: 'draft', pricing_snapshot: PRICING_SNAPSHOT, business_id: IDS.business },
    })
    mockQuery(mockAdminClient, 'carts', 'select', { data: [{ id: IDS.cart }] })
    // Already exists
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: { id: IDS.cartItem } })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ quoteId: IDS.quote }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.message).toMatch(/already in cart/i)
  })
})
