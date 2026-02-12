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
  getBookingDeclinedHtml: vi.fn().mockReturnValue('<html>declined</html>'),
}))

const { POST } = await import('@/app/api/admin/requests/[id]/decline/route')
const { getAdminUser } = await import('@/lib/admin/auth')

const declineRequest = BOOKING_REQUEST_ROW

describe('POST /api/admin/requests/[id]/decline', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when not admin', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { status } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(401)
  })

  it('returns 404 when booking request not found', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', { data: null, error: { code: 'PGRST116' } })

    const { status } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: 'nonexistent' }))
    )
    expect(status).toBe(404)
  })

  it('returns 400 when request is not pending', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', {
      data: { ...declineRequest, status: 'approved' },
    })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(400)
    expect(body.error).toMatch(/cannot decline/i)
  })

  it('declines request and updates quote status', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', { data: declineRequest })
    mockQuery(mockAdminClient, 'booking_requests', 'update', { data: null })
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({ reason: 'Fully booked' }), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('sends decline email to customer', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', { data: declineRequest })
    mockQuery(mockAdminClient, 'booking_requests', 'update', { data: null })
    mockQuery(mockAdminClient, 'quotes', 'update', { data: null })

    await POST(createPostRequest({ reason: 'Fully booked' }), createRouteParams({ id: IDS.bookingRequest }))

    const { sendEmail } = await import('@/lib/email/send')
    expect(sendEmail).toHaveBeenCalledOnce()
  })

  it('returns 500 when update fails', async () => {
    ;(getAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_USER)
    mockQuery(mockAdminClient, 'booking_requests', 'select', { data: declineRequest })
    mockQuery(mockAdminClient, 'booking_requests', 'update', { data: null, error: { message: 'fail' } })

    const { status, body } = await parseResponse(
      await POST(createPostRequest({}), createRouteParams({ id: IDS.bookingRequest }))
    )
    expect(status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
