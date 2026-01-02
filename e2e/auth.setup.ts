import { test as setup, expect } from '@playwright/test'
import { TEST_ADMIN } from './helpers/database'

const authFile = 'e2e/.auth/admin.json'

setup('authenticate as admin', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Fill login form
  await page.fill('input[type="email"]', TEST_ADMIN.email)
  await page.fill('input[type="password"]', TEST_ADMIN.password)

  // Submit
  await page.click('button[type="submit"]')

  // Wait for successful login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 })

  // Save signed-in state
  await page.context().storageState({ path: authFile })
})
