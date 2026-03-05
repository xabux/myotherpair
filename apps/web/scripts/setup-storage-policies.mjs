// Run once: node apps/web/scripts/setup-storage-policies.mjs
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from apps/api/.env
const envPath = path.resolve(__dirname, '../../api/.env');
const envVars = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const [k, ...rest] = line.split('=');
  if (k && rest.length) envVars[k.trim()] = rest.join('=').trim();
}

const DATABASE_URL = envVars['DATABASE_URL'];
if (!DATABASE_URL) { console.error('DATABASE_URL not found'); process.exit(1); }

const client = new pg.Client({ connectionString: DATABASE_URL });

const policies = [
  // shoe-images
  `DO $$ BEGIN
    CREATE POLICY "shoe-images: authenticated read"
      ON storage.objects FOR SELECT USING (bucket_id = 'shoe-images' AND auth.role() = 'authenticated');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `DO $$ BEGIN
    CREATE POLICY "shoe-images: owner upload"
      ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'shoe-images' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `DO $$ BEGIN
    CREATE POLICY "shoe-images: owner delete"
      ON storage.objects FOR DELETE USING (
        bucket_id = 'shoe-images' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  // avatars
  `DO $$ BEGIN
    CREATE POLICY "avatars: public read"
      ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `DO $$ BEGIN
    CREATE POLICY "avatars: owner upload"
      ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `DO $$ BEGIN
    CREATE POLICY "avatars: owner delete"
      ON storage.objects FOR DELETE USING (
        bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
];

await client.connect();
console.log('\n🔒 Applying storage policies...\n');
for (const sql of policies) {
  try {
    await client.query(sql);
    const match = sql.match(/"([^"]+)"/);
    console.log(`  ✅ ${match ? match[1] : 'policy applied'}`);
  } catch (err) {
    console.error(`  ❌ ${err.message}`);
  }
}
await client.end();
console.log('\n✅ Storage policies applied.\n');
