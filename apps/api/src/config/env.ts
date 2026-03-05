const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  PORT: parseInt(process.env['PORT'] ?? '3001', 10),
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
} as const;
