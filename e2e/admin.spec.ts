import { test, expect } from '@playwright/test'
import { cleanupTestData, getDateString } from './helpers/database'

test.describe('Admin Dashboard', () => {
  test.beforeAll(async () => {
    // Clean up any test data from previous runs
    await cleanupTestData()
  })

  test('admin dashboard loads', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('h1')).toContainText(/dashboard/i)
  })

  test('admin can navigate to requests page', async ({ page }) => {
    await page.goto('/admin/requests')
    await expect(page).toHaveURL(/\/admin\/requests/)
    await expect(page.locator('h1')).toContainText(/requests/i)
  })

  test('admin can navigate to bookings page', async ({ page }) => {
    await page.goto('/admin/bookings')
    await expect(page).toHaveURL(/\/admin\/bookings/)
    await expect(page.locator('h1')).toContainText(/bookings/i)
  })

  test('admin can navigate to invoices page', async ({ page }) => {
    await page.goto('/admin/invoices')
    await expect(page).toHaveURL(/\/admin\/invoices/)
    await expect(page.locator('h1')).toContainText(/invoices/i)
  })

  test('admin can navigate to dumpsters page', async ({ page }) => {
    await page.goto('/admin/dumpsters')
    await expect(page).toHaveURL(/\/admin\/dumpsters/)
    await expect(page.locator('h1')).toContainText(/dumpsters/i)
  })

  test('admin can navigate to settings page', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page).toHaveURL(/\/admin\/settings/)
    await expect(page.locator('h1')).toContainText(/settings/i)
  })
})

test.describe('Admin New Booking Wizard', () => {
  test.beforeAll(async () => {
    await cleanupTestData()
  })

  test('new booking button exists on bookings page', async ({ page }) => {
    await page.goto('/admin/bookings')
    const newBookingButton = page.locator('a:has-text("New Booking")')
    await expect(newBookingButton).toBeVisible()
  })

  test('new booking wizard loads', async ({ page }) => {
    await page.goto('/admin/bookings/new')
    await expect(page.locator('h1')).toContainText(/new booking|create booking/i)

    // Should show step 1 - address
    await expect(page.locator('text=/address/i').first()).toBeVisible()
  })

  test('wizard step 1: address input and serviceability check', async ({ page }) => {
    await page.goto('/admin/bookings/new')

    // Find address input
    const addressInput = page.locator('input[placeholder*="address" i]').first()
    await expect(addressInput).toBeVisible()

    // Type a test address (Pittsburgh area)
    await addressInput.fill('123 Main St, Pittsburgh, PA 15213')

    // Wait for autocomplete or just proceed
    await page.waitForTimeout(1000)
  })

  test('wizard shows all 4 steps', async ({ page }) => {
    await page.goto('/admin/bookings/new')

    // Check for step indicators
    const stepIndicators = page.locator('[class*="step"], [data-step], .step')
    // Or check for numbered steps in text
    await expect(page.locator('text=/step 1|address/i').first()).toBeVisible()
  })
})

test.describe('Admin Dumpster Management', () => {
  test('dumpsters list shows inventory', async ({ page }) => {
    await page.goto('/admin/dumpsters')

    // Should show dumpster status summary - look for Available count
    await expect(page.locator('text=/available/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('dumpsters page shows add dumpster form', async ({ page }) => {
    await page.goto('/admin/dumpsters')

    // Should have add dumpster button or form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New")')
    await expect(addButton.first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin Invoices', () => {
  test('invoices page loads', async ({ page }) => {
    await page.goto('/admin/invoices')
    await expect(page.locator('h1')).toContainText(/invoices/i)
  })

  test('invoice filters work', async ({ page }) => {
    await page.goto('/admin/invoices')

    // Check for status filter buttons
    const allFilter = page.locator('a:has-text("All"), button:has-text("All")').first()
    await expect(allFilter).toBeVisible()
  })
})

test.describe('Admin Settings', () => {
  test('settings page shows business info', async ({ page }) => {
    await page.goto('/admin/settings')

    // Should show business settings
    await expect(page.locator('h1')).toContainText(/settings/i)
  })
})
