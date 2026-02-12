import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockQuery } from '../../helpers/mock-supabase'
import { createPostRequest, parseResponse } from '../../helpers/request'
import { IDS, MOCK_ADMIN_USER, PRICING_RULE, SERVICE_AREA_POLYGON } from '../../helpers/fixtures'

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

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return { ...actual, randomUUID: () => 'random-uuid-token' }
})

const { POST } = await import('@/app/api/admin/bookings/create/route')
const { getAdminUser } = await import('@/lib/admin/auth')

// Use future dates to avoid validation errors
const futureDate = new Date()
futureDate.setDate(futureDate.getDate() + 7)
const dropoff = futureDate.toISOString().split('T')[0]
const pickupD = new Date(futureDate)
pickupD.setDate(pickupD.getDate() + 7)
const pickup = pickupD.toISOString().split('T')[0]

const validBody = {
  address: {
    full_address: '123 Main St, Pittsburgh, PA 15213',
    street: '123 Main St',
    city: 'Pittsburgh',
    state: 'PA',
    zip: '15213',
    lat: 40.4406,
    lng: -79.9959,
  },
  dumpster_size: 10,
  waste_type: 'construction_debris',
  dropoff_date: dropoff,
  pickup_date: pickup,
  customer: {
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '412-555-0100',
  },
}

describe('POST /api/admin/bookings/create', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { status } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(401)
  })

  it('returns 400 when required fields are missing', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    const { status, body } = await parseResponse(
      await POST(createPostRequest({ address: {}, customer: {} }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/missing required/i)
  })

  it('returns 400 when address is outside service area', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'service_areas', 'select', {
      data: [{ polygon: SERVICE_AREA_POLYGON }],
    })

    const outOfArea = {
      ...validBody,
      address: { ...validBody.address, lat: 41.0, lng: -75.0 },
    }
    const { status, body } = await parseResponse(await POST(createPostRequest(outOfArea)))
    expect(status).toBe(400)
    expect(body.error).toMatch(/outside service area/i)
  })

  it('returns 400 when pricing rule not found', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'service_areas', 'select', {
      data: [{ polygon: SERVICE_AREA_POLYGON }],
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(400)
    expect(body.error).toMatch(/pricing rule/i)
  })

  it('creates full booking flow for new customer', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'service_areas', 'select', {
      data: [{ polygon: SERVICE_AREA_POLYGON }],
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: PRICING_RULE })
    // No existing customer
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    // Create customer
    mockQuery(mockAdminClient, 'customers', 'insert', { data: { id: IDS.customer } })
    // Create address
    mockQuery(mockAdminClient, 'addresses', 'insert', { data: { id: IDS.address } })
    // Create quote
    mockQuery(mockAdminClient, 'quotes', 'insert', { data: { id: IDS.quote } })
    // Quote line items
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    // Booking request
    mockQuery(mockAdminClient, 'booking_requests', 'insert', { data: { id: IDS.bookingRequest } })
    // Invoice number
    mockQuery(mockAdminClient, 'invoices', 'select', { data: null, error: { code: 'PGRST116' } })
    // Create invoice
    mockQuery(mockAdminClient, 'invoices', 'insert', { data: { id: IDS.invoice, invoice_number: '1001' } })
    // Invoice line items
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.bookingRequestId).toBe(IDS.bookingRequest)
    expect(body.invoiceId).toBe(IDS.invoice)
  })

  it('uses existing customer when found', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'service_areas', 'select', {
      data: [{ polygon: SERVICE_AREA_POLYGON }],
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: PRICING_RULE })
    // Existing customer with account
    mockQuery(mockAdminClient, 'customers', 'select', {
      data: { id: IDS.customer, user_id: IDS.user, name: 'Old Name', phone: '412-000-0000' },
    })
    // Update customer
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })
    // Address
    mockQuery(mockAdminClient, 'addresses', 'insert', { data: { id: IDS.address } })
    // Quote
    mockQuery(mockAdminClient, 'quotes', 'insert', { data: { id: IDS.quote } })
    // Line items
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    // Booking request
    mockQuery(mockAdminClient, 'booking_requests', 'insert', { data: { id: IDS.bookingRequest } })
    // Invoice number
    mockQuery(mockAdminClient, 'invoices', 'select', { data: { invoice_number: '1010' } })
    // Invoice
    mockQuery(mockAdminClient, 'invoices', 'insert', { data: { id: IDS.invoice, invoice_number: '1011' } })
    // Invoice line items
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.customerHasAccount).toBe(true)
  })

  it('returns 500 when customer creation fails', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'service_areas', 'select', {
      data: [{ polygon: SERVICE_AREA_POLYGON }],
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: PRICING_RULE })
    mockQuery(mockAdminClient, 'customers', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'customers', 'insert', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(await POST(createPostRequest(validBody)))
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })

  it('sends email after booking creation', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'service_areas', 'select', {
      data: [{ polygon: SERVICE_AREA_POLYGON }],
    })
    mockQuery(mockAdminClient, 'pricing_rules', 'select', { data: PRICING_RULE })
    mockQuery(mockAdminClient, 'customers', 'select', {
      data: { id: IDS.customer, user_id: IDS.user, name: 'Test', phone: '555' },
    })
    mockQuery(mockAdminClient, 'customers', 'update', { data: null })
    mockQuery(mockAdminClient, 'addresses', 'insert', { data: { id: IDS.address } })
    mockQuery(mockAdminClient, 'quotes', 'insert', { data: { id: IDS.quote } })
    for (let i = 0; i < 5; i++) mockQuery(mockAdminClient, 'quote_line_items', 'insert', { data: null })
    mockQuery(mockAdminClient, 'booking_requests', 'insert', { data: { id: IDS.bookingRequest } })
    mockQuery(mockAdminClient, 'invoices', 'select', { data: null, error: { code: 'PGRST116' } })
    mockQuery(mockAdminClient, 'invoices', 'insert', { data: { id: IDS.invoice, invoice_number: '1001' } })
    for (let i = 0; i < 5; i++) mockQuery(mockAdminClient, 'invoice_line_items', 'insert', { data: null })

    await POST(createPostRequest(validBody))

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
  })
})
