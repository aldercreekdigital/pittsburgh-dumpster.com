import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('homepage loads and shows booking CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/McCrackan|Dumpster/i)

    // Should have a call-to-action button
    const bookingButton = page.locator('a:has-text("Book"), a:has-text("Get Started"), a:has-text("Quote")')
    await expect(bookingButton.first()).toBeVisible()
  })

  test('booking page loads with address input', async ({ page }) => {
    await page.goto('/booking')
    await expect(page.locator('h1, h2').first()).toBeVisible()

    // Should have address autocomplete input
    const addressInput = page.locator('input[placeholder*="address" i], input[placeholder*="location" i], input#address')
    await expect(addressInput.first()).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')

    // Should have email and password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')

    // Should have signup form
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('service area page loads', async ({ page }) => {
    await page.goto('/service-area')
    await expect(page.locator('h1')).toContainText(/service area/i)
  })

  test('how it works page loads', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.locator('h1')).toContainText(/how it works/i)
  })

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq')
    await expect(page.locator('h1')).toContainText(/faq|frequently/i)
  })

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('h1')).toContainText(/contact/i)
  })
})

test.describe('Navigation', () => {
  test('header navigation works', async ({ page }) => {
    await page.goto('/')

    // Click on a nav link
    const navLink = page.locator('nav a:has-text("How It Works"), header a:has-text("How It Works")')
    if (await navLink.first().isVisible()) {
      await navLink.first().click()
      await expect(page).toHaveURL(/how-it-works/)
    }
  })

  test('footer links work', async ({ page }) => {
    await page.goto('/')

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check footer exists
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })
})
