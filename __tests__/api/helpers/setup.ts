import { vi } from 'vitest'

// Environment variables needed by route handlers
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SECRET_KEY = 'test-secret-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
process.env.BUSINESS_NOTIFICATION_EMAIL = 'test@example.com'
process.env.RESEND_API_KEY = 'test-resend-key'

// Mock next/headers (cookies)
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))
