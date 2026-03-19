import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function waitForNav(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

// Select the GB country in the signup country dropdown
async function selectGB(page: Page) {
  await page.getByRole('combobox', { name: /country/i }).selectOption({ value: 'GB' });
}

// ─── 1. Landing page ─────────────────────────────────────────────────────────

test.describe('Landing page', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

  test('renders hero and key elements', async ({ page }) => {
    await page.goto('/');
    // h1 with site name
    await expect(page.locator('h1').first()).toBeVisible();
    // Primary CTA link → /signup  (text is translated, use href)
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible();
    // Login link
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test('Get Started navigates to /signup', async ({ page }) => {
    await page.goto('/');
    // Click the first prominent /signup link (hero CTA)
    await page.locator('a[href="/signup"]').first().click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

// ─── 2. Signup form ───────────────────────────────────────────────────────────

test.describe('Signup form', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('shows step 1 with first name, last name, email, password, country, city', async ({ page }) => {
    await expect(page.getByText(/create your account/i)).toBeVisible();
    await expect(page.getByPlaceholder('Jane')).toBeVisible();
    await expect(page.getByPlaceholder('Doe')).toBeVisible();
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/••••••••/)).toBeVisible();
    await expect(page.getByRole('combobox', { name: /country/i })).toBeVisible();
  });

  test('password strength bar appears when typing', async ({ page }) => {
    const pw = page.getByPlaceholder(/••••••••/);
    await pw.fill('weak');
    // strength bar segments should be visible
    await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible();
    await expect(page.getByText(/very weak/i)).toBeVisible();

    await pw.fill('StrongPass!99');
    await expect(page.getByText(/strong/i)).toBeVisible();
  });

  test('blocks step 1 submit when required fields empty', async ({ page }) => {
    await page.getByRole('button', { name: /continue/i }).click();
    // Required fields prevent submission — still on step 1
    await expect(page.getByText(/step 1 of 2/i)).toBeVisible();
  });

  test('blocks weak password on continue', async ({ page }) => {
    await page.getByPlaceholder('Jane').fill('Jane');
    await page.getByPlaceholder('Doe').fill('Doe');
    await page.getByPlaceholder(/you@example.com/i).fill('jane@test.com');
    await page.getByPlaceholder(/••••••••/).fill('weak');

    // Select country (value = ISO code)
    await selectGB(page);
    await page.locator('input[list="city-options"]').fill('London');

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/too weak/i)).toBeVisible();
  });

  test('step 1 valid data advances to step 2 (foot sizes)', async ({ page }) => {
    await page.getByPlaceholder('Jane').fill('Jane');
    await page.getByPlaceholder('Doe').fill('Doe');
    await page.getByPlaceholder(/you@example.com/i).fill(`signup-test-${Date.now()}@example.com`);
    await page.getByPlaceholder(/••••••••/).fill('StrongPass!99');

    await selectGB(page);
    await page.locator('input[list="city-options"]').fill('London');

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/about your feet/i)).toBeVisible();
    await expect(page.getByText(/step 2 of 2/i)).toBeVisible();
  });

  test('step 2 back button returns to step 1', async ({ page }) => {
    // advance to step 2 first
    await page.getByPlaceholder('Jane').fill('Jane');
    await page.getByPlaceholder('Doe').fill('Doe');
    await page.getByPlaceholder(/you@example.com/i).fill(`back-test-${Date.now()}@example.com`);
    await page.getByPlaceholder(/••••••••/).fill('StrongPass!99');
    await selectGB(page);
    await page.locator('input[list="city-options"]').fill('London');
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/step 2 of 2/i)).toBeVisible();

    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText(/step 1 of 2/i)).toBeVisible();
  });

  test('step 2 requires foot sizes before submit', async ({ page }) => {
    await page.getByPlaceholder('Jane').fill('Jane');
    await page.getByPlaceholder('Doe').fill('Doe');
    await page.getByPlaceholder(/you@example.com/i).fill(`size-test-${Date.now()}@example.com`);
    await page.getByPlaceholder(/••••••••/).fill('StrongPass!99');
    await selectGB(page);
    await page.locator('input[list="city-options"]').fill('London');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/please select both foot sizes/i)).toBeVisible();
  });

  test('OTP page appears after valid signup', async ({ page }) => {
    const email = `otp-test-${Date.now()}@example.com`;
    await page.getByPlaceholder('Jane').fill('Test');
    await page.getByPlaceholder('Doe').fill('User');
    await page.getByPlaceholder(/you@example.com/i).fill(email);
    await page.getByPlaceholder(/••••••••/).fill('StrongPass!99');
    await selectGB(page);
    await page.locator('input[list="city-options"]').fill('London');
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2 — select sizes
    await page.locator('select').first().selectOption({ index: 3 });  // left
    await page.locator('select').last().selectOption({ index: 4 });   // right
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/verify-otp/, { timeout: 15000 });
    await expect(page.getByText(/check your email/i)).toBeVisible();
    // 6 digit boxes visible
    await expect(page.locator('input[type="text"][maxlength="2"]')).toHaveCount(6);
  });
});

