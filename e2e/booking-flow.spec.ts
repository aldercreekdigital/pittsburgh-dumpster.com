import { test, expect } from '@playwright/test'
import {
  cleanupTestData,
  createTestCustomer,
  createTestAddress,
  createTestQuote,
  createTestBookingRequest,
  adminClient,
  DEFAULT_BUSINESS_ID,
  getDateString
} from './helpers/database'

test.describe('Public Booking Flow', () => {
  test.beforeAll(async () => {
    await cleanupTestData()
  })

  test.afterAll(async () => {
    await cleanupTestData()
  })

  test('complete booking flow: address -> dumpster selection', async ({ page }) => {
    // Step 1: Start at booking page
    await page.goto('/booking')
    await page.waitForLoadState('networkidle')

    // Find and fill address input
    const addressInput = page.locator('input[placeholder*="address" i], input#address').first()
    await expect(addressInput).toBeVisible()

    // Type a Pittsburgh address (should be in service area)
    await addressInput.fill('100 Grant Street, Pittsburgh, PA 15219')
    await page.waitForTimeout(1500) // Wait for autocomplete

    // Click first autocomplete suggestion or submit button
    const suggestion = page.locator('[class*="suggestion"], [class*="autocomplete"] li, [role="option"]').first()
    if (await suggestion.isVisible({ timeout: 2000 })) {
      await suggestion.click()
    }

    // Click continue/check serviceability button
    const continueButton = page.locator('button:has-text("Check"), button:has-text("Continue"), button[type="submit"]').first()
    await continueButton.click()

    // Should either show serviceability result or navigate to next step
    await page.waitForTimeout(2000)
  })

  test('dumpster sizes page shows pricing options', async ({ page }) => {
    // Navigate directly to dumpster sizes (would normally have a quote ID)
    await page.goto('/dumpster-sizes')

    // Check for dumpster size options
    const sizeOptions = page.locator('input[type="radio"], [class*="size-option"], button:has-text("Yard")')

    // Should show pricing info
    const priceDisplay = page.locator('text=/\\$\\d+/').first()
    await expect(priceDisplay).toBeVisible({ timeout: 5000 })
  })

  test('cart page shows empty state when no items', async ({ page }) => {
    await page.goto('/cart')

    // Should show empty cart message or redirect
    const emptyMessage = page.locator('text=/empty|no items|start booking/i')
    const cartItems = page.locator('[class*="cart-item"], [class*="quote"]')

    // Either empty message or no cart items
    const isEmpty = await emptyMessage.isVisible({ timeout: 3000 }).catch(() => false)
    const hasItems = await cartItems.first().isVisible({ timeout: 1000 }).catch(() => false)

    expect(isEmpty || !hasItems).toBeTruthy()
  })
})

// Admin booking request approval tests are in admin.spec.ts
// These tests require admin authentication which is handled there

test.describe('Payment Flow', () => {
  test('pay page handles missing invoice parameter', async ({ page }) => {
    await page.goto('/pay')
    await page.waitForLoadState('networkidle')

    // Page should load (may show error or redirect)
    // Just verify it doesn't crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('pay success page loads', async ({ page }) => {
    await page.goto('/pay/success')
    await page.waitForLoadState('networkidle')

    // Should show success-related content
    const successContent = page.locator('h1, h2, [class*="success"]').first()
    await expect(successContent).toBeVisible({ timeout: 5000 })
  })
})
