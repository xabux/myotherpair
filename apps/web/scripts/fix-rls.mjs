import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../api/.env');
const envVars = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const [k, ...rest] = line.split('=');
  if (k && rest.length) envVars[k.trim()] = rest.join('=').trim();
}
const client = new pg.Client({ connectionString: envVars['DATABASE_URL'] });
await client.connect();

const fixes = [
  // Allow new users to insert their own row after signup
  `DO $$ BEGIN
    CREATE POLICY "users: owner insert" ON users
      FOR INSERT WITH CHECK (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  // Allow users to delete their own row (optional, for account deletion)
  `DO $$ BEGIN
    CREATE POLICY "users: owner delete" ON users
      FOR DELETE USING (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  // admins: authenticated users can read (needed for auth guard)
  `DO $$ BEGIN
    CREATE POLICY "admins: authenticated read" ON admins
      FOR SELECT USING (auth.role() = 'authenticated');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
];

console.log('\n🔒 Applying missing RLS policies...\n');
for (const sql of fixes) {
  try {
    await client.query(sql);
    const match = sql.match(/"([^"]+)"/);
    console.log(`  ✅ ${match ? match[1] : 'policy applied'}`);
  } catch (err) {
    console.error(`  ❌ ${err.message}`);
  }
}
await client.end();
console.log('\n✅ Done.\n');
