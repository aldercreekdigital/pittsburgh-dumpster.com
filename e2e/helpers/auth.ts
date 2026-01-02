import { Page } from '@playwright/test'
import { TEST_ADMIN } from './database'

/**
 * Authentication helpers for E2E tests
 */

/**
 * Login as admin user via the UI
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Fill login form
  await page.fill('input[type="email"]', TEST_ADMIN.email)
  await page.fill('input[type="password"]', TEST_ADMIN.password)

  // Submit and wait for redirect
  await page.click('button[type="submit"]')

  // Wait for successful login - should redirect away from login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 })
}

/**
 * Login as admin and navigate to admin dashboard
 */
export async function loginAsAdminAndGoToDashboard(page: Page) {
  await loginAsAdmin(page)
  await page.goto('/admin')
  await page.waitForLoadState('networkidle')
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Click logout button if visible
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")')
  if (await logoutButton.isVisible()) {
    await logoutButton.click()
    await page.waitForURL('/')
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for logout button or user menu
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")')
  return await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)
}

/**
 * Create a new test user via signup flow
 */
export async function signupTestUser(page: Page, email: string, password: string, name?: string) {
  await page.goto('/signup')
  await page.waitForLoadState('networkidle')

  // Fill signup form
  if (name) {
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]')
    if (await nameInput.isVisible()) {
      await nameInput.fill(name)
    }
  }

  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)

  // Handle confirm password if present
  const confirmPassword = page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]')
  if (await confirmPassword.isVisible()) {
    await confirmPassword.fill(password)
  }

  // Submit
  await page.click('button[type="submit"]')

  // Wait for success (redirect or success message)
  await page.waitForTimeout(2000)
}
