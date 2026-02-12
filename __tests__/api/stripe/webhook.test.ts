import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../helpers/mock-supabase'
import { createRawPostRequest, parseResponse } from '../helpers/request'
import { IDS, INVOICE_ROW } from '../helpers/fixtures'
import type Stripe from 'stripe'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  getPaymentConfirmationHtml: vi.fn().mockReturnValue('<html>confirmed</html>'),
}))

const mockConstructEvent = vi.fn()
const mockRetrievePaymentIntent = vi.fn()

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
    paymentIntents: { retrieve: mockRetrievePaymentIntent },
  },
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
}))

const { POST } = await import('@/app/api/stripe/webhook/route')

function makeCheckoutEvent(invoiceId: string): Stripe.Event {
  return {
    id: 'evt_test_123',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        payment_intent: 'pi_test_123',
        customer: 'cus_test_123',
        amount_total: 42500,
        metadata: { invoice_id: invoiceId },
      },
    },
  } as unknown as Stripe.Event
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = createRawPostRequest('{}', {})
    const { status, body } = await parseResponse(await POST(req))
    expect(status).toBe(400)
    expect(body.error).toMatch(/stripe-signature/i)
  })

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('invalid sig') })
    const req = createRawPostRequest('{}', { 'stripe-signature': 'bad_sig' })
    const { status, body } = await parseResponse(await POST(req))
    expect(status).toBe(400)
    expect(body.error).toMatch(/verification failed/i)
  })

  it('handles checkout.session.completed - marks paid and creates booking', async () => {
    const event = makeCheckoutEvent(IDS.invoice)
    mockConstructEvent.mockReturnValue(event)
    mockRetrievePaymentIntent.mockResolvedValue({ payment_method: 'pm_test_123' })

    // Invoice lookup
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    // Mark paid
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })
    // Payment record
    mockQuery(mockAdminClient, 'payments', 'insert', { data: null })
    // Create booking
    mockQuery(mockAdminClient, 'bookings', 'insert', { data: { id: IDS.booking } })
    // Link booking
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })
    // Save payment method
    mockQuery(mockAdminClient, 'stripe_customers', 'update', { data: null })

    const req = createRawPostRequest('{}', { 'stripe-signature': 'valid_sig' })
    const { status, body } = await parseResponse(await POST(req))
    expect(status).toBe(200)
    expect(body.received).toBe(true)
  })

  it('handles payment_intent.succeeded without error', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_456' } },
    })

    const req = createRawPostRequest('{}', { 'stripe-signature': 'valid_sig' })
    const { status, body } = await parseResponse(await POST(req))
    expect(status).toBe(200)
    expect(body.received).toBe(true)
  })

  it('handles payment_intent.payment_failed without error', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_test_789' } },
    })

    const req = createRawPostRequest('{}', { 'stripe-signature': 'valid_sig' })
    const { status, body } = await parseResponse(await POST(req))
    expect(status).toBe(200)
    expect(body.received).toBe(true)
  })

  it('handles unrecognized event type gracefully', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.created',
      data: { object: {} },
    })

    const req = createRawPostRequest('{}', { 'stripe-signature': 'valid_sig' })
    const { status, body } = await parseResponse(await POST(req))
    expect(status).toBe(200)
    expect(body.received).toBe(true)
  })

  it('sends confirmation email after successful payment', async () => {
    const event = makeCheckoutEvent(IDS.invoice)
    mockConstructEvent.mockReturnValue(event)
    mockRetrievePaymentIntent.mockResolvedValue({ payment_method: 'pm_test_123' })

    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })
    mockQuery(mockAdminClient, 'payments', 'insert', { data: null })
    mockQuery(mockAdminClient, 'bookings', 'insert', { data: { id: IDS.booking } })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })
    mockQuery(mockAdminClient, 'stripe_customers', 'update', { data: null })

    const req = createRawPostRequest('{}', { 'stripe-signature': 'valid_sig' })
    await POST(req)

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
  })
})
