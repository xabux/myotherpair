import 'dotenv/config';
import { env } from './config/env.js';
import { testDbConnection } from './db/client.js';
import app from './app.js';

async function main() {
  await testDbConnection();

  app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
