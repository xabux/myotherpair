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

// Check RLS status
const { rows: rls } = await client.query(`
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`);
console.log('\nRLS status:');
for (const r of rls) console.log(`  ${r.tablename}: ${r.rowsecurity ? 'ENABLED' : 'DISABLED'}`);

// Check policies
const { rows: policies } = await client.query(`
  SELECT tablename, policyname, cmd FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname
`);
console.log('\nPolicies:');
for (const r of policies) console.log(`  ${r.tablename}: "${r.policyname}" (${r.cmd})`);

await client.end();
