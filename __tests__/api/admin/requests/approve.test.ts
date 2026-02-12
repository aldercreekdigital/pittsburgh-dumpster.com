import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../../helpers/mock-supabase'
import { createPostRequest, createRouteParams, parseResponse } from '../../helpers/request'
import { IDS, MOCK_ADMIN_USER, BOOKING_REQUEST_ROW } from '../../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/admin/auth', () => ({
  getAdminUser: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  getBookingApprovedHtml: vi.fn().mockReturnValue('<html>approved</html>'),
}))

const { POST } = await import('@/app/api/admin/requests/[id]/approve/route')
const { getAdminUser } = await import('@/lib/admin/auth')

describe('POST /api/admin/requests/[id]/approve', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(401)
    expect(body.error).toMatch(/unauthorized/i)
  })

  it('returns 404 when booking request not found', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: 'nonexistent' }))
    )
    expect(status).toBe(404)
  })

  it('returns 400 when request is not pending', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', {
      data: { ...BOOKING_REQUEST_ROW, status: 'approved' },
    })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/cannot approve/i)
  })

  it('returns 400 when quote has no pricing snapshot', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', {
      data: { ...BOOKING_REQUEST_ROW, quote: { ...BOOKING_REQUEST_ROW.quote, pricing_snapshot: null } },
    })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/pricing/i)
  })

  it('returns 400 when customer is missing', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', {
      data: { ...BOOKING_REQUEST_ROW, customer: null },
    })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/customer/i)
  })

  it('creates invoice and approves on success', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', { data: BOOKING_REQUEST_ROW })
    // Last invoice number
    mockQuery(mockAdminClient, 'invoices', 'select', { data: { invoice_number: '1005' } })
    // Create invoice
    mockQuery(mockAdminClient, 'invoices', 'insert', { data: { id: IDS.invoice, invoice_number: '1006' } })
    // Create line items
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    // Update booking request status
    mockQuery(mockAdminClient, 'booking_requests', 'update', { data: null })
    // Update quote status
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.invoiceId).toBe(IDS.invoice)
    expect(body.invoiceNumber).toBe('1006')
  })

  it('sends approval email to customer', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', { data: BOOKING_REQUEST_ROW })
    mockQuery(mockAdminClient, 'invoices', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'invoices', 'insert', { data: { id: IDS.invoice, invoice_number: '1001' } })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'booking_requests', 'update', { data: null })
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null })

    await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
  })
})
