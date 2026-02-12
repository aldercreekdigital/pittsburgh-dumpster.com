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

const { POST } = await import('@/app/api/cart/remove/route')

describe('POST /api/cart/remove', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when itemId is missing', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({})))
    expect(status).toBe(400)
    expect(body.error).toMatch(/itemId/)
  })

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(mockAuthClient, null)
    const { status } = await parseResponse(
      await POST(createPostRequest({ itemId: IDS.cartItem }))
    )
    expect(status).toBe(401)
  })

  it('returns 404 when cart not found', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'carts', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ itemId: IDS.cartItem }))
    )
    expect(status).toBe(404)
    expect(body.error).toMatch(/cart not found/i)
  })

  it('removes item successfully', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'delete', { data: null })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ itemId: IDS.cartItem }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('returns 500 when delete fails', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'delete', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ itemId: IDS.cartItem }))
    )
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
