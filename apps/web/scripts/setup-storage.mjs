// Run once: node apps/web/scripts/setup-storage.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://srykmrouuegthtcwsndu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeWttcm91dWVndGh0Y3dzbmR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU0ODczMywiZXhwIjoyMDg4MTI0NzMzfQ.z0WhLxfmk05iYaqDnBHpN6BUMt92yn5u5eSyh4_GJTI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function createBucket(name) {
  const { error } = await supabase.storage.createBucket(name, { public: true });
  if (error && !error.message.includes('already exists')) {
    console.error(`  ❌ Failed to create bucket "${name}":`, error.message);
    return false;
  }
  console.log(`  ✅ Bucket "${name}" ready`);
  return true;
}

async function main() {
  console.log('\n📦 Setting up Supabase Storage buckets...\n');
  await createBucket('shoe-images');
  await createBucket('avatars');
  console.log('\n✅ Storage setup complete.\n');
  console.log('Storage policies (RLS on storage.objects) should be applied via SQL.');
  console.log('Run the policies from apps/web/supabase/schema.sql in the Supabase SQL editor.\n');
}

main().catch(console.error);
