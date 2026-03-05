import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// Dev-only connection test
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  supabase.from('users').select('count').limit(1).then(({ error }) => {
    if (error) {
      console.warn('[Supabase] Connection failed:', error.message);
    } else {
      console.log('[Supabase] Connected successfully');
    }
  });
}
