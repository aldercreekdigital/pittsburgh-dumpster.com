import Stripe from 'stripe'

// Create Stripe client for server-side operations
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Webhook signing secret for verifying Stripe events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

// Helper to format cents to dollars for display
export function formatCentsToDollars(cents: number): string {
  return (cents / 100).toFixed(2)
}

// Helper to format as currency string
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