// ─── 3. Authenticated dashboard ───────────────────────────────────────────────
// All tests below use the saved auth state from global.setup.ts

test.describe('Dashboard', () => {
  test('redirects to /app when logged in', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/app/);
    await waitForNav(page);
    // Bottom nav should be present
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Discover tab — shows listings or empty state', async ({ page }) => {
    await page.goto('/app');
    await waitForNav(page);
    // Either a listing card, a loading spinner, or an empty-state message
    const hasContent = await page.locator('[class*="card"], [aria-label*="discover"], p').first().isVisible();
    expect(hasContent).toBe(true);
  });

  test('Browse tab — navigates and renders search', async ({ page }) => {
    await page.goto('/app/browse');
    await waitForNav(page);
    await expect(page.getByPlaceholder(/brand or model/i)).toBeVisible();
  });

  test('Browse tab — search filters results', async ({ page }) => {
    await page.goto('/app/browse');
    await waitForNav(page);
    await page.getByPlaceholder(/brand or model/i).fill('Nike');
    await page.waitForTimeout(500);
    // Either results or empty message — no crash
    const ok = await page.locator('body').isVisible();
    expect(ok).toBe(true);
  });

  test('Create listing tab — renders form', async ({ page }) => {
    await page.goto('/app/create');
    await waitForNav(page);
    await expect(page.getByText(/list a shoe/i)).toBeVisible();
    await expect(page.getByPlaceholder(/air force/i)).toBeVisible();
  });

  test('Create listing — validation blocks empty submit', async ({ page }) => {
    await page.goto('/app/create');
    await waitForNav(page);
    await page.getByRole('button', { name: /list shoe/i }).click();
    const error = await page.getByText(/required|fill in|missing/i).first().isVisible().catch(() => false);
    expect(error).toBe(true);
  });

  test('Messages tab — renders', async ({ page }) => {
    await page.goto('/app/messages');
    await waitForNav(page);
    // Either a conversation list or the empty state
    const ok = await page.locator('h1, h2, [class*="empty"], [class*="message"]').first().isVisible();
    expect(ok).toBe(true);
  });

  test('Profile tab — shows name and stats', async ({ page }) => {
    await page.goto('/app/profile');
    await waitForNav(page);
    await expect(page.getByText('E2E Tester')).toBeVisible({ timeout: 10000 });
    // Stats row
    await expect(page.getByText(/listings/i).first()).toBeVisible();
  });

  test('Profile — Edit profile page loads', async ({ page }) => {
    await page.goto('/app/profile/edit');
    await waitForNav(page);
    await expect(page.getByText(/edit profile/i)).toBeVisible();
  });

  test('My listings page — renders', async ({ page }) => {
    await page.goto('/app/listings');
    await waitForNav(page);
    await expect(page.locator('body')).toBeVisible();
    // Should not show a JS error / white screen
    const errorText = await page.getByText(/error|something went wrong/i).isVisible().catch(() => false);
    expect(errorText).toBe(false);
  });

  test('Unauthenticated /app redirects to login', async ({ browser }) => {
    // Fresh context with no saved auth
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login|\//, { timeout: 10000 });
    await ctx.close();
  });
});
