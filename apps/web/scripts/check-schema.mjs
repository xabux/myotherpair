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
const { rows } = await client.query(`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
`);
const tables = {};
for (const r of rows) {
  (tables[r.table_name] = tables[r.table_name] || []).push(`${r.column_name} (${r.data_type})`);
}
for (const [t, cols] of Object.entries(tables)) {
  console.log(`\n${t}:\n  ${cols.join('\n  ')}`);
}
await client.end();
