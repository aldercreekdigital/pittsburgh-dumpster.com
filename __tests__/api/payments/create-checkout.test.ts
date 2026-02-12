import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../helpers/request'
import { IDS, INVOICE_ROW } from '../helpers/fixtures'

const mockAdminClient = createMockSupabaseClient()

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockAdminClient,
  DEFAULT_BUSINESS_ID: '00000000-0000-0000-0000-000000000001',
}))

const mockStripeCustomersCreate = vi.fn().mockResolvedValue({ id: 'cus_stripe_123' })
const mockStripeCheckoutCreate = vi.fn().mockResolvedValue({
  id: 'cs_test_123',
  url: 'https://checkout.stripe.com/test',
})

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    customers: { create: mockStripeCustomersCreate },
    checkout: { sessions: { create: mockStripeCheckoutCreate } },
  },
}))

const { POST } = await import('@/app/api/payments/create-checkout/route')

describe('POST /api/payments/create-checkout', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when invoiceId is missing', async () => {
    const { status, body } = await parseResponse(await POST(createPostRequest({})))
    expect(status).toBe(400)
    expect(body.error).toMatch(/invoice id/i)
  })

  it('returns 404 when invoice not found', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: null, error: { code: 'PGRST116' } })
    const { status, body } = await parseResponse(
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

  it('returns 400 when customer is missing', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', {
      data: { ...INVOICE_ROW, customer: null },
    })
    const { status, body } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/customer/i)
  })

  it('creates Stripe checkout with existing Stripe customer', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    mockQuery(mockAdminClient, 'stripe_customers', 'select', {
      data: { stripe_customer_id: 'cus_existing_123' },
    })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.checkoutUrl).toBe('https://checkout.stripe.com/test')
    expect(body.sessionId).toBe('cs_test_123')
    expect(mockStripeCustomersCreate).not.toHaveBeenCalled()
  })

  it('creates new Stripe customer when none exists', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    mockQuery(mockAdminClient, 'stripe_customers', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'stripe_customers', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(mockStripeCustomersCreate).toHaveBeenCalledOnce()
  })

  it('passes line items to Stripe checkout', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    mockQuery(mockAdminClient, 'stripe_customers', 'select', {
      data: { stripe_customer_id: 'cus_existing_123' },
    })
    mockQuery(mockAdminClient, 'invoices', 'update', { data: null })

    await POST(createPostRequest({ invoiceId: IDS.invoice }))

    const callArgs = mockStripeCheckoutCreate.mock.calls[0][0]
    expect(callArgs.line_items).toHaveLength(2)
    expect(callArgs.line_items[0].price_data.unit_amount).toBe(30000)
    expect(callArgs.metadata.invoice_id).toBe(IDS.invoice)
  })

  it('returns 500 when Stripe fails', async () => {
    mockQuery(mockAdminClient, 'invoices', 'select', { data: INVOICE_ROW })
    mockQuery(mockAdminClient, 'stripe_customers', 'select', {
      data: { stripe_customer_id: 'cus_existing_123' },
    })
    mockStripeCheckoutCreate.mockRejectedValueOnce(new Error('Stripe error'))

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ invoiceId: IDS.invoice }))
    )
    expect(status).toBe(500)
  })
})
