/**
 * Global setup: ensures a test user exists in Supabase (bypasses email OTP),
 * signs in, and saves the auth state for all tests.
 */
import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const SUPABASE_URL      = 'https://srykmrouuegthtcwsndu.supabase.co';
const SERVICE_ROLE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeWttcm91dWVndGh0Y3dzbmR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU0ODczMywiZXhwIjoyMDg4MTI0NzMzfQ.z0WhLxfmk05iYaqDnBHpN6BUMt92yn5u5eSyh4_GJTI';
const ANON_KEY          = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeWttcm91dWVndGh0Y3dzbmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDg3MzMsImV4cCI6MjA4ODEyNDczM30.AmGgu66TES7oeTiw6Xd7bZX3vIxiA3GhtTQkTMfxVSA';

export const TEST_EMAIL    = 'e2e-test@myotherpair.dev';
export const TEST_PASSWORD = 'TestE2E!99x';
export const TEST_NAME     = 'E2E Tester';
export const AUTH_FILE     = path.join(__dirname, '.auth/user.json');

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

setup('create test user and save auth state', async ({ page }) => {
  // ── 1. Ensure the test user exists ────────────────────────────────────────
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === TEST_EMAIL);

  let userId: string;

  if (!found) {
    const { data, error } = await admin.auth.admin.createUser({
      email:          TEST_EMAIL,
      password:       TEST_PASSWORD,
      email_confirm:  true,       // bypass OTP
      user_metadata:  { full_name: TEST_NAME },
    });
    if (error || !data?.user) throw new Error(`Could not create test user: ${error?.message}`);
    userId = data.user.id;

    // Mirror into public users table
    await admin.from('users').upsert({
      id:              userId,
      email:           TEST_EMAIL,
      name:            TEST_NAME,
      location:        'London, United Kingdom',
      foot_size_left:  9,
      foot_size_right: 10,
      is_amputee:      false,
    });
    console.log('✓ Created test user', TEST_EMAIL);
  } else {
    userId = found.id;
    console.log('✓ Reusing existing test user', TEST_EMAIL);
  }

  // ── 2. Sign in via the UI so Playwright captures cookies / localStorage ──
  await page.goto('/login');
  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  // Should land on /app
  await expect(page).toHaveURL(/\/app/, { timeout: 15000 });

  // ── 3. Save auth state ────────────────────────────────────────────────────
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
  console.log('✓ Auth state saved');
});
