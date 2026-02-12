import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
import { IDS, INVOICE_ROW } from '../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  getPaymentConfirmationHtml: vi.fn().mockReturnValue('<html>confirmed</html>'),
}))

const { POST } = await import('@/app/api/payments/mock-pay/route')

describe('POST /api/payments/mock-pay', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when invoiceId is missing', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({})))
    expect(status).toBe(400)
    expect(body.error).toMatch(/invoice id/i)
  })

  it('returns 404 when invoice not found', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: null, error: { code: 'PGRST116' } })
    const { status } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(404)
  })

  it('returns 400 when invoice is already paid', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', {
      data: { ...INVOICE_ROW, status: 'paid' },
    })
    const { status, body } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/already paid/i)
  })

  it('returns 400 when booking request/quote is missing', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', {
      data: { ...INVOICE_ROW, booking_request: { id: IDS.bookingRequest, customer_id: IDS.customer, quote: null, customer: null } },
    })
    const { status, body } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/missing/i)
  })

  it('marks invoice as paid and creates booking', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null }) // mark paid
    mockQuery(mockAdminClient, 'payments', 'insert', { data: null })
    mockQuery(mockAdminClient, 'bookings', 'insert', { data: { id: IDS.booking } })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null }) // link booking

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.bookingId).toBe(IDS.booking)
  })

  it('sends confirmation email on success', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })
    mockQuery(mockAdminClient, 'payments', 'insert', { data: null })
    mockQuery(mockAdminClient, 'bookings', 'insert', { data: { id: IDS.booking } })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })

    await POST(createPostRequest({ invoiceId: IDS.invoice }))

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
  })
})
