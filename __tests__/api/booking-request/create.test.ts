import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery, mockAuthUser } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
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

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  getBookingRequestNotificationHtml: vi.fn().mockReturnValue('<html>notification</html>'),
  getBookingRequestConfirmationHtml: vi.fn().mockReturnValue('<html>confirmation</html>'),
}))

const { POST } = await import('@/app/api/booking-request/create/route')

const validBody = {
  cartId: IDS.cart,
  contactName: 'Test Customer',
  contactPhone: '412-555-0100',
  contactEmail: 'customer@example.com',
  instructions: 'Place in driveway',
}

describe('POST /api/booking-request/create', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when contact info is missing', async () => {
    const { status, body } = await parseResponse(
      await POST(createPostRequest({ contactName: '', contactPhone: '', contactEmail: '' }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/contact/i)
  })

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(mockAuthClient, null)
    const { status } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(401)
  })

  it('returns 400 when customer record not found', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(400)
    expect(body.error).toMatch(/customer/i)
  })

  it('returns 404 when cart not found', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })
    mockQuery(mockAdminClient, 'carts', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(404)
    expect(body.error).toMatch(/cart not found/i)
  })

  it('returns 400 when cart is empty', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: [] })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(400)
    expect(body.error).toMatch(/empty/i)
  })

  it('creates booking request and sends emails on success', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: [CART_ITEM_WITH_QUOTE] })
    mockQuery(mockAdminClient, 'booking_requests', 'insert', { data: { id: IDS.bookingRequest } })
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null })
    mockQuery(mockAdminClient, 'carts', 'update', { data: null })
    mockQuery(mockAdminClient, 'addresses', 'select', { data: { full_address: '123 Main St' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.bookingRequestId).toBe(IDS.bookingRequest)

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledTimes(2)
  })

  it('returns 500 when booking request insert fails', async () => {
    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: [CART_ITEM_WITH_QUOTE] })
    mockQuery(mockAdminClient, 'booking_requests', 'insert', { data: null, error: { message: 'insert fail' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })

  it('succeeds even when email sending fails', async () => {
    const { sendEmail } = await import('@/lib/email/send')
    ;(sendEmail as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('email fail'))

    mockAuthUser(mockAuthClient, MOCK_USER)
    mockQuery(mockAdminClient, 'customers', 'select', { data: { id: IDS.customer } })
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })
    mockQuery(mockAdminClient, 'carts', 'select', { data: { id: IDS.cart } })
    mockQuery(mockAdminClient, 'cart_items', 'select', { data: [CART_ITEM_WITH_QUOTE] })
    mockQuery(mockAdminClient, 'booking_requests', 'insert', { data: { id: IDS.bookingRequest } })
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null })
    mockQuery(mockAdminClient, 'carts', 'update', { data: null })
    mockQuery(mockAdminClient, 'addresses', 'select', { data: { full_address: '123 Main St' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
  })
})
